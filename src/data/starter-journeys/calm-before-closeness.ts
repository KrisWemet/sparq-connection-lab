import type { StarterJourney } from './types';

export const calmBeforeCloseness: StarterJourney = {
  id: 'calm-before-closeness',
  title: 'Finding Calm Before Closeness',
  duration: 14,
  modalities: ['act', 'dbt'],
  modalityLabel: 'INNER CALM',
  description:
    'Finding your ground before you let someone in — quiet, powerful work.',
  profileCluster: 'avoidant-high-dysreg',
  days: [
    // ──────────────────────────────────────────────
    // Days 1-3 — SURFACE: noticing the body's signals, honoring the need for space
    // ──────────────────────────────────────────────
    {
      dayIndex: 1,
      learn: {
        story:
          'Marcus got home from work and his wife Priya was waiting at the door. She wanted to talk about their weekend plans. Nothing big. But something inside Marcus went tight. His chest. His jaw. He didn\'t know why. He just knew he needed five minutes alone first.\n\nHe used to push through it. Smile, nod, answer her questions while his body screamed for quiet. That never went well. He\'d get short with her. She\'d feel shut out. They\'d both end the night hurt.\n\nOne day Marcus tried something different. He said, "I want to hear about this. Give me five minutes to land first." He went to the kitchen. Drank a glass of water. Took three slow breaths. When he came back, he was actually there.\n\nPriya noticed. She said it was the first time in weeks he\'d really looked at her when she talked.\n\nMarcus didn\'t do anything dramatic. He just listened to what his body was asking for — and gave it five minutes.',
        keyInsight:
          'Your body tells you what it needs before your mind figures it out.',
      },
      action: {
        prompt:
          'At some point today, notice when your body gets tight or restless. You don\'t have to fix it. Just notice where you feel it.',
      },
      reflection: {
        prompt:
          'Where in your body did you feel that tightness today? What was happening around you when it showed up?',
      },
    },
    {
      dayIndex: 2,
      learn: {
        story:
          'Ava loved her partner Leo. She also loved her quiet mornings. Coffee. No talking. Just stillness before the day started.\n\nLeo was a morning person who woke up ready to connect. He\'d sit beside her and start sharing — plans, thoughts, something funny he read. Ava would feel her shoulders creep up toward her ears. She\'d give one-word answers. Leo would get quiet, and not the good kind.\n\nAva felt guilty. She wondered if something was wrong with her. Other people seemed to wake up ready for closeness. She needed space first.\n\nThen she read something that changed things: needing space isn\'t the opposite of love. It\'s how some people get ready for it.\n\nShe told Leo, "My quiet mornings aren\'t about you. They\'re how I get ready to be with you." He didn\'t understand right away. But he noticed that on mornings when she had her quiet time, she reached for his hand first at breakfast.\n\nThe space wasn\'t pushing him away. It was how she found her way back.',
        keyInsight:
          'Needing space before closeness is not a wall — it\'s a door that opens from the inside.',
      },
      action: {
        prompt:
          'Give yourself ten minutes of quiet today. No screens, no tasks. Just be still. Notice how you feel before and after.',
      },
      reflection: {
        prompt:
          'What did that quiet time feel like? Did anything shift inside you after it?',
      },
    },
    {
      dayIndex: 3,
      learn: {
        story:
          'Darnell had a word for what happened when things got too close too fast. He called it "the buzzing." It started in his hands. Then his chest. Then his whole body felt like it needed to move — away from the conversation, away from the room, away.\n\nHis girlfriend Keisha used to take it personally. She thought he was bored or angry. He wasn\'t. He was flooded. Too much feeling, all at once, with no place to put it.\n\nDarnell started paying attention to the buzzing. Not fighting it. Just noticing when it showed up. He found a pattern. It came when Keisha asked how he felt. It came when she cried. It came when she got very close and looked right at him.\n\nHe wasn\'t running from her. He was running from the intensity of caring about her. The feelings were big. His body didn\'t know what to do with big feelings yet.\n\nThe first step wasn\'t solving it. It was just seeing the pattern clearly.',
        keyInsight:
          'The urge to step back often means the feelings are big — not that they\'re wrong.',
      },
      action: {
        prompt:
          'Notice one moment today when you feel the pull to step back from someone. Just name it silently: "There it is."',
      },
      reflection: {
        prompt:
          'When did the pull to step back show up today? What were you feeling right before it came?',
      },
    },

    // ──────────────────────────────────────────────
    // Days 4-7 — MEANINGFUL: understanding what overwhelm feels like, what stirs it
    // ──────────────────────────────────────────────
    {
      dayIndex: 4,
      learn: {
        story:
          'Sonia grew up in a loud house. Her parents argued most nights. She learned early that when voices got big, the safest thing was to get small. Be quiet. Don\'t need anything. Handle it yourself.\n\nThat worked when she was ten. It kept her safe. It kept things calm.\n\nBut she wasn\'t ten anymore. She was thirty-two, married to someone kind, and she was still getting small every time her husband Tomás raised his voice — even when he was just excited about a football game.\n\nHer body couldn\'t tell the difference between danger and volume. It treated all intensity the same way: shut down, go quiet, disappear.\n\nSonia didn\'t need to stop protecting herself. That part of her had done important work. She just needed to teach her body that this house was different from the one she grew up in.\n\nThat kind of teaching doesn\'t happen in one day. It happens in small, safe moments. One at a time.',
        keyInsight:
          'The part of you that learned to protect yourself did its job well — it just doesn\'t know the situation has changed.',
      },
      action: {
        prompt:
          'When something feels intense today, pause and ask yourself: "Is this actually dangerous, or does it just feel familiar?"',
      },
      reflection: {
        prompt:
          'Was there a moment today where your body reacted to something that wasn\'t actually a threat? What did you notice?',
      },
    },
    {
      dayIndex: 5,
      learn: {
        story:
          'James and Rina had a good week. No arguments. Easy mornings. Laughing at dinner. Then Saturday came and Rina said, "I feel so close to you right now."\n\nJames should have felt good. Instead, something in his chest clenched. He changed the subject. Rina\'s face fell, just for a second, and James hated himself for it.\n\nHe couldn\'t explain it to her because he couldn\'t explain it to himself. Why did closeness feel like standing at the edge of a cliff?\n\nHere\'s what James didn\'t know yet: for some people, closeness itself is what stirs the alarm. Not fighting. Not distance. The good stuff. Because the good stuff is where you have the most to lose.\n\nHis body wasn\'t broken. It was doing math — calculating that the closer he got, the more it would hurt if it fell apart. That\'s not a flaw. It\'s a body that learned to be careful.\n\nThe work isn\'t forcing yourself to stay. It\'s understanding why leaving feels safer — and deciding, with your eyes open, what you want to do with that.',
        keyInsight:
          'Sometimes closeness stirs the alarm not because something is wrong — but because something matters.',
      },
      action: {
        prompt:
          'If you feel a wave of warmth or closeness with someone today, stay with it for three extra seconds before you do anything else. Just three.',
      },
      reflection: {
        prompt:
          'Did you catch a moment of closeness today? What happened inside you when you stayed with it — even briefly?',
      },
    },
    {
      dayIndex: 6,
      learn: {
        story:
          'Wei had a list. Not written down — just in his body. The list of things that made everything feel like too much.\n\nHis partner Asha crying — too much. Being asked "what are you feeling?" — too much. Long hugs — too much. Silence that felt like it was waiting for him to fill it — too much.\n\nFor years Wei thought the list meant he was bad at relationships. Other people seemed to handle these things easily. He\'d watch couples at dinner, leaning in, sharing, and wonder what was wrong with him.\n\nNothing was wrong with him. He just had a shorter runway before the engine overheated. Some people can take in a lot of emotional information at once. Others need it in smaller doses.\n\nWei started mapping his list — not to fix it, but to know it. He noticed his limit usually hit when two things happened at once: strong feeling plus expectation to respond. The feeling alone was okay. The expectation alone was okay. Together they were too much.\n\nKnowing the pattern didn\'t make it disappear. But it gave him something he\'d never had before: a chance to see it coming.',
        keyInsight:
          'Knowing what tips you over the edge is the first step to staying on solid ground.',
      },
      action: {
        prompt:
          'Think about the last time something felt like "too much." What were the pieces? Was it the feeling, the timing, someone\'s expectation — or a mix?',
      },
      reflection: {
        prompt:
          'What does "too much" actually look like for you? If you could describe it in one or two pieces, what are they?',
      },
    },
    {
      dayIndex: 7,
      learn: {
        story:
          'Carmen\'s therapist once asked her, "What does safe feel like in your body?" Carmen stared at her. She had no idea.\n\nShe knew what unsafe felt like — tight throat, shallow breath, hands that wanted to grip something or leave. She knew what numb felt like — flat, far away, watching herself from the outside. But safe? She couldn\'t find it.\n\nSo she went looking. Not in big moments. In tiny ones. The warmth of her coffee mug in both hands. The weight of her dog sleeping on her feet. The sound of rain when she had nowhere to be.\n\nSlowly she built a map. Safe felt like: warm hands. Slow breathing. A soft belly. No urgency to be anywhere else.\n\nShe started checking for those signals during conversations with her partner Miguel. Sometimes they were there. Sometimes they weren\'t. On the days they weren\'t, she now knew what was missing — and that was everything.\n\nYou can\'t move toward something you can\'t name. Carmen named it.',
        keyInsight:
          'Before you can find calm with someone else, you need to know what calm feels like alone.',
      },
      action: {
        prompt:
          'At some quiet moment today, check in with your body. Where does safe live? Warm hands? Slow breath? Soft shoulders? Find one signal that says "I\'m okay right now."',
      },
      reflection: {
        prompt:
          'What does calm feel like in your body? Describe one physical signal you noticed today.',
      },
    },

    // ──────────────────────────────────────────────
    // Days 8-11 — DEEP: building regulation skills, finding calm inside closeness
    // ──────────────────────────────────────────────
    {
      dayIndex: 8,
      learn: {
        story:
          'Nadia discovered something by accident. She was on the phone with her sister, getting worked up about a bill. Her heart was pounding, her voice was rising. Then she looked out the window and saw her neighbor\'s cat sitting perfectly still on a fence post.\n\nShe watched it for maybe ten seconds. Her breathing slowed. The conversation kept going but something inside her had shifted. She still cared about the bill. She just wasn\'t drowning in it.\n\nShe told her partner Eli about it later. He laughed. "You got regulated by a cat." But she was onto something.\n\nWhat happened was simple: her body found an anchor. Something steady and present that pulled her out of the spin. The cat wasn\'t doing anything special. It was just still. And stillness is contagious.\n\nNadia started collecting anchors. The sound of the dishwasher. The feeling of her feet on the floor. The blue stripe on her coffee mug. Tiny, boring things that her body could grab onto when the inside got loud.\n\nThe anchors didn\'t stop the feelings. They gave her a place to stand while the feelings moved through.',
        keyInsight:
          'An anchor is anything steady your body can hold onto when your inside world gets loud.',
      },
      action: {
        prompt:
          'Pick one small, steady thing you can see or feel right now. Let your attention rest on it for five slow breaths. That\'s your anchor for today.',
      },
      reflection: {
        prompt:
          'What did you choose as your anchor? What happened inside you when you held your attention there?',
      },
    },
    {
      dayIndex: 9,
      learn: {
        story:
          'Raj used to hold his breath during hard conversations. He didn\'t know he was doing it until his wife Meera pointed it out. "You stop breathing when I bring up anything serious," she said. He thought she was exaggerating. Then he paid attention. She was right.\n\nHolding your breath is your body\'s way of bracing. It\'s saying: something is coming. Get ready. The problem is, a body that\'s bracing can\'t listen. It can\'t be soft. It can\'t connect.\n\nRaj tried something small. When Meera started a serious conversation, he\'d take one deep breath before he responded. Not a dramatic one. Just enough to remind his body that he was safe and this was his wife, not a threat.\n\nThe first few times, it felt forced. By the second week, his body started to expect it. Breathe first, then respond. Like a reset button between the alarm and the reaction.\n\nMeera noticed before Raj did. "You\'re different when you breathe," she said. "You\'re actually here."\n\nOne breath. That was the whole trick. Not a meditation practice. Not a technique. One breath that said to his body: you\'re safe. Stay.',
        keyInsight:
          'One breath between the alarm and the reaction changes everything that follows.',
      },
      action: {
        prompt:
          'Before you respond to something today — anything, even a small thing — take one slow breath first. Notice what shifts.',
      },
      reflection: {
        prompt:
          'Did you catch yourself taking that breath today? What was different about the moment that followed?',
      },
    },
    {
      dayIndex: 10,
      learn: {
        story:
          'For most of their relationship, Owen handled hard feelings by leaving the room. Not slamming doors — just quietly disappearing. A walk. The garage. His phone in another room. His partner Jess learned not to follow.\n\nOwen thought leaving was the responsible thing. Better to step away than say something he\'d regret. And he was partly right — space can be good. But Owen wasn\'t using space to come back. He was using it to never arrive.\n\nThe shift happened when Owen tried something new. Instead of leaving, he said, "I need a minute, but I\'m staying in the room." He sat on the other end of the couch. Didn\'t talk. Didn\'t look at Jess. Just breathed and let the wave pass while she was still nearby.\n\nIt was uncomfortable. His whole body wanted to bolt. But he stayed. And something strange happened — the wave peaked and it passed. Right there, with another person in the room.\n\nOwen didn\'t know it yet, but he was teaching his body the most important lesson: you can feel a lot and still be here. Those two things can live in the same room.',
        keyInsight:
          'Staying in the room while you feel something hard is how your body learns that closeness and calm can exist together.',
      },
      action: {
        prompt:
          'If you feel the pull to leave a conversation or a room today, try staying ten seconds longer than your body wants. Just ten.',
      },
      reflection: {
        prompt:
          'Did you stay somewhere a little longer than felt comfortable today? What happened inside you during those extra seconds?',
      },
    },
    {
      dayIndex: 11,
      learn: {
        story:
          'Lena used to think she had to choose: feel her feelings OR be present with her partner. Both at the same time seemed impossible. If she was feeling something, she needed to go process it alone. If she was with Daniel, she needed to be "fine."\n\nDaniel never asked her to be fine. That was Lena\'s rule, not his.\n\nOne night they were watching a movie and a scene hit Lena hard — a father saying goodbye to his daughter. Her eyes stung. Her throat closed. Every part of her wanted to excuse herself and cry alone in the bathroom.\n\nInstead she stayed. Let the tears come. Didn\'t explain them. Daniel didn\'t ask. He just moved closer and put his hand on her knee.\n\nNothing broke. Nobody panicked. The world didn\'t end because Lena felt something with a witness.\n\nThat was the night Lena realized the rule she\'d been following — feel alone, connect when stable — wasn\'t keeping her safe. It was keeping her apart.\n\nYou don\'t have to be calm to be close. Sometimes being close is what brings the calm.',
        keyInsight:
          'You don\'t have to be settled before you let someone in — sometimes letting them in is what settles you.',
      },
      action: {
        prompt:
          'If a feeling comes up today while you\'re with someone, let it be there. You don\'t have to name it or explain it. Just don\'t hide it.',
      },
      reflection: {
        prompt:
          'Was there a moment today where you let a feeling exist without hiding it? What was that like?',
      },
    },

    // ──────────────────────────────────────────────
    // Days 12-14 — INTEGRATION: bringing calm into connection, identity reinforcement
    // ──────────────────────────────────────────────
    {
      dayIndex: 12,
      learn: {
        story:
          'After two weeks of paying attention to his body, Marcus — the same Marcus from Day 1 — noticed something had changed. Not everything. Not dramatically. But something.\n\nHe still needed his five minutes when he got home. He still felt the tightness. But now he could feel it coming before it arrived. Like weather on the horizon. And because he could see it coming, he had a choice.\n\nSome nights he\'d say to Priya, "Give me a few minutes to land." Other nights the tightness would show up and he\'d breathe through it, and it would pass on its own. He had options now.\n\nThe biggest change was invisible. Marcus used to believe the tightness meant something was wrong with him — that he wasn\'t built for closeness. Now he understood it differently. The tightness was just his body\'s way of saying, "A lot is happening. Slow down."\n\nThat\'s not a flaw. That\'s information.\n\nPriya noticed too. Not because Marcus told her what he was working on, but because she could feel it. He was more there. Not perfectly. Not always. But more.',
        keyInsight:
          'The signals don\'t have to disappear — you just need to hear what they\'re actually saying.',
      },
      action: {
        prompt:
          'When you feel your body\'s signal today, try responding to it like a message instead of an alarm. What is it asking for?',
      },
      reflection: {
        prompt:
          'How has your relationship with your body\'s signals shifted since you started paying attention? What feels different now?',
      },
    },
    {
      dayIndex: 13,
      learn: {
        story:
          'Keisha had been watching Darnell change. She didn\'t know what he was doing exactly — he hadn\'t told her about the breathing or the anchors or the staying ten seconds longer. But she could feel it.\n\nHe was more present. Not in a showy way. In a quiet way. He\'d look at her when she talked instead of looking past her. He\'d pause before answering instead of deflecting with a joke.\n\nOne evening she said, "Something\'s different about you." Darnell didn\'t know how to explain it, so he just said, "I\'m learning to stay."\n\nKeisha cried. Not because it was sad. Because she\'d been waiting a long time for him to stay, and she\'d almost given up hoping he would.\n\nThis is what people don\'t tell you about this kind of work: it\'s quiet. There\'s no dramatic moment where everything clicks. There are just small choices — to breathe, to stay, to let a feeling exist without running from it — that add up until the person next to you can feel the difference.\n\nYou don\'t have to announce your growth. The people who love you will notice.',
        keyInsight:
          'The people closest to you feel your growth before you can explain it.',
      },
      action: {
        prompt:
          'Do one small thing today that the person closest to you will feel — even if they can\'t name what changed. Stay a moment longer. Look at them when they speak. Let silence be okay.',
      },
      reflection: {
        prompt:
          'What small thing did you do today? How did it land — for you and for them?',
      },
    },
    {
      dayIndex: 14,
      learn: {
        story:
          'You have spent two weeks learning something most people never learn: how to be with yourself before you\'re with someone else.\n\nYou\'ve met your body\'s signals. You\'ve named what overwhelm actually feels like. You\'ve found anchors. You\'ve practiced the one breath that changes everything. You\'ve stayed in the room when your body wanted to leave.\n\nNone of this was easy. The part of you that learned to step back did so for real reasons. It protected you. It kept things manageable when the world felt like too much.\n\nBut you\'re not just that part anymore. You\'re someone who can feel the alarm and choose what to do with it. Someone who can hold still when things get close. Someone who is building a new kind of strength — the kind that looks like softness from the outside.\n\nYou didn\'t break old patterns by fighting them. You built new ones by practicing them. One breath, one moment, one choice at a time.\n\nYou\'re becoming someone who finds their ground first — and then opens the door. That is quiet, powerful work. And you\'re doing it.',
        keyInsight:
          'You\'re becoming someone who can hold steady and stay close — not because it\'s easy, but because you\'ve practiced.',
      },
      action: {
        prompt:
          'Today, reach toward someone you love from a calm place — not because you should, but because you want to. Notice how it feels to choose closeness from solid ground.',
      },
      reflection: {
        prompt:
          'As you look back on these two weeks, what has changed in how you show up — for yourself and for the person closest to you?',
      },
    },
  ],
};
