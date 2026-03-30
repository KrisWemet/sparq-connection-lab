import type { StarterJourney } from './types';

export const buildingTrust: StarterJourney = {
  id: 'building-trust',
  title: 'Building Trust in Connection',
  duration: 10,
  modalities: ['eft'],
  modalityLabel: 'EMOTIONAL CONNECTION',
  description: 'Building trust from the inside out — so closeness feels safe, not scary.',
  profileCluster: 'anxious-moderate',
  days: [
    // ──────────────────────────────────────────
    // Days 1–3: Surface — noticing the desire for closeness, naming what trust feels like
    // ──────────────────────────────────────────
    {
      dayIndex: 1,
      learn: {
        story:
          `Maya and Jordan had been together for three years. Things were good — really good, most of the time. But some mornings Maya would wake up with a quiet knot in her stomach. Not about anything specific. Just a feeling.\n\n` +
          `She would check her phone. Had Jordan texted back? Had he said goodnight in a certain way? She wasn't looking for proof that something was wrong. She was looking for proof that everything was still okay.\n\n` +
          `One morning she noticed the pattern. Not with shame — just with honesty. "I'm always scanning," she told herself. "Not because something is wrong. Because closeness matters to me so much that I want to make sure it's still there."\n\n` +
          `That was the first shift. She wasn't broken. She was someone who cared deeply — and that caring had turned into watching. Naming it didn't fix it. But it gave her something solid to stand on.`,
        keyInsight:
          'The part of you that watches for signs is not a flaw — it is your caring turned up loud.',
      },
      action: {
        prompt:
          'At some point today, notice the moment you check for reassurance — a glance, a text, a question. Just notice it. No need to change anything yet.',
      },
      reflection: {
        prompt:
          'What did you notice about the moments you looked for reassurance today? What were you really hoping to find?',
      },
    },
    {
      dayIndex: 2,
      learn: {
        story:
          `Alex and Sam were making dinner together. Sam was quiet — not upset, just in his own head. Alex noticed right away. Her first thought: "Did I do something?"\n\n` +
          `She almost asked. Almost said, "Are you okay? Are we okay?" But instead she paused. She noticed where she felt it — a tightness in her chest, a pull to close the gap between them.\n\n` +
          `"That pull," she thought, "that's not panic. That's love. It's just love that got a little loud."\n\n` +
          `She stayed quiet for a minute. Let the feeling be there without acting on it. Then she moved closer and bumped his shoulder gently. "Hey," she said. That was it.\n\n` +
          `Sam smiled. "Hey." He put his arm around her. The gap closed — not because she chased it, but because she let it come to her.`,
        keyInsight:
          'The pull toward someone you love is natural. You get to choose whether to chase it or let it arrive.',
      },
      action: {
        prompt:
          'When you feel a pull toward your partner today — the urge to check in, to close a gap — pause for one breath before you act. Notice what the pull feels like in your body.',
      },
      reflection: {
        prompt:
          'When you paused before reaching out today, what did you feel in your body? What happened next?',
      },
    },
    {
      dayIndex: 3,
      learn: {
        story:
          `Ria sat across from Devon at a coffee shop. They were talking about nothing special — weekend plans, a show they wanted to watch. But Ria noticed something.\n\n` +
          `She felt calm. Not the kind of calm where everything is perfect. The kind where you just feel like you belong in the seat you're sitting in. Where you're not wondering if the other person wants to be somewhere else.\n\n` +
          `She tried to name it. "I feel safe right now," she thought. Not safe like nothing bad could happen. Safe like — this person sees me. And they're still here.\n\n` +
          `Later she tried to remember what trust felt like in her body. It was warm. Low in her chest. A softness behind her ribs. She wanted to remember that feeling — not just the idea of trust, but the actual sensation. Because that's what she was building toward. Not a promise. A feeling she could recognize when it showed up.`,
        keyInsight:
          'Trust is not just a decision. It is a feeling in your body — and once you learn to recognize it, you can find your way back to it.',
      },
      action: {
        prompt:
          'At some point today when you feel at ease with someone — even briefly — pause and notice what your body is doing. Where is the warmth? Where is the softness?',
      },
      reflection: {
        prompt:
          'Did you catch a moment of ease today? What did trust or safety feel like in your body when it showed up?',
      },
    },

    // ──────────────────────────────────────────
    // Days 4–6: Meaningful — recognizing the protective patterns, understanding the cycle
    // ──────────────────────────────────────────
    {
      dayIndex: 4,
      learn: {
        story:
          `When Maya was growing up, her mom was loving but unpredictable. Some days she was all warmth and attention. Other days she was distant — not angry, just gone.\n\n` +
          `Maya learned to read the room fast. She could tell from the sound of a footstep whether it was a good day or a hard one. That skill kept her steady as a kid. It helped her know what to expect.\n\n` +
          `But now, with Jordan, that same skill worked overtime. Every pause in a conversation, every shift in tone — her radar picked it up and asked: "What does this mean? Is something wrong?"\n\n` +
          `The part of her that watched so carefully was not a problem. It was a protector. It had kept her safe when things were uncertain. The only trouble was — she didn't live in that uncertainty anymore. But her protector didn't know that yet.\n\n` +
          `Naming it helped. "That's my radar," she would say. "It's working. But I don't need it here. Not right now."`,
        keyInsight:
          'The part of you that watches so carefully learned to do that for good reasons — and you get to decide when it can rest.',
      },
      action: {
        prompt:
          'Today, when your inner radar lights up — a flicker of worry, a need to check — try saying quietly to yourself: "That is my protector. It is working. I am safe right now."',
      },
      reflection: {
        prompt:
          'Did you notice your protector show up today? What was it watching for — and what did it feel like to name it?',
      },
    },
    {
      dayIndex: 5,
      learn: {
        story:
          `Alex noticed a pattern. When Sam got quiet, she would reach out more — texting, asking questions, trying to pull him closer. And the more she reached, the more Sam seemed to pull back. Not because he didn't care. He just needed a minute.\n\n` +
          `But to Alex, that minute felt like a mile.\n\n` +
          `So she would reach harder. And he would pull further. And neither of them meant any harm — they were just doing what felt natural. Alex reaching because closeness was how she felt safe. Sam stepping back because space was how he found his center.\n\n` +
          `One evening they named it together. "I reach for you because I need to know we're okay," Alex said. Sam nodded. "And I step back because I need a second to feel like myself before I come back to us."\n\n` +
          `Naming the cycle didn't end it. But it turned it from something invisible that pulled them apart into something they could see — and something they could work with.`,
        keyInsight:
          'When you can see the pattern between you and your partner — reach and retreat, pursue and pause — it stops being a fight and starts being something you solve together.',
      },
      action: {
        prompt:
          'Notice if there is a moment today where you reach for closeness and your partner moves in a different direction. Just notice the dance — no need to fix it.',
      },
      reflection: {
        prompt:
          'Did you catch the pattern today — the reach and the retreat? What was it like to see it without trying to change it?',
      },
    },
    {
      dayIndex: 6,
      learn: {
        story:
          `Ria realized something uncomfortable. When she felt distant from Devon, she didn't always reach out in a way that invited closeness. Sometimes she tested.\n\n` +
          `She would get quiet and see if Devon noticed. She would say "I'm fine" and wait for Devon to dig deeper. She would pull away a little — not because she wanted space, but to see if Devon would come find her.\n\n` +
          `It wasn't manipulation. It was protection. Reaching out directly felt too risky. What if she said "I need you" and Devon wasn't there? The test was a safety net — a way to check without fully putting herself on the line.\n\n` +
          `But the tests had a cost. Devon couldn't always read them. And when Devon didn't respond the way Ria hoped, it confirmed the fear instead of easing it.\n\n` +
          `Ria started asking herself a different question. Not "will they come find me?" but "what would it feel like to just say what I need?"`,
        keyInsight:
          'Testing to see if someone will show up is a way of protecting yourself from the risk of asking directly — and direct asking is where real trust begins.',
      },
      action: {
        prompt:
          'If you notice yourself testing your partner today — pulling away to see if they follow, hinting instead of asking — pause and ask yourself: "What do I actually need right now?"',
      },
      reflection: {
        prompt:
          'Was there a moment today where you tested instead of asked? What would it have felt like to say what you needed out loud?',
      },
    },

    // ──────────────────────────────────────────
    // Days 7–9: Deep — practicing trust in small moments, reaching out differently
    // ──────────────────────────────────────────
    {
      dayIndex: 7,
      learn: {
        story:
          `Maya decided to try something small. Instead of scanning for signs that Jordan was pulling away, she would tell him one true thing about how she was feeling.\n\n` +
          `Not a big confession. Not a tearful conversation. Just a small, honest sentence.\n\n` +
          `"I missed you today." That was it.\n\n` +
          `She said it while they were doing dishes. Her heart beat faster than it should have for three words. But she said it.\n\n` +
          `Jordan looked at her. "I missed you too," he said. Simple. Easy. Like it was the most natural thing in the world.\n\n` +
          `Maya felt something settle in her chest. Not because his answer was perfect. But because she had asked for something real and the world didn't end. She had put something true out there — and it landed.\n\n` +
          `Trust, she was learning, didn't come from getting the right answer. It came from being willing to ask the real question.`,
        keyInsight:
          'Trust builds not from getting the perfect response — but from being brave enough to say something true and letting it land.',
      },
      action: {
        prompt:
          "Say one small, true thing to your partner today. Something you feel but haven't said out loud. It can be as simple as \"I missed you\" or \"I like being around you.\"",
      },
      reflection: {
        prompt:
          'What true thing did you say today? What happened in your body before you said it — and after?',
      },
    },
    {
      dayIndex: 8,
      learn: {
        story:
          `Alex tried something new. When Sam got quiet one evening, instead of reaching out with questions or filling the silence — she stayed.\n\n` +
          `She didn't leave. She didn't ask "what's wrong." She just sat on the couch next to him and let the quiet be there.\n\n` +
          `Her body didn't love it. Her chest tightened. Her mind started the old story: "He's pulling away. Something is wrong. You need to fix this." But she stayed anyway.\n\n` +
          `After a few minutes Sam looked up from his phone. "Thanks for just being here," he said.\n\n` +
          `Alex almost cried. Not because it was dramatic. Because it was proof of something she had been afraid to believe — that she could be enough without doing anything. That her presence was the thing. Not her effort. Not her vigilance. Just her.\n\n` +
          `Staying in the discomfort of not-reaching was the reach. And it landed better than anything she had tried before.`,
        keyInsight:
          'Sometimes the bravest way to reach for someone is to stay still — and trust that your presence is enough.',
      },
      action: {
        prompt:
          'Find a quiet moment with your partner today and practice just being near them without filling the space. No questions. No fixing. Just your presence.',
      },
      reflection: {
        prompt:
          'What was it like to be present without reaching? What did the quiet feel like — and what did you discover there?',
      },
    },
    {
      dayIndex: 9,
      learn: {
        story:
          `Ria had a hard day. The kind of day where everything felt slightly off — not broken, just shaky. The old version of her would have pulled into herself. Would have tested Devon to see if they noticed. Would have waited.\n\n` +
          `But she had been practicing something different. So she texted Devon: "I had a rough day. I don't need you to fix anything. I just want you to know."\n\n` +
          `Devon replied: "I'm glad you told me. I'm here."\n\n` +
          `It was so simple that Ria almost didn't trust it. Part of her waited for the other shoe to drop. Part of her said: "That can't be enough. There has to be more."\n\n` +
          `But she let it be enough. She let those four words — "I'm glad you told me" — land in her chest and sit there. She didn't need more. She needed to let this in.\n\n` +
          `That was the harder skill. Not asking for closeness — but letting it arrive and actually receiving it.`,
        keyInsight:
          'Asking for what you need is brave. Letting the response actually reach you — that is where trust takes root.',
      },
      action: {
        prompt:
          'When your partner offers you something today — a kind word, a gesture, their time — practice letting it in fully. Notice the urge to brush it off, and stay open instead.',
      },
      reflection: {
        prompt:
          'Was there a moment today when your partner reached toward you? What happened when you let yourself receive it?',
      },
    },

    // ──────────────────────────────────────────
    // Day 10: Integration — seeing the new pattern, identity reinforcement
    // ──────────────────────────────────────────
    {
      dayIndex: 10,
      learn: {
        story:
          `Maya looked back over the last ten days. She still noticed the pull. She still scanned sometimes. She still wanted to know that things were okay.\n\n` +
          `But something was different.\n\n` +
          `She could feel the protector rise — and she could name it. She could feel the urge to test — and choose to ask instead. She could feel the quiet — and stay in it without filling it with fear.\n\n` +
          `She wasn't a different person. She was the same person with a different relationship to the old patterns. The watching hadn't disappeared. But it had gotten quieter. And in the space it left behind, something warmer had started to grow.\n\n` +
          `"I'm becoming someone who trusts," she told herself one morning. Not because everything was perfect. Not because the fear was gone. But because she kept choosing to stay open — even when it was hard.\n\n` +
          `And that choice, made again and again in small moments, was building something real.`,
        keyInsight:
          'Trust is not the absence of fear. It is the choice to stay open — again and again — and to notice that you are becoming someone who does.',
      },
      action: {
        prompt:
          'Take a moment today to notice one way you have changed over the last ten days. One pattern you see more clearly. One moment where you chose differently. Let yourself feel that.',
      },
      reflection: {
        prompt:
          'As you look back on these ten days — what feels different now? What kind of person are you becoming in your relationship?',
      },
    },
  ],
};
