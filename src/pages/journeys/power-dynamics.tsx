import JourneyTemplate from "./journey-template";
import {
  Scale,
  MessageSquare,
  Heart,
  Eye,
  Shield,
  Users,
  Brain,
  Compass,
  HandHeart,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Lightbulb,
} from "lucide-react";
import { JourneyTier } from "@/components/journey/JourneyTierView";

export default function PowerDynamicsJourney() {
  const tiers: JourneyTier[] = [
    {
      id: 'roots',
      totalDays: 14,
      concepts: [
        {
          id: "recognizing-power",
          title: "Recognizing power in your relationship",
          description: "Seeing the often-invisible ways power flows between you and your partner in daily life",
          icon: <Eye className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Who decides where to eat? Who manages the calendar? Who initiates sex? Who has the final word on finances? Power isn't always dramatic — it often lives in small, daily decisions. Noticing these patterns is the first step to choosing them consciously.",
          story: "Hannah and Raj sat down with a list: who picks restaurants, who books the vet, who decides on big purchases. Hannah's name was on almost every line. Neither had planned it that way. \"Huh,\" Raj said. \"That's a lot of deciding for one person.\"",
        },
        {
          id: "types-of-power",
          title: "Understanding types of power",
          description: "Recognizing that power operates through money, emotion, information, sex, social connections, and more",
          icon: <Scale className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "One partner may earn more (financial power) while the other manages the social calendar (social power). One may be more emotionally expressive (emotional power) while the other controls information flow (informational power). Power is rarely one-directional.",
          story: "Kofi earns more. Anna runs their social life, their calendar, and most of the feelings in the house. When they named it out loud, both felt seen. \"We each hold a lot,\" Anna said. \"Just different kinds.\"",
        },
        {
          id: "emotional-labor",
          title: "The invisible load: emotional labor",
          description: "Recognizing the unseen work of managing the household, family, and relationship emotional needs",
          icon: <Brain className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Remembering birthdays, scheduling appointments, noticing when the soap needs replacing, mediating family dynamics, managing the children's social lives. This invisible labor is a massive source of power imbalance in many relationships.",
          story: "Rosa kept a list for one week of everything she remembered for the family: birthdays, the dentist, the soap running low, her mother-in-law's mood. It ran three pages. When Ben read it, he went quiet. \"I didn't know,\" he said. \"I want to carry some of this.\"",
        },
        {
          id: "demand-withdraw",
          title: "The demand-withdraw pattern",
          description: "Understanding the power dynamic hidden in who pursues and who retreats during conflict",
          icon: <ArrowRightLeft className="w-5 h-5 text-red-500" />,
          color: "red",
          example: "One partner demands attention or resolution; the other withdraws. The pursuer feels powerless ('They won't engage'); the withdrawer feels powerless ('They won't stop'). Both experience a lack of power — understanding this breaks the cycle.",
          story: "The more Zoe pushed to talk, the more Isaac went silent. The more he went silent, the harder she pushed. Both felt stuck and powerless. One night Zoe said, \"We're both losing here.\" Isaac nodded. \"Let's find a different dance.\"",
        },
        {
          id: "cultural-influences",
          title: "Cultural power scripts",
          description: "Recognizing how gender roles, cultural norms, and family patterns shape power expectations",
          icon: <Users className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Growing up seeing one parent make all financial decisions while the other deferred. Cultural messages about who should be 'in charge.' Gender expectations about emotional expression. These scripts run silently until you examine them.",
          story: "Growing up, Omar watched his dad make every money decision while his mom stayed quiet. Without meaning to, he'd started doing the same with Nia. When he noticed, he pushed the budget across the table. \"Let's do this one together.\"",
        },
        {
          id: "consent-as-power-sharing",
          title: "Consent as power sharing",
          description: "Understanding that genuine consent is the foundation of equitable power in all areas of relationship",
          icon: <Lock className="w-5 h-5 text-sky-500" />,
          color: "sky",
          example: "Consent isn't just about sex. It's about decisions: 'Are we both genuinely okay with this plan, or did one of us just give in?' Checking for real agreement rather than compliance is how power stays balanced.",
          story: "Jordan said yes to hosting Thanksgiving, but Priya noticed the tight smile. \"Are you really okay with this,\" she asked, \"or did you just give in?\" Jordan paused. \"Honestly? I gave in.\" They found a plan they both actually wanted.",
        },
      ],
    },
    {
      id: 'growth',
      totalDays: 14,
      completionCriteria: { requireReflection: true },
      concepts: [
        {
          id: "power-conversations",
          title: "Having power conversations",
          description: "Learning to talk about power directly without it becoming an accusation or a fight",
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "Using curious, non-blaming language: 'I've been noticing that I usually defer to you on financial decisions. I don't think that's intentional from either of us, but I'd like us to make those choices more equally. What do you think?'",
          story: "Over coffee, Sophie said, \"I've noticed I usually go along with you on money stuff. I don't think either of us meant for that to happen. But I'd like more of a say.\" Wei didn't get defensive. \"You're right. Let's change it.\"",
        },
        {
          id: "redistributing-labor",
          title: "Redistributing invisible labor",
          description: "Creating fair systems for sharing the mental and emotional load of running a life together",
          icon: <Scale className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "Making the invisible visible: listing every task (mental, emotional, logistical) and jointly deciding who owns what. Not splitting 50/50 necessarily, but creating a system both partners feel is fair and sustainable. Reviewing monthly.",
          story: "Ellie and Jo wrote every household task on sticky notes — even the invisible ones, like \"remembers birthdays.\" Then they divided them in a way that felt fair to both. Not exactly half and half. But fair. The fridge door is covered in their system now.",
        },
        {
          id: "using-power-well",
          title: "Using power responsibly",
          description: "When you hold more power in some area, using it to uplift your partner rather than maintain advantage",
          icon: <HandHeart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "The higher-earning partner proactively ensuring the other has equal voice in financial decisions. The more socially confident partner creating space for the quieter one. Responsible power use means actively working against your own advantage.",
          story: "Daniel earns most of their money, and he knows it gives him quiet power. So before any big purchase, he asks Aiko first and waits for her real answer. \"It's our money,\" he says. He means it, and she can feel it.",
        },
        {
          id: "reclaiming-voice",
          title: "Reclaiming your voice",
          description: "For the partner who tends to defer — learning to express opinions, needs, and disagreements directly",
          icon: <Compass className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "Practicing 'I want' and 'I don't want' statements: 'I want to spend the holiday differently this year.' 'I don't want to take that on right now.' Starting small and building toward bigger assertions. Voice reclamation is a muscle that strengthens with use.",
          story: "Leah had spent years going along with holiday plans. This year she practiced one sentence in the mirror: \"I want to spend Christmas differently this year.\" She said it to Marcus that night. Her voice shook. He listened.",
        },
        {
          id: "making-space",
          title: "Making space for your partner",
          description: "For the partner who tends to dominate — learning to pause, ask, and truly defer",
          icon: <Shield className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Instead of stating your preference first (which often becomes the default), asking 'What do you think?' and sitting with silence while they formulate their answer. Not offering your opinion until they've fully expressed theirs.",
          story: "Usually Sam said what he wanted first, and Theo just agreed. This time Sam asked, \"What do you think?\" and then waited through the silence. After a long moment, Theo shared an idea Sam never would have thought of.",
        },
        {
          id: "decision-making-models",
          title: "Shared decision-making models",
          description: "Creating explicit systems for how you make decisions together — big and small",
          icon: <Lightbulb className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Establishing categories: Individual decisions (each partner has full autonomy), consultation decisions (one decides after hearing the other), and joint decisions (both must agree). This framework prevents both over-control and under-involvement.",
          story: "Mateo and Clara sorted decisions into three piles. Some are just Mateo's, like his fishing gear. Some are just Clara's. The big ones — like the house — they only decide together. Fewer fights. More trust.",
        },
      ],
    },
    {
      id: 'bloom',
      totalDays: 14,
      completionCriteria: { requireReflection: true, minReflectionLength: 30 },
      concepts: [
        {
          id: "conscious-power-flow",
          title: "Conscious power flow",
          description: "Letting power shift naturally between partners depending on context, strength, and situation",
          icon: <ArrowRightLeft className="w-5 h-5 text-blue-500" />,
          color: "blue",
          example: "In a healthy relationship, power flows like water — one partner leads on finances because they're skilled there; the other leads on social planning. During a health crisis, the well partner takes more. Fluidity, not rigidity, is the goal.",
          story: "Grace handles the money because she's great at it. Luis plans their social life. When Grace got sick last winter, Luis took over the bills for a while, then handed them back. Power moved like water — to wherever it was needed.",
        },
        {
          id: "power-in-intimacy",
          title: "Power dynamics in intimacy",
          description: "Consciously navigating who leads, who follows, and how power plays out in physical connection",
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          color: "rose",
          example: "Noticing who always initiates, who decides the pace, who ends. Experimenting with conscious role shifts: the partner who usually leads learns to receive; the one who usually follows learns to direct. This requires trust and explicit communication.",
          story: "Dev realized he always started the closeness between them, and Maya always followed. One night they talked about it and tried switching roles. It felt awkward and a little funny at first. It also felt new.",
        },
        {
          id: "equitable-partnership",
          title: "Building an equitable partnership",
          description: "Creating a relationship where both partners feel they have genuine voice, choice, and agency",
          icon: <Scale className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
          example: "Equity isn't identical roles — it's both partners feeling that the arrangement is fair. Regular check-ins: 'Do you feel heard in our relationship? Is there an area where you feel you have too much or too little say?' Equity is an ongoing conversation, not a fixed state.",
          story: "Every few months, Wei asks Sophie, \"Do you feel heard in our marriage? Is there anywhere things feel unfair?\" Some months the answer is \"All good.\" Once it was \"Chores.\" Either way, the question itself tells her she matters.",
        },
        {
          id: "power-under-stress",
          title: "Power dynamics under stress",
          description: "Maintaining equitable patterns when life gets hard and old defaults want to return",
          icon: <Shield className="w-5 h-5 text-amber-500" />,
          color: "amber",
          example: "During a crisis, one partner may naturally take over. This can be helpful temporarily — but recognizing when crisis mode has become the permanent mode. Checking in: 'We've been in survival mode for a while. Are we still sharing power, or has one of us been carrying everything?'",
          story: "When Kofi's mom got sick, Anna took charge of everything. It helped — at first. Months later, she noticed she was still running it all. \"We've been in crisis mode a long time,\" she said. \"Can we share it again?\"",
        },
        {
          id: "modeling-equity",
          title: "Modeling equity for others",
          description: "Recognizing that your equitable relationship becomes a model for your children, friends, and community",
          icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
          color: "purple",
          example: "Your children watch how you make decisions together, divide labor, and handle disagreements about power. Without a single lecture, they're absorbing what an equitable relationship looks like. This is one of the most powerful gifts you can give the next generation.",
          story: "Rosa and Ben's daughter watched them plan the family trip — both talking, both giving a little. Later she told her friend, \"In my house, grown-ups decide stuff together.\" Rosa overheard and smiled.",
        },
        {
          id: "power-as-generativity",
          title: "Power as generativity",
          description: "Using shared power to create something greater than either partner could alone",
          icon: <Users className="w-5 h-5 text-brand-hover" />,
          color: "indigo",
          example: "When power is shared consciously, the relationship becomes a creative force. Joint projects, shared visions, co-created rituals. Two people who trust each other's power aren't diminished by sharing it — they're amplified.",
          story: "When Jordan and Priya stopped fighting over who was in charge, something opened up. They started a small bakery stall together at the Saturday market. Two people trusting each other's strengths turned out to be a creative force.",
        },
      ],
    },
  ];

  return (
    <JourneyTemplate
      journeyId="power-dynamics"
      title="Power Dynamics & Play"
      description="Understand and consciously navigate power dynamics in your relationship. Progress from pattern recognition to creating genuine equity."
      tiers={tiers}
    />
  );
}
