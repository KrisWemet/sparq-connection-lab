# Daily Question System - Initial Data Set

## Overview
This document provides the initial set of questions and mini-challenges for the "Adventure & Fun" category, structured according to the `DataStructures.pseudo.md` specification.

## Category Definition

```pseudocode
DEFINE QuestionCategory {
    id: "adventure_fun",
    name: "Adventure & Fun",
    description: "Explore spontaneity, joy, and shared experiences.",
    icon: "🎉" // Example icon
}
```

## Questions (`daily_questions` table)

### Light (Order 1-10)
```pseudocode
DEFINE Question { id: "af_l_001", category_id: "adventure_fun", text: "What's one small, spontaneous thing we could do together this week?", level: 'Light', order: 1 }
DEFINE Question { id: "af_l_002", category_id: "adventure_fun", text: "If we could go anywhere nearby for a fun hour, where would you choose?", level: 'Light', order: 2 }
DEFINE Question { id: "af_l_003", category_id: "adventure_fun", text: "What's a simple game (board game, card game, silly game) you enjoy?", level: 'Light', order: 3 }
DEFINE Question { id: "af_l_004", category_id: "adventure_fun", text: "Share a funny meme or video you saw recently.", level: 'Light', order: 4 }
DEFINE Question { id: "af_l_005", category_id: "adventure_fun", text: "What kind of music instantly puts you in a good mood?", level: 'Light', order: 5 }
DEFINE Question { id: "af_l_006", category_id: "adventure_fun", text: "If we had a 'fun snack' budget today, what treat would you pick?", level: 'Light', order: 6 }
DEFINE Question { id: "af_l_007", category_id: "adventure_fun", text: "What's something that made you laugh recently?", level: 'Light', order: 7 }
DEFINE Question { id: "af_l_008", category_id: "adventure_fun", text: "Describe a perfect lazy Sunday morning.", level: 'Light', order: 8 }
DEFINE Question { id: "af_l_009", category_id: "adventure_fun", text: "What outdoor activity sounds appealing right now (even just sitting outside)?", level: 'Light', order: 9 }
DEFINE Question { id: "af_l_010", category_id: "adventure_fun", text: "If we could learn a fun, simple skill together (like juggling 2 balls), what would be amusing?", level: 'Light', order: 10 }
```

### Medium (Order 11-25)
```pseudocode
DEFINE Question { id: "af_m_011", category_id: "adventure_fun", text: "What's an adventure (big or small) you've always wanted to try?", level: 'Medium', order: 11 }
DEFINE Question { id: "af_m_012", category_id: "adventure_fun", text: "Describe a time you felt truly playful or carefree.", level: 'Medium', order: 12 }
DEFINE Question { id: "af_m_013", category_id: "adventure_fun", text: "If we planned a 'mystery date' for each other, what's one hint you'd give for yours?", level: 'Medium', order: 13 }
DEFINE Question { id: "af_m_014", category_id: "adventure_fun", text: "What kind of 'fun' is most rejuvenating for you (e.g., social fun, creative fun, relaxing fun)?", level: 'Medium', order: 14 }
DEFINE Question { id: "af_m_015", category_id: "adventure_fun", text: "What's a hobby or interest you'd like to explore more, just for fun?", level: 'Medium', order: 15 }
DEFINE Question { id: "af_m_016", category_id: "adventure_fun", text: "Share a memory of a trip or outing we took that you really enjoyed.", level: 'Medium', order: 16 }
DEFINE Question { id: "af_m_017", category_id: "adventure_fun", text: "What does 'being adventurous' mean to you in the context of our relationship?", level: 'Medium', order: 17 }
DEFINE Question { id: "af_m_018", category_id: "adventure_fun", text: "If we created a 'fun challenge' for ourselves this month, what could it be?", level: 'Medium', order: 18 }
DEFINE Question { id: "af_m_019", category_id: "adventure_fun", text: "What's something new you'd be willing to try together, even if it feels a little silly?", level: 'Medium', order: 19 }
DEFINE Question { id: "af_m_020", category_id: "adventure_fun", text: "How can we incorporate more laughter into our daily lives?", level: 'Medium', order: 20 }
// ... (Continue up to order 25)
DEFINE Question { id: "af_m_025", category_id: "adventure_fun", text: "What's a fun tradition you'd like for us to start?", level: 'Medium', order: 25 }
```

### Deep (Order 26-50)
```pseudocode
DEFINE Question { id: "af_d_026", category_id: "adventure_fun", text: "How does our sense of fun and adventure align or differ?", level: 'Deep', order: 26 }
DEFINE Question { id: "af_d_027", category_id: "adventure_fun", text: "What fears, if any, hold you back from trying new things or being more spontaneous?", level: 'Deep', order: 27 }
DEFINE Question { id: "af_d_028", category_id: "adventure_fun", text: "How can we support each other in stepping outside our comfort zones for fun?", level: 'Deep', order: 28 }
DEFINE Question { id: "af_d_029", category_id: "adventure_fun", text: "What role does 'play' have in a healthy long-term relationship, in your view?", level: 'Deep', order: 29 }
DEFINE Question { id: "af_d_030", category_id: "adventure_fun", text: "Reflect on a time we overcame a challenge together during an 'adventure'. What did we learn?", level: 'Deep', order: 30 }
DEFINE Question { id: "af_d_031", category_id: "adventure_fun", text: "How does societal pressure or expectations influence our ideas of 'fun'?", level: 'Deep', order: 31 }
DEFINE Question { id: "af_d_032", category_id: "adventure_fun", text: "In what ways can 'fun' deepen our connection and understanding of each other?", level: 'Deep', order: 32 }
DEFINE Question { id: "af_d_033", category_id: "adventure_fun", text: "What does a truly 'fun' future look like for us together?", level: 'Deep', order: 33 }
DEFINE Question { id: "af_d_034", category_id: "adventure_fun", text: "How do we balance planned fun with spontaneous joy?", level: 'Deep', order: 34 }
DEFINE Question { id: "af_d_035", category_id: "adventure_fun", text: "What boundaries do we need around 'adventure' to ensure we both feel safe and respected?", level: 'Deep', order: 35 }
// ... (Continue up to order 50)
DEFINE Question { id: "af_d_050", category_id: "adventure_fun", text: "Looking back at this category, what's one key insight you've gained about fun and adventure in our relationship?", level: 'Deep', order: 50 }
```

## Mini-Challenges (`mini_challenges` table)

```pseudocode
DEFINE MiniChallenge { id: "mc_af_001", category_id: "adventure_fun", text: "Plan a tiny, fun surprise for your partner today.", type: 'Action' }
DEFINE MiniChallenge { id: "mc_af_002", category_id: "adventure_fun", text: "Do something silly together for 5 minutes (e.g., dance party, funny faces).", type: 'Action' }
DEFINE MiniChallenge { id: "mc_af_003", category_id: "adventure_fun", text: "Reflect: What's one way you can bring more playfulness into your routine tomorrow?", type: 'Reflection' }
DEFINE MiniChallenge { id: "mc_af_004", category_id: "adventure_fun", text: "Try one new thing together this week, even if it's just a new coffee shop or walking route.", type: 'Action' }
DEFINE MiniChallenge { id: "mc_af_005", category_id: "adventure_fun", text: "Share a compliment focused specifically on how your partner brings fun into your life.", type: 'Action' }
```

## Notes
- IDs are examples; a consistent UUID or sequential ID strategy should be used in implementation.
- The number of Medium and Deep questions needs to be filled out to reach 25 and 50 respectively for full implementation based on the scope.
- This data should be seeded into the corresponding Supabase tables during setup.