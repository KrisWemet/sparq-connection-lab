import type { StarterJourney } from './types';

export const openingHeart: StarterJourney = {
  id: 'opening-heart',
  title: 'Opening Your Heart Safely',
  duration: 10,
  modalities: ['act', 'ifs'],
  modalityLabel: 'INNER WORLD',
  description:
    'Learning to open the door on your own terms — no pressure, just practice.',
  profileCluster: 'avoidant-low-mod',
  days: [
    // ───────────────────────────── Day 1 ─────────────────────────────
    {
      dayIndex: 1,
      learn: {
        story:
          'Marcus grew up in a house where feelings were treated like spills — something to clean up fast. By the time he was ten he could watch his mom cry and feel nothing at all. Not because he was cold. Because he had learned that the safest thing to do was step back.\n\nWhen he met Priya, she noticed the gap right away. She would reach for his hand and he would find a reason to move. She would ask how he felt and he would talk about what he thought instead.\n\nOne night she said, "I\'m not asking you to be someone else. I just want to know what\'s behind the wall."\n\nMarcus didn\'t have an answer. But for the first time, he noticed the wall was there. Not because he was broken. Because a long time ago, a younger version of him decided that walls keep you safe.\n\nAnd they did. They really did. Until the thing he wanted most — closeness — was on the other side.',
        keyInsight:
          'The wall you built was smart once. Noticing it is the first step — not tearing it down.',
      },
      action: {
        prompt:
          'At some point today, notice one moment where you feel yourself pulling back from closeness. You don\'t need to change it. Just notice it.',
      },
      reflection: {
        prompt:
          'When you noticed yourself stepping back today, what was happening right before that moment?',
      },
    },

    // ───────────────────────────── Day 2 ─────────────────────────────
    {
      dayIndex: 2,
      learn: {
        story:
          'Jenna never thought of herself as guarded. She was friendly. She laughed a lot. She was easy to be around.\n\nBut her partner Tomás started to notice a pattern. Whenever things got too close — a deep talk, a vulnerable moment, even a long hug — Jenna would crack a joke. Change the subject. Find something to do in the kitchen.\n\nOne afternoon Tomás said, "You\'re so good at being fun. I wonder what it\'s like when you\'re not."\n\nIt stung. Not because it was wrong — because it was true.\n\nJenna realized she had a move. The moment things got real, she reached for lightness like a reflex. It wasn\'t fake. She really was fun. But fun had become her exit door whenever something deeper knocked.\n\nShe didn\'t stop being fun after that. She just started noticing the knock. And sometimes — just sometimes — she let herself stay in the room a little longer before reaching for the joke.',
        keyInsight:
          'Stepping back doesn\'t always look like distance. Sometimes it looks like staying busy, staying light, or staying in control.',
      },
      action: {
        prompt:
          'Notice your go-to move today — the thing you do when a moment starts to feel too close. Is it humor? Busyness? Changing the subject? Just name it quietly to yourself.',
      },
      reflection: {
        prompt:
          'What\'s your version of reaching for the joke? What does stepping back look like for you?',
      },
    },

    // ───────────────────────────── Day 3 ─────────────────────────────
    {
      dayIndex: 3,
      learn: {
        story:
          'When David was seven, his dad left for work one morning and didn\'t come home for three years. Nobody explained it. Nobody talked about it. David just learned: people leave. Don\'t need them too much.\n\nThat lesson followed him everywhere. In school he was the kid who didn\'t need help. In friendships he was the one who never asked for anything. With his partner Sam, he was caring and steady — but always at a slight distance. Close enough to be present. Far enough to survive if Sam left.\n\nOne day Sam asked, "What are you afraid would happen if you really let me in?"\n\nDavid\'s first answer was "nothing." His second answer, the one that came later that night when he was alone, was: "That you\'d see all of me and decide it\'s not enough."\n\nThat younger version of David — the seven-year-old standing at the window — had made a decision that kept him safe for twenty years. It was time to say thank you to that kid. And to gently show him that this was a different window, and a different door.',
        keyInsight:
          'The part of you that learned to need less was protecting you from real pain. It deserves thanks — not blame.',
      },
      action: {
        prompt:
          'Take thirty seconds today and quietly thank the part of you that learned to keep things at a safe distance. It kept you going when you needed it most.',
      },
      reflection: {
        prompt:
          'If the younger version of you could hear one thing from who you are now, what would you want them to know?',
      },
    },

    // ───────────────────────────── Day 4 ─────────────────────────────
    {
      dayIndex: 4,
      learn: {
        story:
          'Nia thought she was just independent. She liked her space. She liked solving things on her own. Nothing wrong with that.\n\nBut her partner Eli noticed something. Whenever Nia was stressed or sad, she didn\'t pull closer — she pulled away. She\'d go quiet. Take long walks alone. Say "I\'m fine" with a voice that meant "don\'t follow me."\n\n"You have a guard at the door," Eli told her once. "And the guard is really good at their job."\n\nNia sat with that. A guard at the door. She could almost picture it — this fierce, watchful part of her that stood between her feelings and the world. It had been there so long she forgot it was separate from her.\n\nThe guard wasn\'t her. It was something she carried. Something that had shown up during a hard time and never clocked out.\n\nShe didn\'t try to fire the guard. She just started noticing when it stepped in. And she began to wonder: what was it standing in front of? What was it so sure needed protecting?',
        keyInsight:
          'There\'s a difference between who you are and the guard you carry. Noticing that difference changes everything.',
      },
      action: {
        prompt:
          'The next time you feel yourself going quiet or pulling away today, pause and ask: "Is this me — or is this my guard?"',
      },
      reflection: {
        prompt:
          'What do you think your guard is standing in front of? What does it believe it needs to protect?',
      },
    },

    // ───────────────────────────── Day 5 ─────────────────────────────
    {
      dayIndex: 5,
      learn: {
        story:
          'Carlos and Mei had been together for six years. Mei was warm and open. Carlos was steady and calm. On the surface it worked.\n\nBut Mei started to feel a glass wall between them. Carlos was there, always there — but she couldn\'t quite reach him. Like talking to someone through a window.\n\n"What are you feeling right now?" she asked one night.\n\nCarlos paused. He genuinely didn\'t know. Not because he had no feelings. Because somewhere along the way, a part of him had gotten very good at putting feelings in a box and sliding them under the bed. Quick. Quiet. Before anyone noticed.\n\nThe part that did that wasn\'t trying to hurt Mei. It was trying to keep Carlos safe. Feelings, in his experience, led to chaos. To raised voices. To people walking out. So this part learned: if you don\'t feel it, it can\'t hurt you.\n\nThe thing is — if you don\'t feel the hard stuff, you also can\'t feel the good stuff. The box under the bed doesn\'t sort. It just takes everything.\n\nCarlos didn\'t open the box that night. But he told Mei it was there. And that was more than he\'d ever done before.',
        keyInsight:
          'The part that puts feelings away doesn\'t sort between hard and good. When you shut down the pain, you also shut down the warmth.',
      },
      action: {
        prompt:
          'At one point today, when you notice a feeling — any feeling, even a small one — let yourself sit with it for ten seconds before moving on.',
      },
      reflection: {
        prompt:
          'What did it feel like to stay with a feeling for a moment instead of moving past it?',
      },
    },

    // ───────────────────────────── Day 6 ─────────────────────────────
    {
      dayIndex: 6,
      learn: {
        story:
          'Aisha had two speeds. In charge, or checked out.\n\nWhen things were good, she was the planner, the fixer, the one who held everything together. When things got messy — when her partner Kai wanted to talk about something tender — Aisha\'s brain went somewhere else. Not on purpose. It just left.\n\nKai called it "the lights going off." Aisha hated that phrase. But it was accurate.\n\nOne evening, after Kai shared something hard about their childhood, Aisha realized she\'d spent the whole time thinking about what to make for dinner. She hadn\'t heard a word.\n\nShe felt ashamed. But underneath the shame was something quieter: fear. The kind of fear that doesn\'t shout — it just quietly closes the curtains.\n\nShe started to see it. The part that checked out wasn\'t lazy or careless. It was the same part that had learned, years ago, that other people\'s pain was dangerous. That getting too close to someone\'s hurt meant you might get pulled under.\n\nIt was trying to keep her above water. It just didn\'t know that Kai\'s feelings weren\'t a flood. They were an invitation.',
        keyInsight:
          'Checking out isn\'t laziness. It\'s a part of you that learned that other people\'s feelings are dangerous — and it\'s still running that old program.',
      },
      action: {
        prompt:
          'If someone shares something real with you today, notice whether your mind tries to drift. Gently bring it back — even for a few seconds longer than usual.',
      },
      reflection: {
        prompt:
          'When someone gets close to something real, where does your mind go? What is it trying to protect you from?',
      },
    },

    // ───────────────────────────── Day 7 ─────────────────────────────
    {
      dayIndex: 7,
      learn: {
        story:
          'For most of her life, Rosa kept a clean line between herself and everyone else. Even with her partner James. She loved him. She was sure of that. But love and closeness were two different things in her world.\n\nThen one Tuesday — nothing special about it — James burned dinner and started laughing. Not a small laugh. A full, helpless, tears-in-his-eyes laugh. And something inside Rosa cracked open. Not broke. Cracked. Like light through a door that\'s been closed.\n\nShe started laughing too. And for maybe thirty seconds, the guard wasn\'t there. The wall wasn\'t there. It was just two people laughing in a smoky kitchen.\n\nAfterward she felt strange. Exposed. A little shaky. Her first instinct was to pull back and rebuild the wall. But she noticed something else underneath the shaky feeling: warmth. Like stepping into sunlight after being indoors too long.\n\nShe didn\'t make a big deal of it. She didn\'t announce anything. She just let herself remember what that warmth felt like. And she held onto it — quietly, like a secret she was keeping from her own guard.',
        keyInsight:
          'Opening up doesn\'t have to be a big dramatic moment. Sometimes it\'s thirty seconds of laughing in a smoky kitchen.',
      },
      action: {
        prompt:
          'Find one small moment today to let your guard down — not a big reveal, just a tiny opening. A real answer instead of "I\'m fine." A few extra seconds of eye contact. That\'s enough.',
      },
      reflection: {
        prompt:
          'What did that small opening feel like? What came up — the shaky part, the warm part, or both?',
      },
    },

    // ───────────────────────────── Day 8 ─────────────────────────────
    {
      dayIndex: 8,
      learn: {
        story:
          'Liam had a rule he didn\'t know he had: never ask for help.\n\nHe carried everything himself. Groceries, stress, sadness, problems at work. If someone offered to help, he\'d say "I\'m good" before they finished the sentence.\n\nHis partner Dara saw it clearly. "You let me love you in every way except the way that matters most," she said. "You won\'t let me carry anything."\n\nLiam thought about that for days. He\'d always believed that not needing anyone was strength. That self-sufficiency was the highest form of being okay.\n\nBut Dara wasn\'t offering help because she thought he was weak. She was offering because carrying something together is how people stay close. It\'s the bridge between two separate lives.\n\nThe next week, Liam had a terrible day. Instead of saying "I\'m fine," he sat next to Dara and said, "Today was really hard." That was it. No details. No fix needed.\n\nDara just put her hand on his back. And for the first time in a long time, Liam felt the weight shift. Not gone. Just shared. And that was different from anything he\'d felt before.',
        keyInsight:
          'Letting someone carry something with you isn\'t weakness. It\'s the bridge between being near someone and being close to them.',
      },
      action: {
        prompt:
          'Share one small, true thing with someone today. It doesn\'t need to be deep — just real. "I\'m tired." "That was hard." "I missed you." Let it land without explaining it away.',
      },
      reflection: {
        prompt:
          'What happened when you shared something real without explaining it away? What did you notice in your body?',
      },
    },

    // ───────────────────────────── Day 9 ─────────────────────────────
    {
      dayIndex: 9,
      learn: {
        story:
          'Grace had spent years building a beautiful, solid life. Good job. Nice apartment. A partner, Will, who was patient and kind. Everything looked right.\n\nBut at night, sometimes, she felt a hollow space. Not sadness exactly. More like standing in a house with all the lights on but no one home.\n\nShe realized the hollow feeling wasn\'t about Will. It was about her. She had gotten so good at keeping herself safe — so good at staying behind the glass — that she\'d locked herself inside her own protection.\n\nThe guard she\'d built wasn\'t just keeping people out. It was keeping her in.\n\nOne night she told Will about the hollow feeling. She didn\'t plan it. It just came out. And the moment it did, she wanted to take it back. The guard scrambled. "You\'re being dramatic. He doesn\'t want to hear this. Change the subject."\n\nBut Will just listened. And then he said, "I\'ve been waiting for you to tell me something like that."\n\nThe hollow space didn\'t disappear. But it got a little smaller. Because now someone else knew it was there. And that changed the shape of it.',
        keyInsight:
          'The protection that keeps others out also keeps you locked in. Letting someone see the hollow spaces is how they start to fill.',
      },
      action: {
        prompt:
          'Think of something you\'ve been carrying alone — something your partner doesn\'t know about. You don\'t have to share it today. Just ask yourself: what would it feel like if they knew?',
      },
      reflection: {
        prompt:
          'When you imagine your partner knowing the thing you carry alone, what comes up? Relief, fear, or something in between?',
      },
    },

    // ───────────────────────────── Day 10 ─────────────────────────────
    {
      dayIndex: 10,
      learn: {
        story:
          'Ten days ago, if you had asked Marcus about the wall, he would have said "what wall?" Today, he sees it. He sees when the guard steps in. He notices when his hand pulls away. He catches himself choosing distance out of habit instead of need.\n\nHe hasn\'t torn the wall down. That was never the point. The wall is part of his story. It kept a younger version of him alive in a world that wasn\'t safe.\n\nBut now he gets to choose. That\'s the difference. Before, the guard made every decision. Now Marcus is at the door too. Sometimes he opens it. Sometimes he doesn\'t. But it\'s his hand on the handle.\n\nPriya noticed. She didn\'t say anything big. She just squeezed his hand one morning and he didn\'t pull away. And in that small moment — a moment most people would miss — Marcus felt something he hadn\'t felt in years: he was right there. Present. Not behind glass. Not across the room. Right there.\n\nHe\'s not a different person. He\'s the same person with a door that opens now. And every time he chooses to open it — even a crack — he\'s voting for the kind of person he wants to be.',
        keyInsight:
          'You haven\'t torn down the wall. You\'ve put your hand on the handle. And that changes everything.',
      },
      action: {
        prompt:
          'Choose one moment today to open the door on purpose. A real answer. A longer hug. A moment of eye contact that you hold instead of breaking. Let yourself be right there.',
      },
      reflection: {
        prompt:
          'Over these ten days, what\'s the biggest shift you\'ve noticed in yourself? Not what you think should have changed — what actually did?',
      },
    },
  ],
};
