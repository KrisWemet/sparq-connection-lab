const fs = require('fs');
const path = require('path');

// Extract API key from .env.local
const envLocalPath = path.join(__dirname, 'supabase', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const openRouterApiKeyMatch = envContent.match(/OPENROUTER_API_KEY=(.*)/);
const openRouterApiKey = openRouterApiKeyMatch ? openRouterApiKeyMatch[1].trim() : null;

if (!openRouterApiKey) {
  console.error("❌ Could not find OPENROUTER_API_KEY in supabase/.env.local");
  process.exit(1);
}

// Mock User Profile & Response
const currentProfile = `
- Attachment Style: 70% Anxious, 30% Secure.
- Love Language: Words of Affirmation, Quality Time.
- Current Status: Married 5 years.
- Recent themes: Feeling a bit stressed at work, missing connection time with partner.
`;

const latestResponse = "I had a really long day at work today and honestly just feel exhausted. My partner made dinner which was nice, but we barely talked because I was so spaced out.";

console.log("=========================================");
console.log("🧠 Sparq AI Engine Test (OpenRouter/Haiku)");
console.log("=========================================");
console.log("👤 CURRENT PROFILE:\n" + currentProfile.trim());
console.log("\n💬 LATEST USER RESPONSE:\n\"" + latestResponse + "\"");
console.log("\n⏳ Generating Daily Insight (calling AI)...");

const systemPrompt = `You are a warm, friendly companion. Keep all output at a 4th-grade reading level. Do not use any clinical or psychological terms.`;

const combinedPrompt = `
Current Profile:
${currentProfile.trim() || 'No profile yet.'}

Latest Response:
"${latestResponse}"

Please do three things:
1. Update their profile based on their new response. Keep it simple and focused on their likes, dislikes, feelings, and daily experiences.
2. Create a new question for tomorrow. It should be simple, friendly, and related to what you've learned about them.
3. Suggest a small, easy "Tonight Action" they can do right now to feel good or relax based on their response.

Return your answer EXACTLY as a JSON object with this format (no other text, no markdown block):
{
  "updatedProfile": "...",
  "tomorrowQuestion": "...",
  "tonightAction": "..."
}
`;

async function testEngine() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparqconnection.com', 
        'X-Title': 'Sparq Connection Lab' 
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: combinedPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    const aiData = await response.json();
    const aiText = aiData.choices[0].message.content;

    let parsedResult;
    try {
      const jsonStr = aiText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("❌ Failed to parse AI response:", aiText);
      return;
    }

    console.log("\n✅ AI GENERATED INSIGHT:");
    console.log("=========================================");
    console.log("📈 UPDATED PROFILE:");
    console.log(parsedResult.updatedProfile);
    console.log("\n❓ TOMORROW'S QUESTION:");
    console.log(parsedResult.tomorrowQuestion);
    console.log("\n🌙 TONIGHT'S ACTION:");
    console.log(parsedResult.tonightAction);
    console.log("=========================================\n");

  } catch (error) {
    console.error("❌ Error running AI engine:", error);
  }
}

testEngine();
