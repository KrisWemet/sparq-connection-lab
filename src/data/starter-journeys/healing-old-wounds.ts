import type { StarterJourney } from './types';

export const healingOldWounds: StarterJourney = {
  id: 'healing-old-wounds',
  title: 'Healing Old Wounds, Gently',
  duration: 21,
  modalities: ['somatic', 'ifs'],
  modalityLabel: 'GENTLE HEALING',
  description: 'Working gently with the things that stayed with you — at your pace, always.',
  profileCluster: 'disorganized-trauma',
  days: [
    // ── Days 1-4: Establishing safety ──
    {
      dayIndex: 1,
      learn: {
        story:
          "Maya sat on the edge of the bed. Jordan was in the kitchen, humming. Everything was fine. But Maya's body didn't know that yet.\n\nHer shoulders were up near her ears. Her jaw was tight. Her hands were curled into loose fists she hadn't noticed.\n\nNothing had happened. No argument. No sharp word. Just a quiet Sunday morning.\n\nBut somewhere inside, a younger version of Maya was still watching the door. Still waiting for the thing that used to come next.\n\nShe took a breath. Put her feet flat on the floor. Felt the cool wood underneath.\n\nShe didn't try to fix the feeling. She just noticed it was there.\n\nThat was enough for today.",
        keyInsight: 'Your body sometimes carries old signals that have nothing to do with right now — and noticing them is the first step toward feeling safe.',
      },
      action: {
        prompt: "Three times today, pause and feel your feet on the ground. Notice what's happening in your shoulders, your jaw, your hands. You don't need to change anything. Just notice.",
      },
      reflection: {
        prompt: 'When you paused today, what did you notice in your body? Was there any tension you hadn\'t realized was there?',
      },
    },
    {
      dayIndex: 2,
      learn: {
        story:
          "Alex used to think being safe meant nothing bad would happen. That if he could just control enough — plan enough, watch enough — he could keep the ground from shifting.\n\nBut the ground always shifted anyway. And the watching never stopped.\n\nOne evening, Sam found him staring at the wall. \"Where are you right now?\" she asked.\n\n\"I don't know,\" he said. And that was the most honest thing he'd said all day.\n\nSam sat down next to him. Not too close. Just close enough.\n\n\"You're here,\" she said. \"Right here. With me.\"\n\nAlex felt his hands unclench. Not all the way. But enough to notice.\n\nSafety isn't the absence of fear. It's the presence of something steady — even when the fear is still there.",
        keyInsight: 'Safety isn\'t about making fear disappear — it\'s about finding something steady to hold onto while the fear is still there.',
      },
      action: {
        prompt: "Find one thing today that feels steady and real — a warm cup, a familiar chair, your own breath. When the world feels wobbly, come back to that one thing.",
      },
      reflection: {
        prompt: 'What felt steady today? Even one small thing that helped you feel more grounded.',
      },
    },
    {
      dayIndex: 3,
      learn: {
        story:
          "Ria had a habit she never told anyone about. When things got too close — too warm, too good — she would find a reason to leave the room.\n\nNot leave leave. Just... step out. Check her phone. Start a load of laundry. Create a little distance.\n\nShe didn't know why. It wasn't that she didn't want the closeness. She wanted it so much it scared her.\n\nOne night, Devon said something kind. Simple. Real. And Ria felt the pull to get up.\n\nBut this time, she stayed. She put her hand on her own chest. Felt her heartbeat. Fast, but there.\n\n\"I'm here,\" she whispered. To herself.\n\nShe didn't need to understand everything yet. She just needed to stay for one more minute.",
        keyInsight: 'The pull to leave when things feel good is your body trying to protect you from something that happened before — not from what\'s happening now.',
      },
      action: {
        prompt: "If you notice the urge to pull away from a warm moment today, try staying for just ten more seconds. Put a hand on your chest if it helps. You don't need to explain it to anyone.",
      },
      reflection: {
        prompt: 'Did you notice any moments today where your body wanted to create distance? What was happening right before?',
      },
    },
    {
      dayIndex: 4,
      learn: {
        story:
          "Kai had learned something important when he was young: if you make yourself small enough, the loud things pass over you.\n\nIt worked. For a long time, it worked beautifully.\n\nBut now Kai was grown. And the loud things were gone. And he was still making himself small.\n\nNoa noticed. Not because Kai said anything — but because of all the things he didn't say. The opinions he swallowed. The needs he pretended not to have.\n\n\"What do you actually want?\" Noa asked one night.\n\nKai opened his mouth. Closed it. Opened it again.\n\n\"I don't know,\" he said. \"I think I stopped asking a long time ago.\"\n\nThat's the thing about old protection. It was the smartest thing you could do back then. But the person who needed it isn't the person you are now.\n\nYou can start asking again.",
        keyInsight: 'The protection you learned was smart for who you were then — but the person you are now gets to choose something different.',
      },
      action: {
        prompt: "Ask yourself one small question today that you usually skip: What do I actually want right now? It can be tiny — what to eat, where to sit, what to watch. Practice hearing your own answer.",
      },
      reflection: {
        prompt: 'When you asked yourself what you wanted today, what came up? Was it easy or hard to hear your own answer?',
      },
    },

    // ── Days 5-9: Body awareness, gentle exploration ──
    {
      dayIndex: 5,
      learn: {
        story:
          "Maya started noticing something strange. When Jordan raised his voice — even in excitement, even about something good — her whole body went still.\n\nNot calm-still. Frozen-still.\n\nIt happened before she could think about it. Her breath would get shallow. Her shoulders would lock. Something inside would say: don't move.\n\nShe used to think she was just a quiet person. But this wasn't quiet. This was hiding in plain sight.\n\nOne morning, she tried something different. When she felt the freeze coming, she wiggled her toes. Just that. Ten little movements against the floor.\n\nIt sounds small. It was small. But it was her body choosing to move when every old signal said stay still.\n\nThat's what gentle healing looks like. Not a big breakthrough. Just your toes, moving.",
        keyInsight: 'When your body freezes, the smallest movement — even wiggling your toes — is an act of choosing this moment over the old one.',
      },
      action: {
        prompt: "If you notice your body going still or tight today, try the smallest movement you can: wiggle your toes, roll your shoulders, turn your head. Let your body know it's allowed to move.",
      },
      reflection: {
        prompt: 'Did you notice your body going still at any point today? What was the smallest movement you made to come back?',
      },
    },
    {
      dayIndex: 6,
      learn: {
        story:
          "Alex discovered that his body had a map. Not one he could see — but one he could feel.\n\nTension in his neck meant someone was getting too close too fast. A tight stomach meant he expected something bad. Heavy shoulders meant he was carrying something he hadn't put down in years.\n\nHe used to ignore these signals. Push through. Keep going.\n\nBut Sam encouraged him to try something different: just listen.\n\nNot fix. Not analyze. Just listen.\n\nSo when his neck got tight at dinner, he paused. \"My neck is tight,\" he said. Not to Sam — to himself.\n\nAnd something in him softened. Not because the feeling went away. But because someone finally heard it.\n\nThat someone was him.",
        keyInsight: 'Your body has been sending you messages for years — and sometimes the most healing thing you can do is simply listen.',
      },
      action: {
        prompt: "Check in with your body three times today. Put a hand wherever you feel tension — neck, chest, stomach. Say quietly: \"I hear you.\" That's all.",
      },
      reflection: {
        prompt: 'Where does your body hold tension? When you checked in today, did anything shift — even slightly?',
      },
    },
    {
      dayIndex: 7,
      learn: {
        story:
          "Ria learned to breathe a certain way when she was young. Shallow. Quiet. The kind of breathing that doesn't take up space.\n\nShe never unlearned it.\n\nSo when Devon suggested they try something together — just breathing, slowly — Ria almost laughed. She breathed all the time. What was the big deal?\n\nBut when she actually tried a deep breath — the kind that fills your belly, that makes your ribs expand — she felt a wave of something she couldn't name.\n\nNot sadness, exactly. More like... relief. Like her lungs had been waiting for permission.\n\nShe took three more breaths. Each one a little deeper.\n\n\"That feels different,\" she said.\n\n\"Yeah,\" Devon said. \"It does.\"\n\nYour breath is the one thing that lives in both worlds — the world you can control and the world you can't. When you breathe deeply, you're telling your body: there's room for you here.",
        keyInsight: 'A deep breath is your body\'s way of saying: I\'m allowed to take up space.',
      },
      action: {
        prompt: "Take five slow, deep breaths today — the kind that fills your belly. Notice what happens in your body when you let yourself breathe fully. If feelings come up, let them pass.",
      },
      reflection: {
        prompt: 'What did it feel like to breathe deeply today? Did anything come up that surprised you?',
      },
    },
    {
      dayIndex: 8,
      learn: {
        story:
          "Kai had a secret: he was always bracing.\n\nAt restaurants, he sat facing the door. In conversations, he was three steps ahead — already planning his exit if things went wrong. In bed at night, he slept with one ear open.\n\nHe wasn't doing it on purpose. His body had been doing it so long it felt like personality.\n\nBut it wasn't personality. It was protection that had outlived its purpose.\n\nNoa asked him once: \"What would it feel like to stop bracing?\"\n\nKai thought about it. Really thought.\n\n\"I don't know,\" he said. \"I think it would feel like falling.\"\n\n\"What if I told you,\" Noa said, \"that the ground is already there?\"\n\nKai didn't believe it yet. But he heard it. And hearing it was the start.",
        keyInsight: 'You\'ve been bracing for something that already happened — and the ground beneath you is more solid than you think.',
      },
      action: {
        prompt: "Notice one moment today when you're bracing — tensing for something that hasn't happened yet. When you catch it, try softening your body by just five percent. Not all the way. Just five percent.",
      },
      reflection: {
        prompt: 'When did you notice yourself bracing today? What were you expecting to happen — and did it?',
      },
    },
    {
      dayIndex: 9,
      learn: {
        story:
          "Maya tried something that terrified her.\n\nShe told Jordan about the freeze. Not all of it. Not the whole story. Just one piece.\n\n\"Sometimes when you raise your voice, even when you're happy, my body goes still. It's not about you. It's old.\"\n\nShe said it fast, like ripping off a bandage.\n\nJordan didn't flinch. Didn't get defensive. He just looked at her.\n\n\"Thank you for telling me that,\" he said.\n\nMaya felt her eyes sting. She'd been carrying that alone for so long. Not because Jordan wouldn't understand — but because some part of her believed that saying it would make it worse.\n\nIt didn't make it worse. It made it lighter.\n\nYou don't have to share everything. You don't even have to share most of it. But one true sentence, said to someone safe — that can change the weight of what you carry.",
        keyInsight: 'You don\'t have to share everything — just one true sentence to someone safe can change the weight of what you carry.',
      },
      action: {
        prompt: "If it feels safe, share one small, true thing with someone you trust today. It doesn't have to be heavy. It just has to be real. If today isn't the day — that's okay too.",
      },
      reflection: {
        prompt: 'Did you share something today? If so, what happened? If not, what held you back — and is that okay with you right now?',
      },
    },

    // ── Days 10-14: Meeting the protective parts ──
    {
      dayIndex: 10,
      learn: {
        story:
          "Alex started to notice something: there wasn't just one version of him inside. There were several.\n\nThere was the Alex who wanted closeness — who leaned toward Sam in the kitchen, who reached for her hand during movies.\n\nAnd there was another Alex. The one who pulled the first Alex back. The one who said: not too close. Don't get comfortable. You know what happens next.\n\nHe used to think the second voice was the enemy. The thing he needed to defeat.\n\nBut one night, sitting quietly, he asked that voice a question he'd never asked before: \"What are you protecting me from?\"\n\nThe answer came before he could think: \"From being hurt the way you were before.\"\n\nAnd suddenly the voice wasn't an enemy. It was a guard. A tired one, who'd been standing at the door for decades.\n\nYou don't have to fire the guard. You just need to let him know that you're older now. And that you can help carry the watch.",
        keyInsight: 'The part of you that holds back isn\'t your enemy — it\'s a guard who has been protecting you for a very long time.',
      },
      action: {
        prompt: "When you notice the part of you that pulls back from closeness today, try saying inwardly: \"I know you're trying to protect me. Thank you. I'm here now.\"",
      },
      reflection: {
        prompt: 'What did you notice when you acknowledged your inner guard today? Did anything shift — even a little?',
      },
    },
    {
      dayIndex: 11,
      learn: {
        story:
          "Ria found a photo of herself at eight years old. Big eyes. Careful smile. Hands folded in her lap like she was trying to take up as little space as possible.\n\nShe stared at that photo for a long time.\n\nThat little girl had figured out something important: if you're quiet enough, if you're good enough, if you don't need too much — you stay safe.\n\nAnd it worked. She made it through.\n\nBut the rules that saved the eight-year-old were still running the show. And the grown-up Ria was tired of being small.\n\n\"You did such a good job,\" Ria whispered to the photo. \"But I can take it from here.\"\n\nShe didn't feel different right away. But something in her chest loosened. Like a knot that had been tied so long it forgot it was a knot.\n\nHonoring what saved you is the first step toward releasing it.",
        keyInsight: 'Honoring the part of you that kept you safe is the first step toward releasing the rules you no longer need.',
      },
      action: {
        prompt: "Think of one rule you learned young — be quiet, don't need too much, always be good. Say to yourself: \"That rule kept me safe then. I get to choose differently now.\"",
      },
      reflection: {
        prompt: 'What old rule came to mind? How does it feel to tell yourself you get to choose differently now?',
      },
    },
    {
      dayIndex: 12,
      learn: {
        story:
          "Kai noticed that his guard had a pattern. It showed up loudest right before good things.\n\nWhen Noa said \"I love you,\" the guard braced. When a weekend was going well, the guard started scanning for what would go wrong. When things were calm, the guard whispered: this can't last.\n\nKai used to think that meant he was broken. That he couldn't accept good things.\n\nBut it wasn't that. The guard wasn't afraid of good things. It was afraid of losing them.\n\nBecause in Kai's history, good things had been taken away. And the guard's job was to make sure the fall didn't hurt as much.\n\nKai sat with that. The guard was trying to soften the landing. It wasn't broken. It was devoted.\n\n\"I know,\" Kai said quietly. \"I know you're scared of the fall. But what if this time, we land somewhere soft?\"",
        keyInsight: 'Your guard doesn\'t fear good things — it fears losing them, because that\'s what happened before.',
      },
      action: {
        prompt: "Notice one good moment today and let yourself have it for ten extra seconds before your mind starts scanning for what could go wrong. Just ten seconds of \"this is good.\"",
      },
      reflection: {
        prompt: 'Were you able to hold a good moment a little longer today? What did your guard say — and what did you say back?',
      },
    },
    {
      dayIndex: 13,
      learn: {
        story:
          "Maya was starting to understand something she'd never put into words.\n\nThe old wound wasn't just one thing that happened. It was everything her body learned from it. The way she held her breath. The way she read every room. The way she could feel a shift in someone's mood before they knew it themselves.\n\nThose were gifts, in a way. She was one of the most perceptive people Jordan had ever met.\n\nBut they came at a price. Because the radar never turned off. And being alert all the time is exhausting.\n\n\"What if you could keep the gift,\" Jordan said one night, \"but put down the weight?\"\n\nMaya thought about that. Keep the seeing. Put down the watching.\n\nThat's what this work is. Not erasing what happened. Not forgetting what you learned. But choosing which parts you carry forward — and which parts you set down, gently, because they're no longer yours to hold.",
        keyInsight: 'Healing isn\'t about erasing what happened — it\'s about choosing which parts you carry forward and which ones you gently set down.',
      },
      action: {
        prompt: "Think of one thing your difficult experience taught you that you want to keep — a strength, a sensitivity, a gift. And one thing you're ready to set down. You don't have to do anything with this. Just name them.",
      },
      reflection: {
        prompt: 'What do you want to keep? What are you ready to set down? There\'s no wrong answer here.',
      },
    },
    {
      dayIndex: 14,
      learn: {
        story:
          "Alex had a dream. In it, he was standing in a house he'd lived in as a child. All the doors were locked.\n\nHe walked through the hallway, trying each handle. Locked. Locked. Locked.\n\nThen he noticed something: he had keys in his pocket. He'd had them the whole time.\n\nHe woke up and lay in the dark, heart beating. Sam was asleep beside him.\n\nHe didn't need to interpret the dream. He already knew what it meant.\n\nThe locked rooms were the parts of his story he'd sealed off. And the keys — they'd been with him all along. He just hadn't known he was allowed to use them.\n\nHe didn't have to open every door. Not today. Maybe not ever.\n\nBut knowing he had the keys — that changed everything.",
        keyInsight: 'You already have what you need to open the doors you\'re ready for — and no one gets to decide which doors but you.',
      },
      action: {
        prompt: "Choose one small door today — one conversation, one memory, one feeling you usually avoid. You don't have to walk through it. Just put your hand on the handle and notice how it feels.",
      },
      reflection: {
        prompt: 'Did you find a door today? What was it, and what happened when you reached for the handle?',
      },
    },

    // ── Days 15-18: Gently working with old patterns ──
    {
      dayIndex: 15,
      learn: {
        story:
          "Ria had started to notice the pattern more clearly now. Not just the freeze. Not just the pulling away.\n\nThe whole cycle.\n\nCloseness → warmth → the alarm → the exit → guilt → trying harder → closeness again.\n\nRound and round.\n\nShe used to blame herself for the cycle. Now she could see it wasn't a flaw. It was a loop her body had learned. And loops can be interrupted.\n\nNot by force. Not by willpower. But by one tiny pause at the right moment.\n\nThe moment between the alarm and the exit. That's where the choice lives.\n\nRia didn't always catch it. But more and more, she did. And each time she paused instead of exited, something inside rewrote itself — not with words, but with experience.\n\nThis is how patterns change: not by understanding them, but by interrupting them with something different.",
        keyInsight: 'Patterns don\'t change when you understand them — they change when you interrupt them with something different, one pause at a time.',
      },
      action: {
        prompt: "Watch for the moment between the alarm and your usual reaction today. When you catch it, take one breath before doing anything. That one breath is the interruption.",
      },
      reflection: {
        prompt: 'Did you catch the moment between the alarm and your reaction today? What happened when you paused?',
      },
    },
    {
      dayIndex: 16,
      learn: {
        story:
          "Kai was learning something counterintuitive: you can feel two things at once.\n\nAfraid and hopeful. Guarded and curious. Hurt and healing.\n\nHe used to think he had to pick one. That feeling afraid meant he wasn't getting better. That still bracing meant the work wasn't working.\n\nBut Noa said something that stopped him: \"What if getting better doesn't mean the fear goes away? What if it means you stop letting the fear choose for you?\"\n\nKai sat with that.\n\nThe fear was still there. It might always be there. But now there was something next to it — a small, steady voice that said: I know you're scared. And I'm going to try anyway.\n\nTwo things at once. Fear and forward.",
        keyInsight: 'Healing doesn\'t mean the fear goes away — it means you stop letting it make your decisions.',
      },
      action: {
        prompt: "Notice one moment today where you feel two things at once — afraid and brave, guarded and curious. Let both be true. You don't have to pick one.",
      },
      reflection: {
        prompt: 'What two feelings showed up at the same time today? How did it feel to let both be there?',
      },
    },
    {
      dayIndex: 17,
      learn: {
        story:
          "Maya realized she'd been waiting for a moment. A big, clear moment when she would know she was healed. When the old signals would stop. When she could finally relax.\n\nBut that moment never came. Not in the way she imagined.\n\nInstead, something quieter happened. She stopped flinching at the sound of the front door. She slept through the night three times in a row. She laughed — really laughed — at something Jordan said, without checking his face afterward.\n\nNone of these were dramatic. None of them felt like breakthroughs.\n\nBut when she looked back over the past few weeks, she could see the trail. Small shifts. Tiny freedoms. Moments where her body chose now instead of then.\n\nThat's what healing looks like most of the time. Not a thunderclap. Just a quiet Tuesday where you forget to be afraid.",
        keyInsight: 'Healing usually looks like a quiet Tuesday where you forget to be afraid — not a dramatic breakthrough.',
      },
      action: {
        prompt: "Look back over the past week. Can you find one moment — even tiny — where your body chose the present instead of the past? Name it. Let it count.",
      },
      reflection: {
        prompt: 'What quiet shift did you notice this week? Something that would be invisible to anyone else but means something to you.',
      },
    },
    {
      dayIndex: 18,
      learn: {
        story:
          "Alex decided to try something that would have been impossible three weeks ago.\n\nHe told Sam something true about his past. Not the facts — she knew those. But the feeling.\n\n\"I grew up thinking that if I was good enough, the bad things would stop happening,\" he said. \"And when they didn't stop, I decided I wasn't good enough.\"\n\nSam didn't try to fix it. She just said: \"That must have been so lonely.\"\n\nAnd Alex felt something crack open. Not painfully. More like a window in a stuffy room.\n\nHe'd been carrying that sentence — I'm not good enough — for thirty years. And hearing someone say \"that sounds lonely\" instead of \"that's not true\" was the thing that finally let air in.\n\nSometimes we don't need someone to argue with our pain. We just need them to see it clearly.",
        keyInsight: 'Sometimes we don\'t need someone to fix our pain — we just need them to see it, clearly and without flinching.',
      },
      action: {
        prompt: "If it feels safe, share one thing with someone you trust — not the facts, but the feeling underneath. If today isn't the right day, write it down instead. Either way, let it out of you.",
      },
      reflection: {
        prompt: 'Did you share the feeling, or write it down? What happened inside you when you let it out?',
      },
    },

    // ── Days 19-21: Integration, honoring, identity reinforcement ──
    {
      dayIndex: 19,
      learn: {
        story:
          "Ria was sitting with Devon on the porch. The sun was going down. Nothing special was happening.\n\nAnd for the first time in as long as she could remember, she wasn't scanning. Wasn't watching the door. Wasn't calculating how close was too close.\n\nShe was just... sitting.\n\nThe guard was still there — she could feel it, like a familiar weight. But it wasn't standing at attention anymore. It was sitting down, too.\n\nRia put her hand over her heart. Felt the steady beat.\n\n\"Thank you,\" she whispered. To the guard. To the younger Ria who had built it. To the version of herself who had decided, three weeks ago, to try something different.\n\nShe didn't know if she was healed. She didn't think that was the right word.\n\nBut she was lighter. And that was real.",
        keyInsight: 'You may not be \"healed\" in the way you imagined — but you are lighter, and that is something deeply real.',
      },
      action: {
        prompt: "Take a moment to thank your inner guard today. It has been protecting you for a long time. Let it know you're here now, and it can rest.",
      },
      reflection: {
        prompt: 'How does it feel to thank the part of you that has been protecting you all this time?',
      },
    },
    {
      dayIndex: 20,
      learn: {
        story:
          "Kai made a list. Not because anyone asked him to — but because he wanted to see it.\n\nThings that are different now:\n\nI sleep a little deeper.\nI flinch a little less.\nI can stay in a good moment three seconds longer than before.\nI asked for what I wanted — once — and the world didn't end.\nI told Noa something true and they didn't leave.\n\nIt wasn't a long list. But each item on it was a door he'd opened. A room he'd stepped into. A piece of ground he'd reclaimed.\n\nKai looked at the list and felt something unfamiliar: pride.\n\nNot the loud kind. The quiet kind. The kind that comes from knowing you did something hard, and you did it gently, and you're still here.\n\nYou're still here.",
        keyInsight: 'The quiet pride of doing something hard, gently, and still being here — that is the deepest kind of strength.',
      },
      action: {
        prompt: "Make your own list today. What is different now — even slightly — compared to three weeks ago? Let the small things count. They always counted.",
      },
      reflection: {
        prompt: 'What\'s on your list? Read it back to yourself. How does it feel to see how far you\'ve come?',
      },
    },
    {
      dayIndex: 21,
      learn: {
        story:
          "This is the last day of this journey. But it's not the end of anything.\n\nYou came here carrying something heavy. Something old. Something that shaped how you moved through the world and how you let people in.\n\nAnd over the past three weeks, you didn't make it disappear. You didn't outrun it. You didn't pretend it wasn't there.\n\nYou turned toward it. Gently. With your hands open.\n\nYou listened to your body. You met the guard. You thanked the younger version of yourself who built the wall. And then you started — slowly, carefully, at your own pace — to let a little more light in.\n\nYou're not a different person than you were three weeks ago. You're the same person with more room inside. More space between the alarm and the choice. More trust that the ground is there.\n\nYou're becoming someone who can hold their own history with tenderness and still choose to move forward.\n\nThat takes real courage. And you showed up for it. Every single day.\n\nI'm so proud of you. 🦦",
        keyInsight: 'You\'re the same person with more room inside — and that makes all the difference.',
      },
      action: {
        prompt: "Tell someone — your partner, a friend, or yourself in the mirror — one thing you're proud of from this journey. Let yourself hear it said out loud.",
      },
      reflection: {
        prompt: 'As you finish this journey, what do you want to carry forward? And what are you finally ready to set down?',
      },
    },
  ],
};
