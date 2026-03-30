import type { StarterJourney } from './types';

export const sharedLanguage: StarterJourney = {
  id: 'shared-language',
  title: 'Finding Your Shared Language',
  duration: 10,
  modalities: ['gottman', 'nvc'],
  modalityLabel: 'COMMUNICATION',
  description: 'Learning to say the real thing — before the distance creeps in.',
  profileCluster: 'secure-avoidant-conflict',
  days: [
    // ── Days 1-3: Surface — noticing the gap between feeling and saying ──

    {
      dayIndex: 1,
      learn: {
        story:
          `Maya noticed it on a Tuesday. James asked how her day was. She said "fine." ` +
          `But fine wasn't true. Her day had been hard. A meeting went sideways. She felt small in it. ` +
          `She wanted to tell him. But something stopped her. Not anger. Not fear. Just — habit. ` +
          `The word "fine" came out before the real answer had a chance.\n\n` +
          `That night she watched James scroll his phone on the couch. She thought: he doesn't even know what happened today. ` +
          `And then the harder thought: I didn't let him.\n\n` +
          `This is where distance starts. Not with a fight. Not with a betrayal. ` +
          `With a small true thing left unsaid. One "fine" at a time.\n\n` +
          `Most of us don't hide on purpose. We just get fast at skipping past what's real. ` +
          `The good news — once you see the skip, you can't unsee it.`,
        keyInsight: 'Distance doesn\'t start with big fights — it starts with small truths left unsaid.',
      },
      action: {
        prompt:
          'Today, when your partner asks how you are, pause before you answer. ' +
          'Notice what comes up before the automatic word. You don\'t have to say it yet — just notice it.',
      },
      reflection: {
        prompt:
          'What did you notice in that pause today? Was there something underneath the first word that almost came out?',
      },
    },

    {
      dayIndex: 2,
      learn: {
        story:
          `David and Priya had a rule: no phones at dinner. But even without phones, David noticed something. ` +
          `They talked about logistics. The kids. The leak in the bathroom. What to buy at the store.\n\n` +
          `One night Priya said, "I had a weird dream about my mom." David almost said "huh" and moved on. ` +
          `But instead he put his fork down. "Tell me," he said.\n\n` +
          `She talked for ten minutes. About the dream, about missing her mom, about feeling like time was speeding up. ` +
          `It was the most she'd shared in weeks.\n\n` +
          `David didn't fix anything. He didn't give advice. He just stayed with her.\n\n` +
          `Afterward he realized — it wasn't that Priya had stopped sharing. ` +
          `It was that the openings had been there all along. He'd been stepping past them. ` +
          `"Tell me" is two words. But those two words changed the whole evening.`,
        keyInsight: 'The openings for real connection are already there — they just need someone to step into them.',
      },
      action: {
        prompt:
          'When your partner says something today that could go deeper, try "tell me more" instead of moving on. ' +
          'Just once. See what opens.',
      },
      reflection: {
        prompt:
          'Did an opening show up today? What happened when you stepped into it — or what stopped you?',
      },
    },

    {
      dayIndex: 3,
      learn: {
        story:
          `Sam came home and dropped his bag on the counter. "Long day," he said. ` +
          `Rosa was chopping vegetables. "Same," she said.\n\n` +
          `They moved through the evening like two ships in the same harbor. Close — but not touching. ` +
          `Both tired. Both wanting something from the other. Neither saying what.\n\n` +
          `Later, Sam sat on the bed and said something unusual. "I think I wanted you to ask me about my day. ` +
          `Like, really ask. I don't even know why. I just wanted to feel like it mattered to someone."\n\n` +
          `Rosa looked at him. "I wanted the same thing," she said quietly. "I was standing at the counter hoping ` +
          `you'd come over and just — be near me."\n\n` +
          `They both laughed a little. They'd spent the whole night wanting the same thing. ` +
          `Neither had said it. Not because they couldn't. Because they were waiting to be reached for first.\n\n` +
          `Sometimes both people are reaching — just not at the same time.`,
        keyInsight: 'Most of the time, both of you want the same closeness — the gap is in the saying, not the wanting.',
      },
      action: {
        prompt:
          'Notice one moment today where you want something from your partner but don\'t say it. ' +
          'Write it down — even just in your head. Name the want.',
      },
      reflection: {
        prompt:
          'What was the want you noticed today? What would it have sounded like if you\'d said it out loud?',
      },
    },

    // ── Days 4-6: Meaningful — bids, turning toward, repair ──

    {
      dayIndex: 4,
      learn: {
        story:
          `Lena was reading on the couch when Marcus walked over. "Look at this sunset," he said, ` +
          `pointing out the window.\n\n` +
          `It seems like nothing. Just a comment about the sky. But it wasn't about the sky.\n\n` +
          `What Marcus was really saying was: "Come be with me for a second. Share this with me. ` +
          `I want you in this moment."\n\n` +
          `These small invitations happen dozens of times a day. A sigh across the room. ` +
          `A funny thing shown on a phone. A hand resting close to yours. ` +
          `Each one is a quiet ask: "Are you here with me?"\n\n` +
          `Lena could have said "mm-hmm" without looking up. And nothing bad would happen. ` +
          `But something good wouldn't happen either.\n\n` +
          `Instead she looked up. Walked over. "Wow," she said. They stood together for thirty seconds.\n\n` +
          `That's it. Thirty seconds. But Marcus felt it — she turned toward him when she didn't have to. ` +
          `Over time, those moments are what trust is actually built from. Not the big gestures. The small turns.`,
        keyInsight: 'Trust is built in tiny moments — every time you turn toward your partner instead of past them.',
      },
      action: {
        prompt:
          'Watch for one small invitation from your partner today — a comment, a look, a sigh. ' +
          'Turn toward it. Even just eye contact and a "yeah?" counts.',
      },
      reflection: {
        prompt:
          'What invitation did you notice today? How did it feel to turn toward it instead of past it?',
      },
    },

    {
      dayIndex: 5,
      learn: {
        story:
          `Aisha and Tom had a fight about the dishes. Or — it started about the dishes. ` +
          `Within five minutes it was about respect, and effort, and who does more, and that thing from last Thanksgiving.\n\n` +
          `They both went quiet. Tom went to the garage. Aisha stayed in the kitchen.\n\n` +
          `Twenty minutes later, Tom came back. He stood in the doorway. "I don't want to fight about dishes," he said. ` +
          `"I think I'm just tired and I took it out on you. I'm sorry."\n\n` +
          `That moment — standing in the doorway, saying the true thing — was the hardest part. ` +
          `Not because the words were complicated. Because it meant going back before the argument was resolved. ` +
          `It meant reaching out when part of him still felt justified in being upset.\n\n` +
          `Aisha could have held on to her frustration. But she saw what he was doing. ` +
          `"I'm sorry too," she said. "I think I was keeping score and that's not fair."\n\n` +
          `The dishes didn't matter. The doorway moment did. Coming back before everything is fixed — ` +
          `that's what repair actually looks like.`,
        keyInsight: 'Repair doesn\'t mean the fight is over — it means someone was brave enough to come back first.',
      },
      action: {
        prompt:
          'If something small went wrong between you today — even just a sharp tone or a missed moment — ' +
          'try naming it. "Hey, I think that came out wrong. Can I try again?"',
      },
      reflection: {
        prompt:
          'Was there a moment today that needed a small repair? What happened — and what would "coming back" look like?',
      },
    },

    {
      dayIndex: 6,
      learn: {
        story:
          `Jess and Andre had been together for nine years. They rarely fought anymore. ` +
          `But Jess had started to notice something that worried her more than fighting — ` +
          `Andre had stopped asking for things.\n\n` +
          `He used to say, "Come sit with me." Or, "Can we talk about this weekend?" ` +
          `Now he just handled things himself. Quietly. Efficiently. Alone.\n\n` +
          `One evening Jess said, "I miss when you used to ask me for things." ` +
          `Andre looked surprised. "I stopped because you seemed busy. I didn't want to be a bother."\n\n` +
          `"You reaching for me is never a bother," Jess said. "It's how I know we're still close."\n\n` +
          `Something shifted for Andre. He'd thought pulling back was kindness. ` +
          `He didn't realize that his reaching — even the small asks — was how Jess felt chosen.\n\n` +
          `When someone stops reaching, it can look like peace. But sometimes it's just a quieter kind of distance. ` +
          `Reaching for your partner — even when it's easier not to — is one of the bravest things you can do.`,
        keyInsight: 'Reaching for your partner isn\'t needy — it\'s how they know they still matter to you.',
      },
      action: {
        prompt:
          'Ask your partner for one small thing today. Not because you can\'t do it alone — ' +
          'because you want them in it with you.',
      },
      reflection: {
        prompt:
          'How did it feel to reach for something — even something small? What did you notice in yourself?',
      },
    },

    // ── Days 7-9: Deep — hard truths, needs, real listening ──

    {
      dayIndex: 7,
      learn: {
        story:
          `Nadia had something she needed to say to Chris. It had been sitting in her chest for two weeks. ` +
          `Not a complaint. A feeling. She felt unseen.\n\n` +
          `She practiced in the shower. "I feel like you don't notice me anymore." ` +
          `Too blaming. "You never pay attention to me." Worse.\n\n` +
          `What she finally said, sitting next to him in bed, was this: ` +
          `"Sometimes I feel invisible. And I know that's not your fault. But I wanted you to know ` +
          `because I'd rather say it than let it grow."\n\n` +
          `Chris was quiet. Then: "I didn't know you felt that way. I'm glad you told me."\n\n` +
          `There's a way to say hard things that doesn't push the other person away. ` +
          `It starts with what you feel — not what they did. "I feel invisible" is something a partner can hold. ` +
          `"You never notice me" is something they have to defend against.\n\n` +
          `The words matter. Not because your partner is fragile. ` +
          `Because the right words let them come closer instead of backing up.`,
        keyInsight: 'Starting with what you feel — instead of what they did — lets your partner come closer instead of pulling away.',
      },
      action: {
        prompt:
          'Think of something you\'ve been holding back. Try saying it starting with "I feel..." instead of "You always..." ' +
          'Even just to yourself first.',
      },
      reflection: {
        prompt:
          'What\'s a feeling you\'ve been carrying that your partner doesn\'t know about? What would it sound like said gently?',
      },
    },

    {
      dayIndex: 8,
      learn: {
        story:
          `Ravi and Kim were stuck on the same argument — again. Date night. ` +
          `Ravi wanted to go out more. Kim wanted to stay in. They'd had this fight a dozen times.\n\n` +
          `One night, instead of making his case again, Ravi tried something different. ` +
          `"What is it about staying home that feels good to you?" he asked. Not to win. Just to understand.\n\n` +
          `Kim thought about it. "After a long week, home is the one place I don't have to perform. ` +
          `I can just be. With you."\n\n` +
          `Ravi softened. "I think when we go out, I feel like we're choosing each other on purpose. ` +
          `Like we did when we were dating. I miss that."\n\n` +
          `They looked at each other. Under the positions — go out, stay in — were needs. ` +
          `Kim needed rest and safety. Ravi needed to feel chosen.\n\n` +
          `Once they could see the needs, the solution was simple: some nights out, some nights in, ` +
          `both done with intention. The fight was never really about the calendar. ` +
          `It was about what each of them needed to feel loved.`,
        keyInsight: 'Under every position is a need — and once you can see the need, the argument usually dissolves.',
      },
      action: {
        prompt:
          'Think of something you and your partner disagree about. Ask yourself: what do I actually need underneath this? ' +
          'Try naming the need, not the position.',
      },
      reflection: {
        prompt:
          'When you looked underneath a disagreement today, what need did you find? Was it different from what you expected?',
      },
    },

    {
      dayIndex: 9,
      learn: {
        story:
          `Ellie was talking about her sister. It was a hard subject — old wounds, complicated history. ` +
          `Ryan listened. But after two minutes, he said, "Have you thought about just calling her and clearing the air?"\n\n` +
          `Ellie went quiet. Then: "I wasn't asking for a solution. I just wanted you to hear me."\n\n` +
          `Ryan felt stung. He was trying to help. But he realized — his help had skipped past her pain ` +
          `to get to a fix. And in that skip, Ellie felt alone.\n\n` +
          `Listening — real listening — is harder than it sounds. Because real listening means ` +
          `staying in the feeling with someone. Not rushing to the other side of it.\n\n` +
          `The next time Ellie shared something hard, Ryan tried something new. He didn't fix. ` +
          `He said: "That sounds really heavy. I'm here."\n\n` +
          `Five words. Ellie exhaled. She leaned into him. ` +
          `That exhale — that was the sound of someone feeling heard.\n\n` +
          `Sometimes the most loving thing you can say is nothing clever at all. ` +
          `Just: I hear you. I'm here. That's enough.`,
        keyInsight: 'The most powerful thing you can offer is staying in the feeling with someone — not rushing past it to a fix.',
      },
      action: {
        prompt:
          'When your partner shares something today, try listening without offering a solution. ' +
          'Just stay with them. See what happens when you don\'t try to fix it.',
      },
      reflection: {
        prompt:
          'What was it like to just listen today — without fixing? What did you notice in your partner? In yourself?',
      },
    },

    // ── Day 10: Integration — the language you're building ──

    {
      dayIndex: 10,
      learn: {
        story:
          `Ten days ago, you started noticing something. The gap between what you feel and what you say. ` +
          `The small moments that pass by. The invitations you almost miss.\n\n` +
          `You've been practicing. Pausing before "fine." Saying "tell me more." ` +
          `Reaching for your partner instead of handling things alone. ` +
          `Saying the hard thing gently. Listening without fixing.\n\n` +
          `None of these are big moves. None of them take more than a few seconds. ` +
          `But together, they're building something — a language that belongs to just the two of you.\n\n` +
          `Not perfect words. Not scripted lines. Just a way of being with each other ` +
          `where the real thing gets said more often than it gets swallowed.\n\n` +
          `You're becoming someone who says the true thing before the distance creeps in. ` +
          `Someone who reaches first. Someone who listens to understand, not to respond.\n\n` +
          `That's not a skill you learned in ten days. That's who you've been becoming ` +
          `every time you chose closeness over comfort.\n\n` +
          `The shared language isn't something you find once. It's something you keep choosing. ` +
          `And you're already choosing it.`,
        keyInsight: 'The shared language between you isn\'t found — it\'s built, one honest moment at a time.',
      },
      action: {
        prompt:
          'Tell your partner one thing you noticed about yourself over these ten days. ' +
          'Something that shifted — even a little.',
      },
      reflection: {
        prompt:
          'Looking back at these ten days, what feels different about how you talk to each other? What do you want to keep?',
      },
    },
  ],
};
