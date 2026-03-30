// src/data/starter-journeys/mixed-feelings.ts

import type { StarterJourney } from './types';

export const mixedFeelings: StarterJourney = {
  id: 'mixed-feelings',
  title: 'Making Sense of Mixed Feelings',
  duration: 14,
  modalities: ['ifs', 'eft'],
  modalityLabel: 'SELF-UNDERSTANDING',
  description:
    'Making sense of the push and pull inside you — so you can choose from a steadier place.',
  profileCluster: 'disorganized-no-trauma',
  days: [
    // ──────────────────────────────────────────────
    // DAYS 1-3 — Surface: naming the push-pull, normalizing mixed feelings
    // ──────────────────────────────────────────────
    {
      dayIndex: 1,
      learn: {
        story:
          'Maya woke up on a Saturday wanting nothing more than to curl up next to her partner, Jude. But the second she got close, something shifted. A tightness in her chest. A voice saying, "Not too close." So she got up and made coffee alone in the kitchen.\n\nJude found her there twenty minutes later. "You okay?" Maya nodded. She was okay. She just couldn\'t explain why she wanted closeness and space at the exact same time.\n\nMost people feel one way at a time — happy or sad, close or distant. But some people feel both at once. Wanting to reach out and pull back in the same breath. That is not broken. That is not strange. It is just a signal that two parts of you are trying to keep you safe in different ways.\n\nOne part reaches toward love. Another part says, "Be careful." They are both trying to help. The trouble starts when you think you have to pick one and get rid of the other.\n\nYou don\'t. Today is just about noticing: both are there.',
        keyInsight:
          'Wanting closeness and space at the same time is not confusion — it is two parts of you trying to keep you safe.',
      },
      action: {
        prompt:
          'At some point today, notice a moment when you feel pulled in two directions at once — toward someone and away from them. You don\'t need to do anything about it. Just notice it.',
      },
      reflection: {
        prompt:
          'What did that push-and-pull feel like in your body today? Where did you feel the reaching out, and where did you feel the pulling back?',
      },
    },
    {
      dayIndex: 2,
      learn: {
        story:
          'Deshawn loved his wife, Carmen. He knew that clearly. But some evenings, when Carmen sat close and asked about his day, Deshawn felt an urge to leave the room. Not because he was angry. Not because he didn\'t care. Just — something in him tightened.\n\nHe used to think something was wrong with him. "Normal people don\'t want to run from someone they love," he told himself.\n\nBut here is the truth: wanting closeness and needing distance are not opposites. They live side by side in most of us. The pull toward connection is real. The pull toward safety is also real. They are both honest.\n\nWhen Deshawn started to see this — that both parts were real — something loosened. He didn\'t have to fight the part that wanted space. He didn\'t have to force himself to stay. He could just say, "I need five minutes," and come back. The coming back mattered more than never leaving.\n\nYou have permission to feel both things. Neither one is the wrong one.',
        keyInsight:
          'The part that reaches out and the part that pulls back are both honest — neither one is the wrong one.',
      },
      action: {
        prompt:
          'If you feel the urge to pull away from someone you care about today, try saying — out loud or quietly to yourself — "Both of these feelings are real." Then choose what to do next.',
      },
      reflection: {
        prompt:
          'When did you feel the push-pull today? What happened when you let both feelings be there without choosing sides?',
      },
    },
    {
      dayIndex: 3,
      learn: {
        story:
          'Priya and Sam had a pattern. On good days, Priya reached for Sam — a touch on the arm, a long hug, a real conversation. On harder days, she went quiet. Not cold, just — gone. Sam never knew which version of the morning he would get.\n\nPriya didn\'t know either. That was the confusing part. She didn\'t choose to go quiet. It just happened, like a door closing before she could catch it.\n\nThis is what mixed feelings look like from the outside — inconsistency. But from the inside it doesn\'t feel inconsistent at all. It feels like something shifts faster than you can name it.\n\nHere is what helps: giving the pattern a name. Not a label. Not a diagnosis. Just a simple name you pick yourself. Priya started calling hers "the door." When she felt it close, she would say, "The door is closing." That was enough. It gave her a tiny gap between the feeling and the reaction. And in that gap, she had a choice.\n\nWhat would you call yours?',
        keyInsight:
          'Giving the pattern a simple name creates a small gap between the feeling and the reaction — and that gap is where your choice lives.',
      },
      action: {
        prompt:
          'Pick a simple name for your push-pull pattern — something that feels true to you. It could be "the door," "the wave," "the switch," or anything that fits. Say it to yourself when you notice the pattern today.',
      },
      reflection: {
        prompt:
          'What name did you choose? What was it like to notice the pattern and call it by name instead of just being swept into it?',
      },
    },

    // ──────────────────────────────────────────────
    // DAYS 4-7 — Meaningful: meeting the different parts, understanding what each one needs
    // ──────────────────────────────────────────────
    {
      dayIndex: 4,
      learn: {
        story:
          'When Leo felt close to his partner, Nia, a warm feeling spread through his chest. Connection. Home. But right behind it came something sharper — a kind of alarm. Like his body was saying, "Don\'t get comfortable. Something bad happens when you relax."\n\nLeo had two voices inside him. One said, "Go toward her." The other said, "Watch out." For years he thought he had to silence one of them. But silencing a part of yourself doesn\'t make it go away. It just makes it louder when you\'re not paying attention.\n\nSo Leo tried something different. He got curious. Instead of fighting the alarm, he asked it: "What are you afraid of?" The answer came quickly: "If you get close, you\'ll get hurt. I\'ve seen it before."\n\nThat part wasn\'t trying to ruin his relationship. It was trying to protect him from an old hurt. It was doing the only job it knew how to do.\n\nWhen Leo understood that, the alarm didn\'t disappear. But it softened. Because it had been heard.',
        keyInsight:
          'The part of you that pulls away is not trying to ruin your relationship — it learned to protect you, and it is still doing that job.',
      },
      action: {
        prompt:
          'When you notice the pull-back part today, try asking it — quietly, in your mind — "What are you trying to protect me from?" Just listen. You don\'t need to answer or fix anything.',
      },
      reflection: {
        prompt:
          'What did the protective part say when you asked what it was afraid of? What did it feel like to listen to it instead of fighting it?',
      },
    },
    {
      dayIndex: 5,
      learn: {
        story:
          'Aisha noticed something: her pull toward her partner, Marcus, always had a texture to it. Warmth. Longing. A hunger to be truly known.\n\nBut when she looked closer, she realized the part that reached out also carried a kind of desperation. "Please stay. Please don\'t leave." It wasn\'t just love. It was fear — dressed up as love.\n\nThis was hard to see. She had always thought her reaching-out was the "good" part and her pulling-back was the "bad" part. But the reaching-out part needed something too. It needed reassurance that she would be okay even if Marcus wasn\'t right there.\n\nSo Aisha asked that part the same question she had learned to ask the protective one: "What do you need?" The answer surprised her: "I need to know I won\'t disappear if he\'s not here."\n\nBoth parts had needs. Neither one was wrong. The reach-toward part needed to feel solid on its own. The pull-away part needed to feel safe getting close. Two different needs. Both completely real.',
        keyInsight:
          'The part that reaches out has needs too — it deserves the same curiosity and kindness as the part that pulls back.',
      },
      action: {
        prompt:
          'Today, check in with the part of you that reaches toward connection. Ask it gently: "What do you need right now?" Notice what comes up.',
      },
      reflection: {
        prompt:
          'What did the reaching-out part of you need today? How was it different from what you expected?',
      },
    },
    {
      dayIndex: 6,
      learn: {
        story:
          'Tomás used to think he was two different people. The one who texted his girlfriend, Grace, ten times a day. And the one who ignored her calls on Sunday.\n\nHe wasn\'t two people. He just had two parts with very different jobs. One part\'s job was to hold on. The other part\'s job was to keep a safe distance. They both worked overtime. And they both thought they were the only thing keeping Tomás safe.\n\nThe turning point came when Tomás stopped trying to fix either one. Instead, he imagined them in a room together. The holding-on part, scared of being left. The keeping-distance part, scared of being trapped. Two fears. Two strategies. Both exhausted.\n\nWhat if neither one had to work so hard?\n\nTomás didn\'t have the answer yet. But just imagining them sitting together — not fighting, not winning, just coexisting — something in his chest released. For the first time, it felt like there might be a third option. Not hold on. Not pull away. Just — be here.',
        keyInsight:
          'When you stop making your inner parts fight each other, a third option starts to appear — just being here, without gripping or fleeing.',
      },
      action: {
        prompt:
          'Picture the two parts inside you — the one that holds on and the one that keeps distance. Imagine them sitting side by side. Not fighting. Not talking. Just resting together. Notice how that feels.',
      },
      reflection: {
        prompt:
          'What was it like to imagine both parts at rest? Did anything shift when you stopped making them compete?',
      },
    },
    {
      dayIndex: 7,
      learn: {
        story:
          'Riya had done the work of listening to both parts. The one that wanted closeness. The one that wanted safety. She understood them. She even felt kindness toward both.\n\nBut understanding didn\'t stop the tug-of-war. In the morning she would wake up feeling close to her partner, Kai. By evening, something would shift. She would feel distant, irritated, unsure why.\n\nThen she realized something: the shift always happened after a moment of real connection. A deep conversation. A moment of being truly seen. The closeness itself was the trigger.\n\nThis made a strange kind of sense. Her pull-away part didn\'t activate when things were bad. It activated when things were good — because good things had been taken away before. Getting close meant there was something to lose.\n\nRiya sat with that. She didn\'t try to talk herself out of it. She just said, very quietly: "It makes sense that good things feel scary. I learned that a long time ago. But I\'m not in that situation anymore."\n\nShe didn\'t believe it completely yet. But she said it. And that was enough for one day.',
        keyInsight:
          'Sometimes the pull-away comes right after closeness — not because something is wrong, but because your body learned that good things could be taken away.',
      },
      action: {
        prompt:
          'Today, if you notice yourself pulling away after a moment of connection, try whispering to yourself: "Good things feel scary sometimes. That makes sense. I\'m safe right now."',
      },
      reflection: {
        prompt:
          'Did closeness trigger any pull-away today? What did it feel like to remind yourself that you\'re safe now?',
      },
    },

    // ──────────────────────────────────────────────
    // DAYS 8-11 — Deep: finding the steady center, choosing from that place
    // ──────────────────────────────────────────────
    {
      dayIndex: 8,
      learn: {
        story:
          'Elijah had been paying attention to his parts for a week now. The one that reached for his partner, Sasha. The one that pulled back. He was getting better at hearing them. But there was something else — a quieter voice underneath both.\n\nIt showed up in small moments. When Sasha laughed at something on TV and Elijah just watched her. No urge to get closer. No urge to leave. Just — watching. Present. A warm, still feeling in the center of his chest.\n\nThat was not the reaching part. It was not the pulling-back part. It was something underneath both of them. A steadier place.\n\nMost people don\'t notice this place because it\'s quiet. The loud parts get all the attention — the anxiety, the shutdown, the rush toward or away. But the steady center is always there. It doesn\'t shout. It just waits.\n\nElijah started looking for it on purpose. Not trying to hold onto it. Just noticing when it was there. Like noticing a heartbeat — it was always going, he just hadn\'t been listening.',
        keyInsight:
          'Underneath the push and the pull, there is a steadier place — it doesn\'t shout, but it\'s always there when you listen for it.',
      },
      action: {
        prompt:
          'At a quiet moment today, put your hand on your chest and look for that still, steady feeling underneath the noise. You don\'t have to create it. Just notice if it\'s there.',
      },
      reflection: {
        prompt:
          'Did you find a moment of that quiet steadiness today? Where were you, and what were you doing when you felt it?',
      },
    },
    {
      dayIndex: 9,
      learn: {
        story:
          'Grace had a choice to make. Tomás had asked her to go away for the weekend — just the two of them. The holding-on part of her leaped. Yes. Time together. Closeness. The pulling-back part panicked. Two days with no escape. Trapped.\n\nIn the past, Grace would have said yes and then found a reason to cancel. Or said no and felt guilty. Both options left her stuck.\n\nBut this time, she paused. She found that quiet, steady place — the one she had been practicing. And from there, she asked herself a different question. Not "What do I want?" — because both parts wanted different things. But: "What feels right when I\'m not afraid?"\n\nThe answer was clear: she wanted to go. She also needed to know she could take space if she needed it.\n\nSo she said yes — and she told Tomás, "I might need some quiet time while we\'re there. Not because of you. Just because I need it." Tomás said, "Of course." And for the first time, Grace made a choice that honored all of her.',
        keyInsight:
          'The question is not "What do I want?" — because fear answers that question too. The real question is: "What feels right when I\'m not afraid?"',
      },
      action: {
        prompt:
          'The next time you face a choice about closeness or distance today, pause and ask yourself: "What would I choose if I weren\'t afraid?" Let that answer guide you.',
      },
      reflection: {
        prompt:
          'Did you find a moment to ask, "What would I choose if I weren\'t afraid?" What answer came up?',
      },
    },
    {
      dayIndex: 10,
      learn: {
        story:
          'Kai noticed that when he spoke from his steady center, his voice sounded different. Calmer. Slower. Not performing confidence, just — grounded.\n\nRiya noticed it too. "You sound different today," she said. Not better or worse. Just different.\n\nThat was because Kai wasn\'t speaking from the part that wanted to hold on. He wasn\'t speaking from the part that wanted to keep distance. He was speaking from the place underneath — the one that could see both parts without being run by either one.\n\nThis is what it means to choose from a steady place. Not ignoring the push-pull. Not pretending it isn\'t there. Just not letting it drive.\n\nKai still felt the pull toward Riya. He still felt the pull away sometimes. But he was learning to notice those pulls the way you notice weather — "Oh, there\'s the reaching. There\'s the retreating" — and then choose from somewhere deeper.\n\nIt wasn\'t perfect. Some days the old patterns grabbed him before he could catch them. But the fact that he could catch them at all? That was new.',
        keyInsight:
          'Choosing from your steady center means noticing the push and the pull without letting either one drive — like watching weather instead of being swept up in it.',
      },
      action: {
        prompt:
          'In a conversation with someone you care about today, try speaking from the steady place — not from the part that reaches or the part that retreats. Notice how your voice and your words change.',
      },
      reflection: {
        prompt:
          'What did it feel like to speak from the steadier place? What was different about the conversation?',
      },
    },
    {
      dayIndex: 11,
      learn: {
        story:
          'Nia asked Leo a question one evening: "Do you ever feel like you\'re choosing me on purpose? Not just because we\'re together — but really choosing?"\n\nLeo thought about it. For most of their relationship, he hadn\'t been choosing. He had been reacting. The reaching part would pull him close. The protective part would push him away. He was a pinball bouncing between two bumpers.\n\nBut lately, something was different. He had started to notice the bumpers. And in that noticing, a space opened up. A tiny pause between the impulse and the action. And in that pause, he could actually choose.\n\n"Yeah," he said. "I think I am. Not every moment. But more than before."\n\nThat is what this work is building. Not a life without push and pull — that doesn\'t exist. But a life where you can feel the push, feel the pull, and still choose on purpose. Where the choice is yours, not just a reaction to an old fear.\n\nEvery time you choose from that steady place, you\'re voting for the person you want to be.',
        keyInsight:
          'Real closeness is not the absence of push and pull — it is feeling both and choosing on purpose anyway.',
      },
      action: {
        prompt:
          'At some point today, make a small, deliberate choice toward connection — not because the reaching part is pulling you, but because you choose it from the steady place. Notice the difference.',
      },
      reflection: {
        prompt:
          'What deliberate choice did you make today? What was different about choosing on purpose versus being pulled by the pattern?',
      },
    },

    // ──────────────────────────────────────────────
    // DAYS 12-14 — Integration: seeing the pattern shift, identity reinforcement
    // ──────────────────────────────────────────────
    {
      dayIndex: 12,
      learn: {
        story:
          'Carmen looked back on the past two weeks. She remembered the first day — just noticing the push-pull. How confusing it had been. How she thought there was something wrong with her.\n\nNow she knew the cast of characters inside her. The part that reached. The part that retreated. The steady center underneath. She didn\'t like them all the time. But she knew them. And knowing them changed everything.\n\nBefore, when the retreat happened, Carmen would spiral. "Why am I like this? Why can\'t I just be normal?" Now when it happened she could say, "Oh — there\'s the protective part. It just got activated. It\'s doing its job." That was it. No spiral. No shame. Just recognition.\n\nDeshawn noticed the difference. "You seem more — even," he said. Not that she never pulled away. She did. But the pulling away didn\'t last as long. And she came back with more warmth.\n\nThat is what this journey has been building: not a new personality. Just a new relationship with the one you already have.',
        keyInsight:
          'You haven\'t changed who you are — you\'ve changed your relationship with who you already are, and that changes everything.',
      },
      action: {
        prompt:
          'Look back at how you handled the push-pull at the start of this journey and how you handle it now. What is one thing that\'s different? Tell someone you trust about it — or write it down.',
      },
      reflection: {
        prompt:
          'What has shifted in how you relate to the mixed feelings inside you? What would you tell someone who felt the same confusion you felt on Day 1?',
      },
    },
    {
      dayIndex: 13,
      learn: {
        story:
          'Sam asked Priya what she had learned. Not from a book or an app. Just — what she knew now that she didn\'t know before.\n\nPriya thought about it. "I used to think I was broken because I wanted two things at once," she said. "Now I think that\'s just — being human. But a specific kind of human. The kind who learned to protect themselves really well."\n\nSam nodded. "And now?"\n\n"Now I don\'t need all that protection. Not with you. But the parts that learned it — they don\'t know that yet. So I have to keep reminding them. Gently. Not fighting. Just — reminding."\n\nThis is the practice going forward. Not perfection. Not arriving at some final destination where the push-pull disappears forever. Just the gentle, daily practice of noticing, naming, and choosing from the steady place.\n\nSome days will be easy. Some days the old pattern will grab you before you can blink. That is fine. The practice is the return — not the perfection.\n\nYou\'re becoming someone who can feel everything and still choose. That is not small.',
        keyInsight:
          'The practice is not about never getting pulled by the old pattern — it is about the return, every time, to the steady place where you can choose.',
      },
      action: {
        prompt:
          'Today, notice one moment where the old push-pull pattern shows up — and practice the return. Name it, find the steady place, choose from there. One moment is enough.',
      },
      reflection: {
        prompt:
          'What moment did you practice the return today? What does it feel like to know you can come back to the steady place even when the pattern pulls you?',
      },
    },
    {
      dayIndex: 14,
      learn: {
        story:
          'Fourteen days ago, you started this journey with a question most people never ask: why do I feel pulled in two directions at once?\n\nYou learned that the push and the pull are not enemies. They are two parts of you — both trying to help, both shaped by what you\'ve lived through. You learned to listen to each one instead of fighting them. You found the steady center underneath — the place that can hold both without being controlled by either.\n\nAnd you started to choose from there. Not perfectly. Not every time. But enough that something shifted.\n\nThat shift is yours. No one gave it to you. You built it by showing up, day after day, and doing the quiet work of getting to know yourself.\n\nHere is what\'s true now: you are someone who can feel the reach and the retreat at the same time and still choose. You are someone who knows their own patterns well enough to name them. You are someone who keeps coming back — and that is the whole thing.\n\nThe push and pull won\'t vanish. But you are no longer lost inside them. You know the way to the steady place. And you can always find it again.',
        keyInsight:
          'You are becoming someone who can hold the push and the pull and still choose — and that changes not just your relationship, but who you are inside it.',
      },
      action: {
        prompt:
          'Write down one sentence that captures who you are becoming through this work. Start with "I am someone who..." Put it somewhere you will see it.',
      },
      reflection: {
        prompt:
          'As you look back across these fourteen days — what do you know about yourself now that you didn\'t know before? And what do you want to carry forward?',
      },
    },
  ],
};
