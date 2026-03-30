import type { StarterJourney } from './types';

export const deepeningGood: StarterJourney = {
  id: 'deepening-good',
  title: 'Deepening What\'s Already Good',
  duration: 7,
  modalities: ['positive-psychology', 'gottman'],
  modalityLabel: 'RELATIONSHIP STRENGTH',
  description:
    'You\'re not here because something is broken — you\'re here because you want more of what\'s good.',
  profileCluster: 'secure-default',
  days: [
    // ── Day 1: Noticing what's already there ──────────────────────────
    {
      dayIndex: 1,
      learn: {
        story:
          'Maya almost missed it.\n\n' +
          'She was loading the dishwasher — tired, distracted, thinking about tomorrow\'s meeting. ' +
          'Jordan walked through the kitchen and, without a word, moved her water glass to the counter so she wouldn\'t knock it over.\n\n' +
          'That was it. Nothing big. No grand gesture. Just someone paying attention.\n\n' +
          'Maya didn\'t say anything either. But later that night, lying in bed, she realized something. ' +
          'Jordan does things like that all the time. Moves her shoes out of the rain. Charges her phone when she forgets. ' +
          'Turns the porch light on when she\'s coming home late.\n\n' +
          'None of it was ever announced. None of it asked for a thank you.\n\n' +
          'She\'d been so focused on the big stuff — the vacation they couldn\'t afford, the argument about the in-laws — that she\'d stopped seeing the small stuff. ' +
          'And the small stuff? That was the relationship. That was the whole thing, happening quietly every single day.',
        keyInsight:
          'The good stuff doesn\'t shout — it hums in the background, and the moment you start listening for it, you hear it everywhere.',
      },
      action: {
        prompt:
          'At some point today, catch your partner doing something small and kind — something they probably don\'t even think about. Don\'t say anything yet. Just notice it.',
      },
      reflection: {
        prompt:
          'What small thing did you notice today that you\'d normally walk right past?',
      },
    },

    // ── Day 2: Gratitude that lands ──────────────────────────────────
    {
      dayIndex: 2,
      learn: {
        story:
          'Alex used to say "thanks, babe" the same way he said "thanks" to the barista.\n\n' +
          'Quick. Automatic. Already looking at his phone.\n\n' +
          'One evening Sam made his favorite meal — nothing fancy, just the pasta he loved. ' +
          'He said the usual: "Thanks, babe. Looks good." Sam smiled, but something flickered. ' +
          'A tiny pause. Like a door that opened and closed before anyone walked through.\n\n' +
          'The next week, Sam made the same pasta. This time Alex put his phone down. ' +
          'He looked at Sam. "You remembered I had a rough day last time you made this. That\'s why you made it again, isn\'t it?"\n\n' +
          'Sam\'s eyes went soft. "Yeah. I did."\n\n' +
          'Same meal. Same kitchen. Completely different moment.\n\n' +
          'The difference wasn\'t the thank you. It was that Alex saw the *why* behind what Sam did. ' +
          'He didn\'t just notice the pasta. He noticed the care the pasta was carrying.',
        keyInsight:
          'Gratitude changes everything when it names the intention behind the action — not just the action itself.',
      },
      action: {
        prompt:
          'Tell your partner thank you for something specific today — and name *why* you think they did it, not just what they did.',
      },
      reflection: {
        prompt:
          'When you named the reason behind what your partner did, what shifted between you?',
      },
    },

    // ── Day 3: Bids — the invisible reach ────────────────────────────
    {
      dayIndex: 3,
      learn: {
        story:
          'Priya was reading on the couch when Eli said, "Wow, look at that sunset."\n\n' +
          'She almost didn\'t look up. She was mid-paragraph. The book was good. ' +
          'But something — maybe the way his voice sounded, a little soft, a little hopeful — made her glance toward the window.\n\n' +
          'It was a nice sunset. Not the best she\'d ever seen. But Eli was smiling at it like a kid.\n\n' +
          '"It really is beautiful," she said. And she meant it — not about the sunset, but about this. ' +
          'Him wanting to share a small, ordinary moment. Her choosing to be in it.\n\n' +
          'Eli wasn\'t really talking about the sunset. He was reaching out. Saying, in the quietest way: *Are you here with me?*\n\n' +
          'Those tiny reaches happen dozens of times a day. A comment about a song. A sigh after a phone call. ' +
          'A hand on the shoulder while passing in the hall. Most of them don\'t look like anything important.\n\n' +
          'But every single one is a question: *Will you turn toward me?*\n\n' +
          'And every time the answer is yes, something between two people gets a little stronger.',
        keyInsight:
          'The moments that build a relationship aren\'t the big ones — they\'re the tiny reaches your partner makes, and whether you turn toward them.',
      },
      action: {
        prompt:
          'Watch for a moment today when your partner reaches toward you — a comment, a look, a question about nothing important. Turn toward it fully, even for ten seconds.',
      },
      reflection: {
        prompt:
          'What reach did you notice today — and what happened when you turned toward it?',
      },
    },

    // ── Day 4: Turning toward as a habit ─────────────────────────────
    {
      dayIndex: 4,
      learn: {
        story:
          'Dani and River had a running joke. "Tell me something boring about your day."\n\n' +
          'It started as an accident. One night Dani came home exhausted and said, "I don\'t have anything interesting to say. ' +
          'My day was just... boring." River leaned in and said, "Perfect. Tell me something boring."\n\n' +
          'So Dani did. She talked about the weird noise the printer made. About the guy in the elevator who sneezed four times. ' +
          'About the sandwich she ate that was fine but not great.\n\n' +
          'River listened like it was the most interesting thing in the world.\n\n' +
          'It became their thing. Every night, one boring thing each. And here\'s what neither of them expected: ' +
          'those conversations became some of the best parts of their day.\n\n' +
          'Not because the stories were good. Because someone was listening. Really listening. ' +
          'Choosing to care about the ordinary stuff — not just the highlights.\n\n' +
          'That\'s what turning toward each other actually looks like. ' +
          'It\'s not waiting for the big moment. It\'s making the small ones count.',
        keyInsight:
          'The couples who last aren\'t the ones with the best stories — they\'re the ones who care about each other\'s boring ones.',
      },
      action: {
        prompt:
          'Ask your partner about the most unremarkable part of their day — and listen like it matters. Because it does.',
      },
      reflection: {
        prompt:
          'What did you learn about your partner today from something completely ordinary?',
      },
    },

    // ── Day 5: Savoring — making good moments last ───────────────────
    {
      dayIndex: 5,
      learn: {
        story:
          'Jess and Taylor were walking home from dinner. Nothing special — a Tuesday, a neighborhood place, the usual order.\n\n' +
          'Taylor said, "That was really nice."\n\n' +
          'Normally Jess would\'ve said "Yeah, it was" and moved on to logistics. The dishes. Tomorrow\'s schedule. ' +
          'But tonight, something made her stop walking.\n\n' +
          '"It was," she said. "I liked how you laughed at that thing the waiter said. ' +
          'And how you reached across the table when you were telling that story about your mom. ' +
          'I don\'t know — it just felt really easy tonight."\n\n' +
          'Taylor looked at her. "You noticed all that?"\n\n' +
          '"I\'m noticing right now."\n\n' +
          'They stood there for a second on the sidewalk. Just smiling. Then kept walking.\n\n' +
          'The dinner wasn\'t special. But that moment on the sidewalk — where they paused and let the good feeling breathe — that was.\n\n' +
          'Most good moments pass through us like water through open hands. ' +
          'We feel them, but we don\'t hold them. Savoring is the act of closing your hands — gently — and letting the warmth stay a little longer.',
        keyInsight:
          'Good moments don\'t become memories on their own — they need you to pause, name them, and let them land.',
      },
      action: {
        prompt:
          'When something good happens with your partner today — even something small — pause for five seconds and say out loud what you\'re enjoying about it.',
      },
      reflection: {
        prompt:
          'Which moment today would you want to remember a year from now — and what made it worth keeping?',
      },
    },

    // ── Day 6: Creating positive moments on purpose ──────────────────
    {
      dayIndex: 6,
      learn: {
        story:
          'Luis kept a note in his phone. Just a short list. Things Noor lights up about.\n\n' +
          'The crunchy peanut butter she likes (not smooth — she\'s very serious about this). ' +
          'The way she hums when someone plays acoustic guitar. ' +
          'How she always wants the window seat.\n\n' +
          'He didn\'t do anything dramatic with the list. No surprise proposals or skywriting. ' +
          'He just... used it. Quietly.\n\n' +
          'One Saturday he found a tiny acoustic show at a coffee shop. ' +
          'They sat by the window. He\'d already ordered her coffee with extra foam, the way she likes.\n\n' +
          'Noor didn\'t know about the list. She didn\'t need to. ' +
          'What she knew was that she felt seen. Not in a big, movie-moment way. ' +
          'In a way that was better than that — in an ordinary, Tuesday-through-Saturday, this-person-really-knows-me way.\n\n' +
          'You don\'t need a list. But you do need to pay attention. ' +
          'Because when you know what makes someone light up and you choose to bring it to them — ' +
          'that\'s not just kindness. That\'s love with its sleeves rolled up.',
        keyInsight:
          'You already know what makes your partner light up — the next step is doing something about it on purpose.',
      },
      action: {
        prompt:
          'Create one small moment today based on something you know your partner loves — something only you would think of, because only you know them that well.',
      },
      reflection: {
        prompt:
          'What did you create for your partner today — and what did their face look like when it landed?',
      },
    },

    // ── Day 7: Integration — seeing who you're becoming ──────────────
    {
      dayIndex: 7,
      learn: {
        story:
          'A week doesn\'t sound like much.\n\n' +
          'Seven days. That\'s it. But think about what happened inside those seven days.\n\n' +
          'You noticed something you\'d been walking past. You said thank you and meant the deeper part. ' +
          'You caught a quiet reach and turned toward it. You listened to something boring like it mattered. ' +
          'You paused in a good moment and let it stay. You made something happen on purpose.\n\n' +
          'None of those things were hard. None of them took more than a minute. ' +
          'But here\'s what changed: your eyes are open now.\n\n' +
          'You\'re seeing things between you and your partner that were always there — ' +
          'you just hadn\'t been looking. And now that you see them, you can\'t unsee them.\n\n' +
          'That\'s not a habit. That\'s a shift.\n\n' +
          'You\'re becoming someone who catches the good stuff. ' +
          'Someone who turns toward. Someone who pauses and says *this, right here, this is it.*\n\n' +
          'That person doesn\'t need a perfect relationship. They need exactly the one they have — ' +
          'because they know how to find the gold in it.',
        keyInsight:
          'You didn\'t add anything new to your relationship this week — you learned to see what was already there, and that changes everything.',
      },
      action: {
        prompt:
          'Tell your partner one thing you\'ve noticed about them this week that you want to keep noticing.',
      },
      reflection: {
        prompt:
          'As you look back at this week, what feels different about how you see your relationship now?',
      },
    },
  ],
};
