// Hypnotic stories that embed persuasive messages
export interface HypnoticStory {
  id: string;
  title: string;
  type: 'communication' | 'intimacy' | 'trust' | 'future' | 'conflict';
  theme: string;
  story: string;
}

export const hypnoticStories: HypnoticStory[] = [
  {
    id: "story-bridge",
    title: "The Two Travelers",
    type: "communication",
    theme: "understanding",
    story: `Once, two travelers found themselves on opposite sides of a wide canyon. They both wanted to continue their journey, but the canyon seemed impossible to cross.

The first traveler called out, "Hello! Is anyone there?"

From across the canyon, the second traveler heard and responded, "Yes, I'm here! How can we cross?"

And so began their conversation, each sharing ideas from their own side. At first, they had to shout to be heard, which was difficult and tiring. But they *persisted in finding better ways to communicate*.

The first traveler noticed some vines growing nearby and suggested they could use them to begin building a bridge. The second discovered strong trees that could serve as supports.

Day by day, they worked together, *sharing their progress honestly* and *listening carefully* to each other's suggestions. When they encountered problems, they *expressed their concerns openly* and found solutions together.

Sometimes they misunderstood each other, and parts of the bridge had to be rebuilt. But with each misunderstanding, they became more patient, more clear in their expressions, and *better at truly hearing each other*.

Finally, after many days of working together, the bridge was complete. When they met in the middle for the first time, they embraced like old friends, though they had never been closer than shouting distance before.

What they discovered was that the bridge they built was much more than just a way to cross the canyon. It had become a connection that would last far beyond their journey together. And as they traveled onward, side by side, they *continued strengthening their connection* with each conversation.

*Just like these travelers, you too can build beautiful bridges of understanding* in your relationship, creating connections that grow stronger with each honest exchange.`
  },
  {
    id: "story-garden",
    title: "The Secret Garden",
    type: "intimacy",
    theme: "nurturing connection",
    story: `There once was a couple who discovered a walled garden at the edge of their property. The gate was old and rarely opened, and inside, the garden had been neglected for years.

Curious, they decided to restore it together. At first, they worked separately—he cleared the overgrown paths while she pruned the wild roses. But they soon realized that the garden flourished most when they *worked side by side, sharing the experience*.

One day, they discovered a fountain at the center of the garden. Though dry and cracked, they could see it had once been beautiful. "What if we could restore it?" she wondered aloud. He smiled and said, "Together, I believe we can."

It took many weeks of patient work. They needed to be vulnerable with each other, *sharing their doubts and fears* about whether they could succeed. With each honest conversation, they *felt closer than before*.

When they finally connected the water source, nothing happened at first. They stood together, holding hands in disappointment. Then suddenly, water began to trickle, then flow, then dance from the fountain. They laughed and embraced, soaked by the unexpected splash but *feeling more connected than ever before*.

As seasons passed, they continued tending their garden. They created private spaces where they could *share their deepest thoughts*, sun-drenched areas where they could *enjoy each other's presence without words*, and moon-lit corners where they could *rediscover the physical connection* that had first drawn them together.

They noticed something magical: the more attention they gave the garden, the more it gave back to them. New flowers would appear unexpectedly, delighting them with fresh beauty. The fruit trees, once barren, began producing the sweetest harvest they had ever tasted.

*Just like this couple's garden, your relationship can become more beautiful and intimate* the more you nurture it together. Each moment of vulnerability, each shared experience, each physical connection *naturally strengthens the bond between you*.`
  },
  {
    id: "story-vessel",
    title: "The Crystal Vessel",
    type: "trust",
    theme: "reliability and repair",
    story: `In a small village by the sea lived two artisans who crafted beautiful vessels together. They were known throughout the land for their extraordinary creations, but their most prized piece was a crystal vessel they had made in the early days of their partnership.

This vessel was not just beautiful but useful—it carried water from the well to their workshop every day. They *trusted it completely* to hold what was precious to them.

One day, while carrying the vessel, one of the artisans stumbled. The vessel fell and a small crack appeared along its side. Water began to seep through slowly.

They could have hidden the crack or pretended it wasn't important. Instead, they *acknowledged it immediately* and set about repairing it together.

Using a special technique passed down through generations, they melted gold and carefully filled the crack. They worked with patience and precision, *communicating clearly* about what needed to be done.

When they finished, something unexpected had happened. The gold line running through the crystal didn't weaken the vessel—it made it stronger at that point than anywhere else. And the sunlight catching the gold created patterns of light more beautiful than the vessel had displayed before.

From that day forward, whenever a crack appeared—as they sometimes did through years of use—they didn't panic or hide it. They knew that *addressing breaks with honesty and care* would not only repair the vessel but transform it into something even more extraordinary.

As the years passed, their vessel bore many gold lines, each telling the story of a repair, each adding to its strength and beauty. People came from far and wide to see this remarkable vessel that had become more precious with each mending.

*Like this vessel, relationships grow stronger when cracks are acknowledged and repaired with care*. Each challenge met together adds a line of gold to your connection, creating a bond more beautiful and unbreakable than a relationship that has never been tested.`
  },
  {
    id: "story-journey",
    title: "The Cartographers",
    type: "future",
    theme: "creating together",
    story: `There once were two cartographers who fell in love. Each had spent years creating beautiful maps of distant lands, but when they met, they decided to embark on a journey together to uncharted territories.

Before setting out, they spread a blank parchment between them. "This will be the map of our journey," they agreed. "We'll create it together as we go."

At first, they drew tentative lines, sometimes hesitating, sometimes erasing. They were used to working alone and had to *learn how to blend their different styles*. One preferred detailed, precise markings while the other favored broad, sweeping landscapes.

As they traveled, they discovered something wonderful: their different approaches didn't conflict—they complemented each other perfectly. The detailed markings gave them accuracy for the day-to-day journey, while the sweeping landscapes helped them *envision the beautiful possibilities* that lay ahead.

They developed a ritual each evening. By firelight, they would unroll their map, discuss the day's discoveries, and *plan together where they wanted to go next*. Sometimes they disagreed, but they learned that these moments were opportunities to *discover unexpected paths* that neither would have found alone.

Years passed, and their map became renowned throughout the land. It wasn't just a record of mountains, rivers, and forests—it captured the story of their journey together. Certain landmarks were marked with special symbols that only they fully understood: a star where they had weathered a terrible storm together, a heart where they had discovered a hidden valley of flowers, a spiraling path where they had gotten gloriously lost and found something better than their original destination.

When other travelers asked the secret to creating such a magnificent map, they always smiled and said, "We never tried to follow someone else's path. We *created our own way forward, together*."

*Like these cartographers, you and your partner are creating your unique journey together*. Each decision you make, each goal you set, each dream you share becomes part of the beautiful map that only the two of you could create.`
  },
  {
    id: "story-storms",
    title: "The Lighthouse Keepers",
    type: "conflict",
    theme: "weathering storms",
    story: `On a rocky island stood a lighthouse tended by two keepers. They had a vital responsibility: to keep the light burning through all conditions to guide ships safely through dangerous waters.

Most days were peaceful. They would maintain the equipment, polish the lenses, and enjoy the beautiful ocean views together. But the island was known for its sudden, violent storms that would seem to appear from nowhere.

During their first major storm, they were caught unprepared. They argued about the best way to secure the lighthouse, their voices rising with the howling wind. Each insisted their approach was right. As they argued, they neglected the light, and it flickered dangerously.

A moment of clarity came when they both realized what was happening. The light—their shared purpose—was in danger of going out. In that moment, they made a decision that would change everything: they agreed that during storms, *they would face the challenge together rather than each other*.

They developed a storm ritual. When dark clouds gathered on the horizon, they would join hands briefly and remind each other: "We are not the storm. We are the lighthouse."

This simple practice transformed how they faced challenges. They still had different approaches, still occasionally disagreed, but they did so while standing side by side, *focused on solutions rather than blame*.

Over the years, they weathered countless storms. Some were brief squalls, others raged for days. The lighthouse stood strong through all of them, and so did their connection. In fact, the keepers discovered something unexpected: after each storm they weathered together, their bond grew stronger, their understanding deeper.

Ships' captains often commented that the light from their lighthouse seemed to shine more clearly and powerfully than any other along the coast. The keepers would smile and share a knowing look, aware that the strength of their light reflected the strength of their unity.

*Like these lighthouse keepers, you and your partner can face challenges as a team*. When conflicts arise, they become opportunities to strengthen your bond rather than threaten it, if you remember to stand together, facing the storm rather than each other.`
  }
];

// Future pacing timeframes for relationship visualization
export interface FuturePacingTimeframe {
  label: string;
  vision: string;
  embedCommand: string;
}

export interface FuturePacingCategory {
  id: string;
  title: string;
  type: 'communication' | 'intimacy' | 'trust' | 'future' | 'conflict';
  timeframes: FuturePacingTimeframe[];
}

export const futurePacingTimeframes: FuturePacingCategory[] = [
  {
    id: "future-communication",
    title: "Communication Transformation",
    type: "communication",
    timeframes: [
      {
        label: "1 Month",
        vision: "Imagine one month from now, after practicing the communication techniques you're learning. You're sitting together one evening, and *notice how your conversations flow more easily*. You find yourselves naturally taking turns speaking and listening, without interruption. When a sensitive topic comes up, you *feel a new sense of safety* in expressing your true thoughts.",
        embedCommand: "As you picture this future, take a moment to feel the satisfaction of being truly understood."
      },
      {
        label: "6 Months",
        vision: "Six months from now, see yourselves navigating a challenging situation together. Where once this might have led to frustration, you now *communicate with clarity and compassion*. You *notice how you've developed a unique language* between you—certain phrases and gestures that carry special meaning. Misunderstandings still happen, but they're resolved quickly and bring you closer.",
        embedCommand: "Recognize how these future communication skills create a foundation of trust that strengthens your entire relationship."
      },
      {
        label: "1 Year",
        vision: "One year from today, visualize friends commenting on how well you communicate as a couple. You've *become each other's safe haven* where honest expression is not just accepted but celebrated. Even in disagreements, you *maintain a deep connection* because you've mastered the art of listening to understand, not just to respond. Your communication has transformed not just your relationship but how you connect with everyone in your lives.",
        embedCommand: "Feel the profound satisfaction that comes when you're truly known and accepted by your partner."
      }
    ]
  },
  {
    id: "future-intimacy",
    title: "Deepening Connection",
    type: "intimacy",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, imagine noticing subtle changes in your intimacy. As you lie next to each other, you *experience a deeper awareness* of your partner's presence. The small moments—a touch while passing in the hallway, meeting eyes across a room—*carry more meaning*. You find yourselves creating more opportunities to be physically close, even in non-sexual ways.",
        embedCommand: "Allow yourself to feel the warmth and security of this growing physical and emotional connection."
      },
      {
        label: "6 Months",
        vision: "Six months into your journey, see yourselves having discovered new dimensions of intimacy. Conversations flow deeper into the night, exploring dreams and vulnerabilities you once kept hidden. Physical intimacy has become more playful and varied. You *notice how being vulnerable together* has created a unique space where you both feel completely safe to express desires and boundaries.",
        embedCommand: "Appreciate how this future intimacy brings you fulfillment beyond what you previously thought possible."
      },
      {
        label: "1 Year",
        vision: "A year from now, envision the profound intimacy you've developed. Where once there were walls, now there are windows. You've *created a relationship where both physical and emotional needs* are expressed openly and met with enthusiasm. Your connection has become a source of energy rather than depleting it. Even during busy periods, you *prioritize meaningful connection* because you've experienced how it enhances every aspect of your lives.",
        embedCommand: "Feel the deep satisfaction of having a relationship where you're truly seen, desired, and cherished."
      }
    ]
  },
  {
    id: "future-trust",
    title: "Building Unshakable Trust",
    type: "trust",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, visualize how small acts of reliability have begun to build stronger trust. When your partner says they'll do something, you *feel a quiet confidence* that it will happen. When you share something vulnerable, you *notice how safely it's held*. These small moments are creating a foundation of security between you.",
        embedCommand: "Experience the growing sense of peace that comes from knowing you can depend on each other."
      },
      {
        label: "6 Months",
        vision: "Six months into your journey, see how your trust has weathered some challenges and grown stronger because of them. Perhaps there was a misunderstanding or a mistake, but you *worked through it together with honesty and care*. You now *recognize these moments as opportunities* to deepen your trust rather than threats to it. Your relationship feels like solid ground beneath your feet.",
        embedCommand: "Feel the freedom that comes when trust allows you to be your authentic self without fear."
      },
      {
        label: "1 Year",
        vision: "A year from today, imagine the unshakable trust you've built together. You've created a relationship where promises are kept, vulnerabilities are honored, and integrity guides your actions. You *know in your bones that you're safe* with each other. This profound trust has *expanded into every area of your lives*, allowing you to take risks, grow, and pursue dreams with the security of knowing you have each other's unwavering support.",
        embedCommand: "Experience the deep peace of having a relationship that serves as a secure base for both of you."
      }
    ]
  },
  {
    id: "future-goals",
    title: "Creating Your Shared Future",
    type: "future",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, imagine sitting together, excitedly discussing your shared goals. You've identified dreams that light up both of your eyes—perhaps a trip you want to take, a home project, or a lifestyle change. You *feel the energy between you shift* as you align your vision. Even the act of planning together has brought you closer.",
        embedCommand: "Notice how much more connected you feel when working toward common goals."
      },
      {
        label: "6 Months",
        vision: "Six months into your future, see yourselves making tangible progress on your shared goals. You've established rhythms and routines that *support your vision becoming reality*. When obstacles arise, you *tackle them as a unified team*. You celebrate small wins together, each success strengthening your bond and confidence in what you can accomplish together.",
        embedCommand: "Feel the satisfaction of building something meaningful together that neither could create alone."
      },
      {
        label: "1 Year",
        vision: "A year from today, visualize looking back at what you've created together. Some goals have been achieved, others have evolved, and new dreams have emerged. What stands out most isn't just what you've accomplished but how the journey has transformed your relationship. You've *discovered each other's strengths in new ways* and developed a dynamic where you each shine while supporting the other. Your shared accomplishments have become touchstones in the story of your relationship.",
        embedCommand: "Experience the pride and connection that comes from building your unique life together."
      }
    ]
  },
  {
    id: "future-conflict",
    title: "Transforming Challenges into Connection",
    type: "conflict",
    timeframes: [
      {
        label: "1 Month",
        vision: "One month from now, imagine noticing a shift in how you handle disagreements. When tension arises, you both *pause and take a breath* instead of reacting immediately. You *remind yourselves that you're on the same team*. Even in moments of frustration, there's a new undercurrent of respect that changes the entire tone of the interaction.",
        embedCommand: "Feel how much safer disagreements become when approached with mutual respect."
      },
      {
        label: "6 Months",
        vision: "Six months into practicing healthier conflict patterns, see how arguments that once might have lasted days now resolve in hours or even minutes. You've developed a shared language for talking through differences. You *catch yourselves when old patterns emerge* and redirect to more constructive approaches. Most surprisingly, you've discovered that some conflicts have led to unexpected intimacy when resolved with care.",
        embedCommand: "Notice how resolving conflicts together actually strengthens your bond rather than threatening it."
      },
      {
        label: "1 Year",
        vision: "A year from today, visualize how fundamentally your conflict pattern has transformed. Disagreements still occur—as they do in any relationship—but they no longer carry fear or threat. You've *built such a strong foundation of respect and security* that differences can be explored with curiosity rather than defensiveness. You've mastered the art of repairing quickly after missteps. Friends often comment on how you navigate challenges together with such grace and unity.",
        embedCommand: "Feel the deep security of knowing that no conflict can threaten the core of your connection."
      }
    ]
  }
];

// Metaphor descriptions for different relationship aspects
export interface MetaphorDescription {
  title: string;
  description: string;
  metaphorType: 'flower' | 'bridge' | 'tree' | 'river' | 'flame';
  premium: string;
}

export const metaphorDescriptions: Record<string, MetaphorDescription> = {
  flower: {
    title: "The Blooming Relationship",
    description: "Just as a flower needs consistent care to bloom, your relationship flourishes with regular nurturing attention.",
    metaphorType: "flower",
    premium: "See how your connection naturally blossoms when you nurture it daily."
  },
  bridge: {
    title: "The Bridge of Understanding",
    description: "Each moment of genuine communication builds another plank in the bridge connecting your worlds.",
    metaphorType: "bridge",
    premium: "Experience how strong your connection becomes when built on clear communication."
  },
  tree: {
    title: "Deep Roots, Strong Growth",
    description: "Like a tree, your relationship grows stronger over time when rooted in trust and commitment.",
    metaphorType: "tree",
    premium: "Feel how your shared history creates stability that supports growth in new directions."
  },
  river: {
    title: "The Flowing Journey",
    description: "Your relationship flows like a river - sometimes calm, sometimes rapid, always moving forward together.",
    metaphorType: "river",
    premium: "Notice how navigating both smooth and challenging waters together strengthens your bond."
  },
  flame: {
    title: "The Enduring Flame",
    description: "The passion in your relationship, like a flame, requires attention and care to burn brightly.",
    metaphorType: "flame",
    premium: "Discover how small, consistent actions keep your connection vibrant and warm."
  }
}; 