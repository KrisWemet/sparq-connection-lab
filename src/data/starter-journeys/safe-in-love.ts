import type { StarterJourney } from './types';

export const safeInLove: StarterJourney = {
  id: 'safe-in-love',
  title: 'Learning to Feel Safe in Love',
  duration: 14,
  modalities: ['eft', 'dbt'],
  modalityLabel: 'EMOTIONAL SAFETY',
  description:
    'Working with the part of you that learned to watch instead of rest — so you can finally feel safe enough to stop watching.',
  profileCluster: 'anxious-high-abandonment',
  days: [
    // -------------------------------------------------------
    // DAYS 1–3: SURFACE — noticing the need for safety
    // -------------------------------------------------------
    {
      dayIndex: 1,
      learn: {
        story:
          'Maya noticed it again on a Tuesday night. Jordan was ten minutes late and hadn\'t texted. ' +
          'Her chest got tight. Her thumb hovered over the phone. She wanted to call — not because anything was wrong, ' +
          'but because the silence felt loud.\n\n' +
          'She wasn\'t angry. She was afraid. Somewhere under the surface, a small alarm was ringing. ' +
          'It whispered: "What if they forgot about you?"\n\n' +
          'Maya didn\'t know yet that this alarm had a name. She didn\'t know it had been installed a long time ago, ' +
          'back when she was too small to protect herself. All she knew was that ten minutes of quiet ' +
          'could make her feel like the ground was disappearing.\n\n' +
          'She called. Jordan answered, happy and calm. Just traffic. ' +
          'Maya laughed it off. But that night in bed, she thought: ' +
          '"Why does ten minutes feel like forever to me?"',
        keyInsight:
          'The alarm inside you isn\'t broken — it was built to protect you. Noticing it is the first step toward choosing what happens next.',
      },
      action: {
        prompt:
          'At some point today, you\'ll feel a small pull to check in with your partner — not because you need to, but because the quiet feels uncomfortable. When you notice that pull, pause for three seconds before you act. Just notice it.',
      },
      reflection: {
        prompt:
          'Did you notice the pull today? What did the quiet feel like before you reached out?',
      },
    },
    {
      dayIndex: 2,
      learn: {
        story:
          'Alex grew up in a house where love was unpredictable. Some days his mom was warm and close. ' +
          'Other days she seemed a thousand miles away, even sitting at the same table.\n\n' +
          'He learned something without anyone teaching him: watch carefully. ' +
          'Read the mood. Adjust yourself before anything goes wrong. ' +
          'If you pay close enough attention, maybe you can keep the love from disappearing.\n\n' +
          'Now Alex is thirty-four. He loves Sam. Sam loves him back — says it, shows it, means it. ' +
          'But some mornings Alex wakes up and studies Sam\'s face before Sam even opens their eyes. ' +
          'Looking for a sign. Any sign.\n\n' +
          'The watching isn\'t a flaw. It\'s a skill he built when he needed it most. ' +
          'The question isn\'t whether to stop watching. It\'s whether he still needs to.',
        keyInsight:
          'The part of you that watches was keeping you safe when no one else could. That deserves respect, not shame.',
      },
      action: {
        prompt:
          'Notice one moment today when you\'re watching your partner\'s mood — scanning for a shift, reading their tone. When you catch it, silently say to yourself: "There\'s the watcher. I see you."',
      },
      reflection: {
        prompt:
          'When you noticed yourself watching today, what were you looking for? What were you hoping to find — or hoping not to find?',
      },
    },
    {
      dayIndex: 3,
      learn: {
        story:
          'Ria and Devon had a good weekend. Really good. They cooked together, laughed at a terrible movie, ' +
          'fell asleep on the couch tangled up.\n\n' +
          'And then Monday came. Devon went quiet — not cold, just busy. Work emails. A deadline. ' +
          'Normal stuff.\n\n' +
          'But Ria\'s body didn\'t know it was normal. Her stomach dropped. ' +
          'A thought arrived fast, like it had been waiting: "It\'s over. The good part is done. ' +
          'Here comes the distance."\n\n' +
          'This is what the alarm does. It doesn\'t just ring when something is wrong. ' +
          'It rings after something is right — because the good stuff feels fragile. ' +
          'Like it could be taken away at any moment.\n\n' +
          'Ria sat with it for a minute. She didn\'t text Devon six times. She didn\'t start a fight to get a reaction. ' +
          'She just noticed: "The alarm is ringing because I had a good weekend. Not because anything is wrong."',
        keyInsight:
          'Sometimes the alarm rings loudest right after something good — because good things have felt temporary before.',
      },
      action: {
        prompt:
          'If you have a warm moment with your partner today, pay attention to what happens right after. Does something in you brace for it to end? Just notice — no need to fix it.',
      },
      reflection: {
        prompt:
          'What is your alarm most afraid of? If you could hear its voice clearly, what would it say?',
      },
    },

    // -------------------------------------------------------
    // DAYS 4–7: MEANINGFUL — understanding where the pattern came from
    // -------------------------------------------------------
    {
      dayIndex: 4,
      learn: {
        story:
          'When Kai was seven, his dad left for a work trip and forgot to say goodbye. ' +
          'It wasn\'t on purpose. He just rushed out early.\n\n' +
          'But to a seven-year-old, the empty kitchen told a different story. ' +
          'It said: people leave without warning. So you better pay attention. ' +
          'You better make sure they have a reason to come back.\n\n' +
          'Kai is grown now. He knows his dad loved him. He knows that morning didn\'t mean what it felt like. ' +
          'But his body still remembers the empty kitchen. And sometimes, when Noa goes quiet or pulls away for an hour, ' +
          'something inside Kai rushes to fill the gap. To be helpful. To be funny. To be whatever it takes.\n\n' +
          'The part of him that learned this isn\'t stupid. It\'s loyal. ' +
          'It\'s still doing the job a seven-year-old gave it. ' +
          'The only problem is — Kai isn\'t seven anymore.',
        keyInsight:
          'The patterns you carry were smart solutions for a younger version of you. They kept you safe then. You get to decide if they still serve you now.',
      },
      action: {
        prompt:
          'Think of one thing you do in your relationship to keep the peace — something that feels automatic. Ask yourself: "How old was I when I learned this?"',
      },
      reflection: {
        prompt:
          'What did the younger version of you need that they didn\'t always get? Can you name it in one or two words?',
      },
    },
    {
      dayIndex: 5,
      learn: {
        story:
          'Sam and Alex had their first real fight three months in. It wasn\'t even about anything big — ' +
          'who was supposed to call the landlord.\n\n' +
          'But something happened when Sam\'s voice got sharp. Alex\'s whole body went still. ' +
          'His hands got cold. He couldn\'t think straight. He wanted to fix it immediately — ' +
          'say whatever would make Sam\'s voice go back to normal.\n\n' +
          'He said sorry four times. Sam said, "You don\'t even know what you\'re sorry for."\n\n' +
          'That night, Alex sat alone and felt a familiar feeling: ' +
          'the sense that he had to earn his way back in. That love was something you could lose in a single moment ' +
          'if you said the wrong thing.\n\n' +
          'But here\'s what Alex was starting to learn: ' +
          'that feeling wasn\'t about Sam. Sam wasn\'t going anywhere. ' +
          'That feeling was old. It came from somewhere else, somewhere earlier. ' +
          'And it was asking to be heard — not obeyed.',
        keyInsight:
          'When your body reacts bigger than the moment calls for, it\'s usually answering an older question — not the one in front of you.',
      },
      action: {
        prompt:
          'If a tense moment comes up today, notice where you feel it in your body first — before your mind starts solving. Chest? Stomach? Throat? Just name the location.',
      },
      reflection: {
        prompt:
          'When did you first learn that love could disappear? What were you taught — not in words, but in what happened around you?',
      },
    },
    {
      dayIndex: 6,
      learn: {
        story:
          'Jordan never raised their voice. That was the thing about Jordan — always calm, always reasonable. ' +
          'Maya used to think it was a gift.\n\n' +
          'But one night she said something she\'d been holding for weeks: ' +
          '"Sometimes I feel like I\'m loving into a void. I put it out there and I don\'t know if it lands."\n\n' +
          'Jordan went quiet. Not cold — just still. And Maya felt the old pull: ' +
          'take it back. You asked for too much. Now they\'ll pull away.\n\n' +
          'But she stayed. She didn\'t fill the silence.\n\n' +
          'And after a minute, Jordan said, "I don\'t always know how to show you it lands. ' +
          'But it does. Every time."\n\n' +
          'Maya cried. Not because she was sad — because she realized ' +
          'she had been holding her breath for months, waiting for proof that she mattered. ' +
          'And the proof had been there all along. She just couldn\'t feel it through the alarm.',
        keyInsight:
          'Sometimes what you need is already being given. The alarm just makes it hard to receive.',
      },
      action: {
        prompt:
          'Look for one small sign today that your partner cares — something you might usually overlook because your mind is busy scanning for danger. Let it land.',
      },
      reflection: {
        prompt:
          'What is one sign of love your partner gives that you sometimes struggle to take in? What makes it hard to receive?',
      },
    },
    {
      dayIndex: 7,
      learn: {
        story:
          'Ria had a thought that scared her. She thought: "What if I\'m too much?"\n\n' +
          'Too many texts. Too many questions. Too much need to know things are okay.\n\n' +
          'She\'d heard it before — from an ex who said she was "a lot." From a friend who joked about her being clingy. ' +
          'From a voice in her own head that had been repeating it for years.\n\n' +
          'But one afternoon, Devon said something simple: "I like that you reach out. ' +
          'It tells me I matter to you."\n\n' +
          'Ria blinked. She didn\'t know what to do with that. ' +
          'Someone was looking at the exact thing she hated about herself ' +
          'and calling it good.\n\n' +
          'She didn\'t believe it right away. That\'s okay. ' +
          'Believing takes longer than hearing. But the door was open now. ' +
          'And the part of her that had been apologizing for needing love ' +
          'could finally sit down.',
        keyInsight:
          'Your need for closeness isn\'t a flaw. It\'s a signal that you value connection deeply. The work isn\'t to need less — it\'s to trust that you\'re safe to need.',
      },
      action: {
        prompt:
          'Say one thing to your partner today that you\'d normally hold back because you worry it\'s too much. Just one. See what happens.',
      },
      reflection: {
        prompt:
          'What is the thing about yourself in relationships that you\'ve been told is "too much"? What if it was actually a strength?',
      },
    },

    // -------------------------------------------------------
    // DAYS 8–11: DEEP — building internal safety, self-soothing
    // -------------------------------------------------------
    {
      dayIndex: 8,
      learn: {
        story:
          'Kai discovered something by accident. Noa was out with friends, not answering texts. ' +
          'The alarm started ringing — loud.\n\n' +
          'Normally, Kai would text again. Then call. Then spiral. ' +
          'But tonight, he tried something different. He put one hand on his chest and one on his stomach. ' +
          'He breathed in for four counts. Out for six. And he said — out loud, to himself — "You\'re safe right now. ' +
          'Nothing bad is happening."\n\n' +
          'He felt stupid. It felt like talking to a kid.\n\n' +
          'But something shifted. The tightness didn\'t disappear, but it loosened. ' +
          'Like a hand unclenching one finger at a time.\n\n' +
          'Kai had been looking for safety in Noa\'s replies. In proof. In reassurance from the outside. ' +
          'But for the first time, he felt something he\'d never expected: ' +
          'he could create a little bit of that safety himself. ' +
          'Not all of it. Not forever. But enough to get through the next ten minutes.',
        keyInsight:
          'You don\'t have to wait for someone else to make you feel safe. You can start with ten minutes and your own two hands.',
      },
      action: {
        prompt:
          'When you notice the alarm today, try this: one hand on your chest, one on your stomach. Three slow breaths. Then say quietly: "I\'m okay right now." Not forever — just right now.',
      },
      reflection: {
        prompt:
          'Did you try the hands-on-body breathing today? What did it feel like to give yourself the reassurance you usually look for from someone else?',
      },
    },
    {
      dayIndex: 9,
      learn: {
        story:
          'Maya had a hard conversation with herself.\n\n' +
          'She asked: "What do I do when I feel scared in my relationship?"\n\n' +
          'The answer came fast: she clings. She asks "are we okay?" three times in one evening. ' +
          'She watches Jordan\'s face for clues. She makes herself smaller, easier, more agreeable — ' +
          'anything to keep the peace.\n\n' +
          'Then she asked a second question: "What do I actually need?"\n\n' +
          'That answer came slower. She needed to know she wasn\'t alone. ' +
          'She needed to know she could say the wrong thing and still be loved.\n\n' +
          'Those two things — what she did and what she needed — were not the same. ' +
          'The clinging was the strategy. The need was underneath. ' +
          'And when she could name the real need, she could ask for it directly.\n\n' +
          'Instead of "Are we okay?" she could say: "I need to hear that we\'re solid right now. Can you tell me?"',
        keyInsight:
          'The thing you do when you\'re scared isn\'t the same as the thing you need. When you can separate the two, you can ask clearly instead of reaching desperately.',
      },
      action: {
        prompt:
          'If you feel the urge to seek reassurance today, pause and ask yourself: "What do I actually need right now?" Then try asking for that specific thing — with simple, direct words.',
      },
      reflection: {
        prompt:
          'What is one thing you do when you\'re scared that isn\'t actually what you need? What\'s the real need underneath it?',
      },
    },
    {
      dayIndex: 10,
      learn: {
        story:
          'Alex used to think being strong meant not needing anyone. ' +
          'But that wasn\'t working. The less he asked for, the lonelier he got. ' +
          'And the lonelier he got, the more desperate the asking became when it finally came out.\n\n' +
          'Sam noticed the pattern. "You go weeks acting like everything is fine, ' +
          'and then one night it all comes out at once and I don\'t know how to help you."\n\n' +
          'Alex realized something: reaching out when the alarm is small is different from reaching out when it\'s screaming. ' +
          'A small ask — "Hey, I\'m feeling off today. Can we just sit together?" — lands gently. ' +
          'A desperate ask after weeks of silence feels like an emergency.\n\n' +
          'He started practicing the small ask. It felt uncomfortable at first. Like admitting weakness. ' +
          'But Sam responded with ease every single time. Because a small ask is easy to meet. ' +
          'And meeting it builds something: a rhythm of giving and receiving that both people can trust.',
        keyInsight:
          'Reaching out early and small is not weakness. It\'s the practice that teaches your alarm: "See? You asked and they were there."',
      },
      action: {
        prompt:
          'Make one small ask today. Not when you\'re spiraling — before that. Something like "Can we talk for a minute tonight?" or "I could use a hug." Keep it simple.',
      },
      reflection: {
        prompt:
          'How did it feel to make a small ask before you were desperate? What did your partner\'s response teach your alarm?',
      },
    },
    {
      dayIndex: 11,
      learn: {
        story:
          'Noa said something that changed things for Kai. They were sitting on the porch, not talking about anything important, ' +
          'and Kai\'s phone buzzed. An old friend, canceling plans.\n\n' +
          'Kai felt the familiar drop. The voice: "People always cancel. People always leave."\n\n' +
          'Noa noticed his face change. "What happened?"\n\n' +
          'Kai told her. And then — without thinking — he said, "I know it\'s not a big deal. ' +
          'But there\'s a part of me that always takes it personally. Like it means something about me."\n\n' +
          'Noa didn\'t fix it. She said, "That part of you is working really hard, isn\'t it?"\n\n' +
          'Kai almost laughed. Because yes — that part was exhausted. It had been working overtime for decades, ' +
          'keeping score of every cancellation, every delayed reply, every door that closed.\n\n' +
          'He said, "Yeah. It really is."\n\n' +
          'And something softened. Not because the pattern disappeared. ' +
          'But because he said it out loud, and the person next to him didn\'t run away.',
        keyInsight:
          'Saying the quiet part out loud to someone safe doesn\'t make you weak. It lets the exhausted part of you finally rest.',
      },
      action: {
        prompt:
          'Share one thing with your partner today that you\'d normally keep to yourself — not a crisis, just a feeling you usually manage alone. Let them see a small piece of what\'s underneath.',
      },
      reflection: {
        prompt:
          'What happened when you let your partner see something you usually hide? What did their response tell you about how safe you actually are?',
      },
    },

    // -------------------------------------------------------
    // DAYS 12–14: INTEGRATION — seeing the new pattern, identity reinforcement
    // -------------------------------------------------------
    {
      dayIndex: 12,
      learn: {
        story:
          'Ria looked back at the last two weeks and noticed something she hadn\'t expected.\n\n' +
          'The alarm was still there. It still went off sometimes — when Devon was quiet, ' +
          'when plans changed, when a text took too long.\n\n' +
          'But something was different. The alarm would ring, and instead of grabbing the phone ' +
          'or starting a fight or shrinking herself down, she\'d notice it. ' +
          '"There it is. The watcher. I hear you."\n\n' +
          'And then she\'d take a breath. And choose.\n\n' +
          'Sometimes she chose to reach out — with a clear, simple ask. ' +
          'Sometimes she chose to wait and let the feeling pass on its own. ' +
          'Sometimes she chose wrong. And that was okay too.\n\n' +
          'The point was never to silence the alarm. The point was to stop letting it drive. ' +
          'To hear it, nod at it, and then decide for herself what to do next.\n\n' +
          'She was becoming someone who could feel afraid and still choose with her whole heart.',
        keyInsight:
          'Growth isn\'t the absence of fear. It\'s the moment between the alarm and your response — where you get to choose.',
      },
      action: {
        prompt:
          'Notice one moment today when the alarm rings and you choose what to do with it instead of reacting on autopilot. That\'s the practice. That moment of choosing is everything.',
      },
      reflection: {
        prompt:
          'Looking back at these two weeks, where do you see the space between the alarm and your response getting wider? What does that feel like?',
      },
    },
    {
      dayIndex: 13,
      learn: {
        story:
          'Alex was driving when it hit him.\n\n' +
          'Sam had gone on a weekend trip with friends. No drama, no tension — just a normal trip. ' +
          'And Alex realized he was okay. Not pretending. Not distracting himself. Actually okay.\n\n' +
          'He felt the familiar hum — the low-level awareness that Sam was away. ' +
          'But it wasn\'t screaming. It was more like background music. He could hear it without being controlled by it.\n\n' +
          'He thought about who he was a year ago — the person who would\'ve texted eight times by now. ' +
          'The person who would\'ve picked a fight before the trip to create closeness through conflict. ' +
          'The person who confused love with surveillance.\n\n' +
          'He wasn\'t that person anymore. Not completely. That person still lived in him — ' +
          'and he was grateful for what that person survived. ' +
          'But there was a new person now too. Someone who could miss Sam without panicking. ' +
          'Someone who could love without gripping.\n\n' +
          'He turned up the radio and smiled.',
        keyInsight:
          'You don\'t have to become a different person. You just have to give the person you already are permission to feel safe.',
      },
      action: {
        prompt:
          'Take a moment today to notice something that would have sent you spiraling a few weeks ago — and didn\'t this time. Let yourself feel proud of that. You earned it.',
      },
      reflection: {
        prompt:
          'Who are you becoming? If you could write one sentence about the person you\'re growing into — what would it say?',
      },
    },
    {
      dayIndex: 14,
      learn: {
        story:
          'Maya was sitting with Jordan, doing nothing special. Sunday morning. Coffee going cold.\n\n' +
          'Jordan was reading something on their phone, half-smiling. Not engaging. Just existing in the same room.\n\n' +
          'Maya noticed that a few weeks ago, this would have made her anxious. ' +
          'The silence would\'ve felt like distance. Jordan\'s attention on the phone would\'ve felt like rejection.\n\n' +
          'But today it just felt like a Sunday. Jordan was here. She was here. ' +
          'The quiet wasn\'t loud anymore.\n\n' +
          'She thought about the alarm — the one that used to ring at every silence, every gap, ' +
          'every moment that could be read as "they\'re pulling away." ' +
          'It was still there. She didn\'t think it would ever fully leave. But it had a different job now.\n\n' +
          'It used to say: "They might leave."\n\n' +
          'Now, more often, it said: "You\'re here. They\'re here. You\'re okay."\n\n' +
          'Same alarm. New message. Same Maya. New trust.\n\n' +
          'She picked up her coffee and let the morning be exactly what it was.',
        keyInsight:
          'Safety in love isn\'t the absence of fear. It\'s the quiet knowing that you can handle whatever comes — and that you don\'t have to handle it alone.',
      },
      action: {
        prompt:
          'Sit with your partner today in a quiet moment. Don\'t fill it. Don\'t scan their face. Just be there — and notice that you can.',
      },
      reflection: {
        prompt:
          'You started this journey watching. What has changed about the way you watch now? What do you see that you couldn\'t see before?',
      },
    },
  ],
};
