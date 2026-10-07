import JourneyTemplate from "./journey-template";
import {
  Brain,
  Heart,
  Eye,
  Hand,
  Sparkles,
  Compass,
  Clock,
  Flame,
  Users,
  ShieldCheck,
  Lightbulb,
  Layers,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function MindfulSexualityJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "present-moment-awareness",
          title: "Present moment awareness",
          description: "Cultivating the ability to be fully here — in your body, with your partner, right now",
          icon: <Brain className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "During a hug, noticing the warmth of your partner's body, the rhythm of their breathing, the texture of their shirt. Your mind will wander to tomorrow's meeting — and that's okay. The practice is the gentle return to what's happening right now.",
          story: "Hugging Omar in the kitchen, Nia's mind drifted to tomorrow's meeting. She noticed, and came back: the warmth of his chest, the slow rise of his breath, the soft cotton of his shirt. Her shoulders dropped. For a whole minute, she was just there.",
        },
        {
          id: "body-awareness",
          title: "Body awareness",
          description: "Learning to listen to your body's signals, sensations, and responses without judgment",
          icon: <Hand className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Scanning your body from head to toe before an intimate moment: Where am I holding tension? What does my body need? Am I bracing or open? Body awareness is the foundation of mindful touch — you can't share presence if you're not in your own body.",
          story: "Before bed, Sophie did a quick check from head to toe. Jaw: tight. Shoulders: up by her ears. Belly: clenched. She took three slow breaths and let each part soften. When Wei reached for her, she was actually there to meet him.",
        },
        {
          id: "slowing-down",
          title: "The power of slowing down",
          description: "Discovering that less speed and more attention transforms the quality of physical connection",
          icon: <Clock className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Taking 10 minutes just to hold hands — really hold hands. Feeling the bones, the warmth, the pulse. When you slow intimacy to one-quarter speed, you notice things that have been there all along. Slowness isn't a sacrifice; it's an amplifier.",
          story: "Aiko and Daniel tried something odd: ten minutes of just holding hands. Really holding them. At first it felt silly. Then Aiko noticed the warmth of his palm and the tiny pulse in his wrist. \"I've held your hand a thousand times,\" she said. \"I've never felt it like this.\"",
        },
        {
          id: "noticing-mental-chatter",
          title: "Noticing mental chatter",
          description: "Becoming aware of the inner commentary that pulls you out of intimate moments",
          icon: <Eye className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Catching the thoughts that intrude during closeness: 'Am I doing this right?' 'Do they think I look okay?' 'I should check my phone after this.' You don't need to silence these thoughts — just notice them, label them ('thinking'), and return to sensation.",
          story: "Lying close to Isaac, Zoe caught her thoughts racing: \"Do I look okay? Am I doing this right?\" She didn't fight them. She just noticed — \"Oh, there's that worry\" — and came back to the feel of his hand on her back.",
        },
        {
          id: "breath-as-anchor",
          title: "Breath as anchor",
          description: "Using conscious breathing to stay present and deepen connection during physical intimacy",
          icon: <Compass className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Breathing together before and during intimate moments. Matching your exhale to your partner's inhale. Placing a hand on each other's chest and syncing rhythms. Breath is always available as an anchor to the present moment.",
          story: "Grace and Luis lay facing each other, each with a hand on the other's chest. Slowly, their breathing fell into the same rhythm. Neither said a word. Grace felt more connected than she had in weeks.",
        },
        {
          id: "non-judgmental-awareness",
          title: "Non-judgmental awareness",
          description: "Observing your physical and emotional responses without labeling them as good or bad",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Noticing arousal without grasping at it. Noticing its absence without panicking. Noticing pleasure without performing it. MBSR founder Kabat-Zinn teaches that non-judgment creates space for authentic experience — including authentic desire.",
          story: "Some nights Leah felt a spark. Some nights she didn't, and she used to panic about it. Now she just notices, without judging: \"Tonight I feel tired and tender.\" She tells Marcus. They hold each other, and that's enough.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "sensory-exploration",
          title: "Sensory exploration",
          description: "Systematically awakening each sense to deepen physical connection and pleasure",
          icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Dedicate one evening to a single sense: touch one night (exploring textures against skin), scent another (essential oils, candles, your partner's natural smell), sound (breathing, whispers, music). Isolating senses intensifies each one.",
          story: "Ellie and Jo picked one sense for the evening: scent. Jo lit a cedar candle. Ellie found the lotion that reminded her of their honeymoon. They laughed at how much a smell could bring back.",
        },
        {
          id: "mindful-touch",
          title: "Mindful touch practice",
          description: "Touching and being touched with full awareness — neither rushing toward a goal nor drifting away",
          icon: <Hand className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "One partner touches the other's arm for 5 minutes with complete attention — varying pressure, speed, and area. The receiving partner focuses only on sensation. Then switch. This sensate-focus-inspired practice rebuilds the neural pathways of attentive physical connection.",
          story: "For five slow minutes, Sam traced Theo's forearm — softer, then firmer, then barely there. Theo's only job was to notice. \"I didn't know my arm could feel all that,\" he said afterward, a little amazed.",
        },
        {
          id: "letting-go-of-goals",
          title: "Letting go of performance goals",
          description: "Releasing the pressure of orgasm, duration, or 'success' to simply be present with what is",
          icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Agreeing to an intimate encounter with explicitly no goal — not even arousal. Just presence, touch, and connection. Paradoxically, removing the goal often creates more pleasure, because the nervous system can relax into what's actually happening.",
          story: "Maya and Dev agreed: tonight, no goal at all. Just closeness. Without anything to get \"right,\" Maya felt her whole body relax. They talked and laughed and held each other. It was the most connected they'd felt in months.",
        },
        {
          id: "emotional-attunement-in-touch",
          title: "Emotional attunement in touch",
          description: "Reading and responding to your partner's emotional state through physical connection",
          icon: <Users className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Noticing through touch when your partner tenses slightly, holds their breath, or melts deeper into relaxation. Adjusting your touch in response — softer when they tense, firmer when they open. This wordless dialogue is the essence of attuned intimacy.",
          story: "Kofi felt Anna tense slightly under his hand. He didn't push through. He softened his touch and waited. A moment later, she melted into him. \"Thank you for noticing,\" she whispered.",
        },
        {
          id: "managing-distractions",
          title: "Working with distractions",
          description: "Developing practical strategies for when the mind wanders during intimate moments",
          icon: <Brain className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "When you notice you've drifted to work worries during intimacy, using the 'anchor' technique: place your hand on your partner's heartbeat and feel its rhythm for 10 seconds. This physical anchor brings you back without breaking the moment.",
          story: "Right in the middle of a tender moment, Raj's mind jumped to a work email. He noticed. He placed his hand over Hannah's heart and felt it beat for a few breaths. Just like that, he was back.",
        },
        {
          id: "communicating-in-the-moment",
          title: "Communicating during intimacy",
          description: "Using minimal, honest words to deepen connection without breaking presence",
          icon: <Lightbulb className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Simple, present-tense expressions: 'That feels beautiful.' 'I love being this close to you.' 'Can you stay right there?' These words aren't performance — they're real-time sharing of experience that deepens the shared moment.",
          story: "Priya used to stay quiet, afraid of saying the wrong thing. Now, lying close, she says simple true things: \"I love being this close to you.\" Jordan's smile says it's landing.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "embodied-presence",
          title: "Full embodied presence",
          description: "Bringing your complete, unguarded awareness to every physical interaction with your partner",
          icon: <Flame className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "A kiss that is just a kiss — not a prelude, not a habit, not a greeting. Your full consciousness inhabiting the experience of your lips meeting. When presence becomes your default mode, every touch carries the electricity that used to require novelty.",
          story: "Usually their goodbye kiss was a quick peck on the way out. This morning, Clara stopped at the door and kissed Mateo slowly, like it was the only thing happening in the world. He stood there after she left, grinning.",
        },
        {
          id: "somatic-connection",
          title: "Somatic connection",
          description: "Listening to and communicating through the body's deep intelligence during intimacy",
          icon: <Layers className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Feeling emotions surface through physical touch — tears during tenderness, laughter during pleasure, a wave of grief releasing through being held. Somatic experiencing teaches that the body stores what the mind can't process. Mindful intimacy creates space for this release.",
          story: "Held in Luis's arms after a hard week, Grace suddenly started crying. She didn't know why. He didn't ask. He just held her while it moved through. Afterward, she felt lighter than she had in months.",
        },
        {
          id: "sustained-presence",
          title: "Sustaining presence through intensity",
          description: "Staying fully aware even as physical and emotional intensity increases",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "The tendency during peak pleasure or emotion is to check out — to disconnect from the intensity. The practice of Bloom is staying: feeling every wave fully, remaining connected to your partner's eyes, breath, and experience even at the most intense moments.",
          story: "When feelings got big, Wei's habit was to check out — to drift away in his head. This time he noticed the urge and stayed. He kept his eyes on Sophie and let himself feel all of it. \"You're really here,\" she said.",
        },
        {
          id: "intimacy-as-meditation",
          title: "Intimacy as meditation",
          description: "Treating physical connection as a joint contemplative practice — a shared meditation",
          icon: <Brain className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Beginning an intimate encounter with 2 minutes of synchronized breathing, eyes open. Maintaining that meditative awareness throughout. Ending with stillness and gratitude. Intimacy becomes a spiritual practice — not in a religious sense, but in the sense of two people being fully, authentically present with each other.",
          story: "Ellie and Jo start with two minutes of breathing together, eyes open, foreheads almost touching. They move slowly and stay present. They end in stillness, just breathing. It feels less like a routine and more like a practice.",
        },
        {
          id: "mindful-intimacy-practice",
          title: "Building a mindful intimacy practice",
          description: "Creating sustainable habits that keep presence and awareness at the center of your physical relationship",
          icon: <Sparkles className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "A weekly 'mindful intimacy date' — not necessarily sexual, but always present. A daily 2-minute mindful touch ritual. An agreement to begin every intimate encounter with 30 seconds of eye contact. These practices become the architecture of a deeply connected physical life.",
          story: "Every day, Rosa and Ben share two minutes of mindful touch — a hand held, a back rubbed slowly. Every Friday, they have an unhurried evening just for the two of them. Small, steady, on purpose. It's changed everything.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="mindful-sexuality"
      title="Mindful sexuality"
      description="Bring presence, awareness, and deeper connection to your physical intimacy. Progress from basic mindfulness to embodied sexual presence."
      tiers={tiers}
    />
  );
}
