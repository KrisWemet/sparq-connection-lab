import type { StarterJourney } from './types';

export const stayingGrounded: StarterJourney = {
  id: 'staying-grounded',
  title: 'Staying Grounded Through the Hard Stuff',
  duration: 7,
  modalities: ['act', 'mindfulness'],
  modalityLabel: 'INNER STRENGTH',
  description:
    'When life gets heavy, the most powerful thing you can do is stay rooted in what matters.',
  profileCluster: 'any-heavy-context',
  days: [
    // ── Day 1: You're Here. That Matters. ──
    {
      dayIndex: 1,
      learn: {
        story:
          'Maya woke up with that heavy feeling again. The kind that sits on your chest before your eyes even open. She had a list of things to worry about — money, her mom\'s health, a fight with Jordan that never really got resolved. She wanted to fix all of it. Right now. But none of it could be fixed right now.\n\nSo she did something small. She sat on the edge of the bed and put both feet on the floor. She noticed how cool the wood felt. She took one slow breath. Then another.\n\nShe didn\'t try to make the worry go away. She just noticed she was here. In this room. In this moment. The worry was still there, but so was she.\n\nJordan walked in with coffee. "You okay?" Maya nodded. "I\'m here," she said. And for the first time in days, that felt like enough.\n\nWhen everything feels like too much, the bravest thing you can do is come back to right now. You don\'t have to solve it all. You just have to be here.',
        keyInsight:
          'You don\'t have to fix everything to feel steady — you just have to find the ground beneath your feet.',
      },
      action: {
        prompt:
          'At some point today, pause and feel your feet on the ground. Take three slow breaths. Notice one thing you can see, one thing you can hear, and one thing you can feel.',
      },
      reflection: {
        prompt:
          'What did it feel like to pause today, even for a moment? Was it easy, or did your mind pull you somewhere else?',
      },
    },

    // ── Day 2: The Storm and the Anchor ──
    {
      dayIndex: 2,
      learn: {
        story:
          'Alex used to think that being strong meant not being affected by hard things. When his company went through layoffs and Sam got a scary diagnosis in the same month, he told himself to hold it together. Don\'t feel it. Just push through.\n\nBut the tension came out anyway — short temper, restless nights, a distance between him and Sam that neither of them wanted.\n\nOne night Sam said, "I don\'t need you to fix this. I just need to know you\'re still with me." That landed somewhere deep.\n\nAlex sat down next to Sam. He didn\'t have answers. He didn\'t have a plan. But he put his hand on Sam\'s knee and said, "I\'m not going anywhere."\n\nHe realized something. Being strong doesn\'t mean standing stiff in the wind. It means knowing where your anchor is — and holding on. For Alex, the anchor was simple: being next to the person he loved, even when everything else felt uncertain.\n\nYou don\'t have to be unshakable. You just need something real to hold onto.',
        keyInsight:
          'Strength isn\'t about not feeling the storm — it\'s about knowing what keeps you anchored.',
      },
      action: {
        prompt:
          'Think of one small thing that feels real and steady in your life right now — a person, a place, a routine. Let yourself lean into it today, even just for a minute.',
      },
      reflection: {
        prompt:
          'What felt like an anchor for you today? What\'s one thing that helped you feel a little more steady?',
      },
    },

    // ── Day 3: Making Room ──
    {
      dayIndex: 3,
      learn: {
        story:
          'Priya had been carrying a lot. Her father was sick. Work was relentless. And she and Dev were supposed to be planning a move that neither of them had energy for. She noticed herself doing this thing — stuffing it all down during the day, then crying alone at night when Dev was asleep.\n\nOne evening Dev found her on the couch, eyes red. "How long have you been doing this by yourself?" he asked.\n\n"I didn\'t want to add to your plate," she said.\n\nDev sat next to her. "You\'re not adding to my plate. You\'re on my plate. You\'re the whole plate."\n\nPriya laughed through tears. And something loosened. She didn\'t feel better exactly — the hard stuff was still hard. But she felt less alone in it. She realized she\'d been treating her sadness like a problem to solve. But it wasn\'t a problem. It was just how her heart was responding to a hard season.\n\nSometimes the most powerful thing you can do with a heavy feeling is stop fighting it. Let it be there. It doesn\'t mean you\'re weak. It means you\'re paying attention to your own life.',
        keyInsight:
          'Hard feelings aren\'t problems to fix — they\'re signals that you care deeply about something.',
      },
      action: {
        prompt:
          'If a heavy feeling shows up today, try this: instead of pushing it away, just name it quietly. "There\'s sadness." "There\'s worry." Let it sit beside you without needing to do anything about it.',
      },
      reflection: {
        prompt:
          'Did you notice any feelings today that you normally try to push away? What happened when you let them be there?',
      },
    },

    // ── Day 4: Feelings Are Weather ──
    {
      dayIndex: 4,
      learn: {
        story:
          'Jordan had a bad week. A really bad one. And the worst part wasn\'t any single thing — it was the way all the hard feelings seemed to stack on top of each other. Worry about the future. Guilt about not being more present with Maya. Frustration at himself for not handling it better.\n\nHe told Maya, "I feel like I\'m drowning in my own head."\n\nMaya thought for a moment. Then she said, "Remember last winter, that huge storm? We sat on the porch and watched it. We didn\'t try to stop the rain. We just waited."\n\nJordan didn\'t say anything at first. But something about that image stuck with him. The storm was real. It was loud and messy and uncomfortable. But it moved. It always moved.\n\nThe next morning, when the wave of worry hit, he tried something different. Instead of telling himself to stop feeling it, he just noticed it. Like watching rain. "There it is again," he thought. And he waited. Not because it was easy. Because he trusted it would shift.\n\nBy afternoon, it had. Not completely. But enough.',
        keyInsight:
          'Your feelings are like weather — real and powerful, but always moving. You don\'t have to become the storm.',
      },
      action: {
        prompt:
          'The next time a wave of worry or frustration hits today, try watching it like weather. Say to yourself, "This is passing through." See if the feeling shifts, even a little.',
      },
      reflection: {
        prompt:
          'Were there any moments today where a hard feeling moved through instead of getting stuck? What was that like?',
      },
    },

    // ── Day 5: What Still Matters ──
    {
      dayIndex: 5,
      learn: {
        story:
          'When things got hard for Nadia and Chris, the first things to go were the small ones. Morning coffee together. The walk after dinner. The way Nadia used to leave little notes in Chris\'s bag. None of those things disappeared because they stopped caring. They disappeared because survival mode kicked in and everything got reduced to what\'s urgent.\n\nOne night Chris said, "I miss us." Not in an accusatory way. Just honest.\n\nNadia felt it too. "I miss us too. But I don\'t have anything left to give right now."\n\n"What if it didn\'t have to be big?" Chris asked. "What if we just sat here for five minutes without looking at our phones?"\n\nSo they did. Five minutes of just being together. No fixing. No planning. Just quiet.\n\nIt didn\'t solve anything. But it reminded them both why they were doing all the hard stuff in the first place. Not for the job or the bills or the logistics. For this. For the person next to them.\n\nWhen life strips things down, what\'s left is what matters most. And sometimes you have to choose it on purpose — even in a small way — to remember it\'s still there.',
        keyInsight:
          'Hard seasons don\'t erase what matters — they just make it harder to see. Choosing it, even once, brings it back into focus.',
      },
      action: {
        prompt:
          'Choose one small thing today that reflects what matters to you — a kind word, a moment of quiet, a hand on someone\'s shoulder. Do it on purpose, not because you have to, but because you want to.',
      },
      reflection: {
        prompt:
          'What\'s something that still matters to you, even when everything else feels hard? How did it show up today?',
      },
    },

    // ── Day 6: Choosing Who You Want to Be ──
    {
      dayIndex: 6,
      learn: {
        story:
          'Sam was tired. The kind of tired that goes past the body and sits in your bones. Months of caregiving for a parent, a partner who was struggling too, and a to-do list that never got shorter. There were days Sam didn\'t recognize the person in the mirror — short-tempered, shut down, running on fumes.\n\nOne evening, after snapping at Alex over something small, Sam sat in the car alone. Not driving anywhere. Just sitting. And a thought came, quiet but clear: "This isn\'t who I want to be."\n\nNot shame. Not criticism. Just a gentle truth. Sam didn\'t want to be the person who snaps. Who shuts down. Who disappears into survival mode and forgets to look up.\n\nSo Sam made a choice. Not a big one. A tiny one. Go back inside. Say sorry. Mean it. Sit with Alex for ten minutes, even though every cell in Sam\'s body wanted to be alone.\n\nIt didn\'t fix the tiredness. But it was a vote for the kind of person Sam wanted to be. And that vote mattered more than Sam expected.\n\nYou don\'t have to be perfect through hard times. You just have to keep choosing — one small moment at a time — the person you\'re becoming.',
        keyInsight:
          'Every small choice you make during hard times is a vote for the person you\'re becoming.',
      },
      action: {
        prompt:
          'When you face a hard moment today, pause and ask yourself: "What would the person I want to be do right now?" Then do that, even if it\'s small.',
      },
      reflection: {
        prompt:
          'Was there a moment today where you chose to show up as the person you want to be? What did you choose, and how did it feel?',
      },
    },

    // ── Day 7: Look How Far You've Come ──
    {
      dayIndex: 7,
      learn: {
        story:
          'Maya looked back at the last week and almost laughed. Nothing had been fixed. Her mom was still sick. The fight with Jordan was still tender. Money was still tight. And yet — something had shifted. Not around her. Inside her.\n\nShe\'d learned to put her feet on the ground when the worry hit. She\'d learned that hard feelings move through if you let them. She\'d sat with Jordan in silence and remembered why they chose each other. She\'d made small choices — imperfect, tired, human choices — that said, "I\'m still here. I still care. I\'m still trying."\n\nJordan noticed it too. "You seem different," he said one morning. "Not happier exactly. Just... more here."\n\nMaya smiled. "I think I stopped waiting for things to get better before I showed up."\n\nThat\'s the thing about hard seasons. They don\'t ask for perfection. They don\'t require you to have answers. They just ask you to stay. To keep choosing. To trust that the person you\'re becoming — steady, open, brave — is already showing up in the smallest moments.\n\nYou did that this week. Not because it was easy. Because it mattered.\n\nYou\'re becoming someone who doesn\'t wait for the storm to pass to start living. And that changes everything.',
        keyInsight:
          'You don\'t have to wait for things to get better to start showing up — and that\'s exactly what makes things better.',
      },
      action: {
        prompt:
          'Take a moment today to notice one way you\'ve grown this week. Say it out loud or write it down. Let yourself feel proud of something small.',
      },
      reflection: {
        prompt:
          'Looking back at this week, what\'s one thing you\'ve learned about yourself that you want to carry forward?',
      },
    },
  ],
};
