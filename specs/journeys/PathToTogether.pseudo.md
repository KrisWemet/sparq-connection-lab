// File: specs/journeys/PathToTogether.pseudo.md

# Specification: Path to Together Journeys

## 1. Overview

The "Path to Together Journeys" feature guides couples through structured, multi-day programs focused on specific relationship themes (e.g., Communication Mastery, Vision & Values). Each day unlocks sequentially, presenting content, activities, and reflection prompts. Progress is tracked individually and potentially shared with the partner.

## 2. Data Structures

```typescript
// Represents a complete Journey program
type Journey = {
  id: string; // Unique identifier (e.g., "communication-mastery")
  title: string; // Display title (e.g., "Communication Mastery")
  description: string; // Brief overview of the journey
  estimatedDurationDays: number; // Approximate length
  theme: string; // Category (e.g., "Communication", "Intimacy")
  days: Day[]; // Array of daily content, ordered sequentially
  // TDD: Ensure Journey structure validation
};

// Represents a single day within a Journey
type Day = {
  dayNumber: number; // Sequence number (1, 2, 3...)
  title: string; // Title for the day's theme (e.g., "Understanding Listening Styles")
  content: ContentBlock[]; // Array of content blocks (text, video links, exercises)
  reflectionPrompt: string; // Prompt for user reflection
  activity?: Activity; // Optional specific activity for the day
  // TDD: Ensure Day structure validation
};

// Represents different types of content within a Day
type ContentBlock = {
  type: 'text' | 'video' | 'exercise' | 'link';
  value: string; // Text content, video URL, exercise description, external link URL
  // TDD: Ensure ContentBlock structure validation
};

// Represents an optional activity associated with a Day
type Activity = {
  type: 'quiz' | 'discussion' | 'action'; // Type of activity
  details: string; // Description or instructions
  // TDD: Ensure Activity structure validation
};

// Tracks a user's progress through a specific Journey
type UserJourneyProgress = {
  userId: string;
  journeyId: string;
  currentDay: number; // The highest day number the user has accessed
  completedDays: number[]; // Array of day numbers marked as complete
  startDate: Date;
  lastAccessedDate: Date;
  reflections: Reflection[]; // User's reflections for this journey
  // TDD: Ensure UserJourneyProgress structure validation
};

// Represents a user's reflection for a specific Day
type Reflection = {
  dayNumber: number;
  responseText: string;
  timestamp: Date;
  sharedWithPartner: boolean; // Flag indicating if shared
  // TDD: Ensure Reflection structure validation
};

// Represents user-partner relationship for sharing
type UserRelationship = {
    userId: string;
    partnerId?: string; // Nullable if no partner linked
    // TDD: Ensure UserRelationship structure validation
};
```

## 3. Component Breakdown (Frontend)

Based on existing structure (`src/pages/`, `src/components/journeys/`):

*   **`pages/Journeys.tsx`**:
    *   Displays available Journeys (e.g., using `components/journeys/JourneyCard`).
    *   Shows user's active/completed Journeys.
    *   Navigation to start a new Journey or continue an existing one.
    *   // TDD: Test rendering of available and user journeys.
*   **`pages/JourneyStart.tsx`**:
    *   Displays Journey overview (title, description, duration).
    *   Button to start the Journey (creates `UserJourneyProgress`).
    *   // TDD: Test rendering of journey details and start functionality.
*   **`pages/JourneyDetails.tsx`**:
    *   Main view for an active Journey.
    *   Renders the content for the `currentDay`.
    *   Includes:
        *   `components/journeys/DailyView`: Displays `Day` content (title, `ContentBlock`s, `Activity`).
        *   `components/journeys/ProgressTracker`: Visual indicator of progress through the Journey days.
        *   `components/journeys/ReflectionInput`: Text area for `Reflection.responseText`, save button, share toggle.
        *   Navigation (Previous/Next Day - only if unlocked).
        *   "Mark as Complete" button for the current day.
    *   // TDD: Test rendering of current day content.
    *   // TDD: Test navigation logic (locking/unlocking days).
    *   // TDD: Test "Mark as Complete" functionality.
*   **`components/journeys/JourneyCard.tsx`**:
    *   Reusable card to display basic Journey info (title, theme, maybe progress). Used in `pages/Journeys.tsx`.
    *   // TDD: Test rendering of journey card details.
*   **`components/journeys/DailyView.tsx`**:
    *   Renders the specific content (`ContentBlock`s, `Activity`) for a given `Day`.
    *   // TDD: Test rendering of different content block types.
*   **`components/journeys/ProgressTracker.tsx`**:
    *   Visual component (e.g., step indicator, progress bar) showing `currentDay` vs `estimatedDurationDays`.
    *   Highlights completed days based on `UserJourneyProgress.completedDays`.
    *   // TDD: Test accurate rendering of progress state.
*   **`components/journeys/ReflectionInput.tsx`**:
    *   Text area for reflection input.
    *   Save button (triggers API call).
    *   Share with partner toggle (updates `Reflection.sharedWithPartner`). Requires check for linked partner.
    *   Displays previously saved reflection for the current day if exists.
    *   // TDD: Test saving reflection text.
    *   // TDD: Test toggling share status and interaction with partner status.
    *   // TDD: Test loading existing reflections.

## 4. Core Logic

*   **Journey Initialization:**
    *   When a user starts a Journey (`pages/JourneyStart.tsx`):
        *   Create a `UserJourneyProgress` record for the user and `journeyId`.
        *   Set `currentDay` to 1.
        *   Set `completedDays` to an empty array.
        *   Set `startDate` to now.
        *   // TDD: Test successful creation of UserJourneyProgress on start.
*   **Sequential Unlocking:**
    *   Access to `Day N` is allowed only if `Day N-1` is marked as complete OR if `N` is the user's `currentDay`.
    *   The `pages/JourneyDetails.tsx` component fetches `UserJourneyProgress`.
    *   It determines the highest accessible day (`currentDay`).
    *   Navigation controls (e.g., "Next Day" button) are enabled/disabled based on completion status of the *previous* day.
    *   // TDD: Test logic for determining accessible days.
    *   // TDD: Test enabling/disabling of navigation based on completion status.
*   **Progress Tracking:**
    *   When a user clicks "Mark as Complete" for `Day N` in `pages/JourneyDetails.tsx`:
        *   Add `N` to the `UserJourneyProgress.completedDays` array.
        *   If `N` was the `currentDay`, increment `UserJourneyProgress.currentDay` to `N + 1` (if `N + 1` exists in the Journey).
        *   Update `UserJourneyProgress.lastAccessedDate`.
        *   Save the updated `UserJourneyProgress` via API.
        *   // TDD: Test adding day to completedDays array.
        *   // TDD: Test incrementing currentDay logic.
        *   // TDD: Test updating lastAccessedDate.
*   **Reflection Saving:**
    *   In `components/journeys/ReflectionInput.tsx`:
        *   On save, find or create the `Reflection` object for the `userId`, `journeyId`, and `dayNumber` within `UserJourneyProgress.reflections`.
        *   Update `responseText` and `timestamp`.
        *   Save the updated `UserJourneyProgress` (or just the reflection) via API.
        *   // TDD: Test creating a new reflection.
        *   // TDD: Test updating an existing reflection.
*   **Reflection Sharing:**
    *   In `components/journeys/ReflectionInput.tsx`:
        *   Check if the user has a linked partner (`UserRelationship`).
        *   If partner exists, enable the "Share" toggle.
        *   When toggled and saved, update `Reflection.sharedWithPartner` flag.
        *   Save the updated `Reflection` via API.
        *   (Backend/API): Implement logic to make shared reflections visible to the partner.
        *   // TDD: Test share toggle enablement based on partner status.
        *   // TDD: Test updating the sharedWithPartner flag on save.

## 5. API Requirements (Example Endpoints)

Assume base path `/api/journeys`

*   **`GET /api/journeys`**:
    *   Description: Fetch all available Journeys.
    *   Response: `Journey[]` (excluding `Day.content` potentially, for brevity, fetch day details separately).
    *   // TDD: Test endpoint returns list of available journeys.
*   **`GET /api/journeys/{journeyId}`**:
    *   Description: Fetch full details for a specific Journey, including all `Day` content.
    *   Response: `Journey`
    *   // TDD: Test endpoint returns complete journey details.
*   **`GET /api/users/{userId}/journeys/progress`**:
    *   Description: Fetch all `UserJourneyProgress` records for a given user.
    *   Response: `UserJourneyProgress[]`
    *   // TDD: Test endpoint returns user's progress across all journeys.
*   **`GET /api/users/{userId}/journeys/{journeyId}/progress`**:
    *   Description: Fetch specific `UserJourneyProgress` for a user and journey.
    *   Response: `UserJourneyProgress` or `404` if not started.
    *   // TDD: Test endpoint returns specific journey progress or 404.
*   **`POST /api/users/{userId}/journeys/{journeyId}/start`**:
    *   Description: Initialize progress for a user starting a journey.
    *   Body: (Optional, maybe initial settings) `{}`
    *   Response: `UserJourneyProgress` (newly created record).
    *   // TDD: Test endpoint creates and returns new progress record.
*   **`PUT /api/users/{userId}/journeys/{journeyId}/progress`**:
    *   Description: Update user's progress (e.g., mark day complete, update last accessed).
    *   Body: `Partial<UserJourneyProgress>` (e.g., `{ completedDays: [1, 2], currentDay: 3, lastAccessedDate: '...' }`)
    *   Response: Updated `UserJourneyProgress`.
    *   // TDD: Test endpoint updates progress fields correctly.
*   **`POST /api/users/{userId}/journeys/{journeyId}/days/{dayNumber}/reflection`**:
    *   Description: Save or update a reflection for a specific day.
    *   Body: `{ responseText: string; sharedWithPartner: boolean; }`
    *   Response: Updated `Reflection`.
    *   // TDD: Test endpoint saves/updates reflection text and share status.
*   **`GET /api/users/{userId}/partner/reflections`**:
    *   Description: Fetch reflections shared by the user's partner. Needs logic to identify partner and filter shared reflections across journeys.
    *   Response: `Reflection[]` (potentially augmented with journey/day context).
    *   // TDD: Test endpoint returns only shared reflections from the correct partner.
*   **`GET /api/users/{userId}/relationship`**:
    *   Description: Fetch user's relationship status (e.g., linked partner ID).
    *   Response: `UserRelationship`
    *   // TDD: Test endpoint returns correct relationship status.

## 6. UX/UI Notes

*   **Simplicity:** Keep the interface clean and focused. Avoid overwhelming the user with too much information at once.
*   **Encouragement:** Use positive reinforcement (visual progress, encouraging messages) as users complete days.
*   **Privacy:** Clearly indicate when a reflection is private vs. shared. Make sharing an explicit action. Default to private.
*   **Flexibility:** Allow users to revisit completed days.
*   **Clarity:** Clearly label Journeys, days, and activities. Ensure navigation is intuitive.

## 7. TDD Anchors Summary

*   Validate all Data Structures (`Journey`, `Day`, `ContentBlock`, `Activity`, `UserJourneyProgress`, `Reflection`, `UserRelationship`).
*   Test rendering of available/user journeys in `pages/Journeys.tsx`.
*   Test rendering/start functionality in `pages/JourneyStart.tsx`.
*   Test rendering of current day content in `pages/JourneyDetails.tsx`.
*   Test day locking/unlocking logic in `pages/JourneyDetails.tsx`.
*   Test "Mark as Complete" functionality in `pages/JourneyDetails.tsx`.
*   Test rendering of `components/journeys/JourneyCard.tsx`.
*   Test rendering of different content types in `components/journeys/DailyView.tsx`.
*   Test progress rendering in `components/journeys/ProgressTracker.tsx`.
*   Test reflection saving/loading in `components/journeys/ReflectionInput.tsx`.
*   Test reflection sharing logic (toggle enablement, flag update) in `components/journeys/ReflectionInput.tsx`.
*   Test successful creation of `UserJourneyProgress` on Journey start.
*   Test logic for determining accessible days based on progress.
*   Test enabling/disabling navigation based on completion status.
*   Test `completedDays` array updates.
*   Test `currentDay` increment logic.
*   Test `lastAccessedDate` updates.
*   Test creating/updating reflections.
*   Test API endpoint: `GET /api/journeys`.
*   Test API endpoint: `GET /api/journeys/{journeyId}`.
*   Test API endpoint: `GET /api/users/{userId}/journeys/progress`.
*   Test API endpoint: `GET /api/users/{userId}/journeys/{journeyId}/progress`.
*   Test API endpoint: `POST /api/users/{userId}/journeys/{journeyId}/start`.
*   Test API endpoint: `PUT /api/users/{userId}/journeys/{journeyId}/progress`.
*   Test API endpoint: `POST /api/users/{userId}/journeys/{journeyId}/days/{dayNumber}/reflection`.
*   Test API endpoint: `GET /api/users/{userId}/partner/reflections`.
*   Test API endpoint: `GET /api/users/{userId}/relationship`.

## 8. Journey Content: Emotional Safety & Secure Attachment

*   **id**: `emotional-safety-secure-attachment`
*   **title**: "Emotional Safety & Secure Attachment"
*   **description**: "A 21-day journey designed to help couples build a foundation of emotional safety and a secure, loving attachment through daily lessons, activities, reflections, and shared actions. Can be split into Part 1 (Fundamentals, Days 1-10) and Part 2 (Advanced Skills, Days 11-21)."
*   **estimatedDurationDays**: 21
*   **theme**: "Emotional Safety", "Attachment"
*   **days**:

    *   **### Day 1: Our Safe Journey Begins**
        *   **title**: "Our Safe Journey Begins"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Introduction to emotional safety as a 'safe haven'. Concept of secure attachment ('I am here for you'). Setting the stage with curiosity and kindness. Reference: Utah Therapy article on secure attachment." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Share what helps each feel safe. Collaboratively write and agree on 3 'Safety Ground Rules' (e.g., no name-calling, timeout option, full listening). Sign off as a pact." }
        *   **reflectionPrompt**: "What does emotional safety feel like to me, and when have I felt most safe with my partner?"
        *   **activity**: { type: 'action', details: "Shared Action: Create a ritual to symbolize commitment (e.g., fist-bump, 10-second hug) to start daily sessions." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Record a short joint video/voice note about journey expectations." }
        *   // TDD: Ensure Day 1 content renders correctly. Test activity completion tracking.

    *   **### Day 2: Emotions 101 – Name It to Tame It**
        *   **title**: "Emotions 101 – Name It to Tame It"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Importance of identifying and naming emotions (from DBT). 'Name it to tame it' concept. Reduces intensity, engages thinking brain. Non-judgmental attitude. Reference: Lilac Center article on DBT in relationships." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Solo → Together): Each partner lists 3 emotions felt recently. Share 1-2 emotions and their cause with partner. Practice active listening (just listen, say 'Thank you for sharing')." }
        *   **reflectionPrompt**: "Which emotion is hardest for me to share or admit, and why?"
        *   **activity**: { type: 'action', details: "Shared Action: Implement a daily 'emotion check-in' (share one feeling from the day)." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Display an emotion wheel or simple quiz in-app." }
        *   // TDD: Ensure Day 2 content renders. Test emotion check-in logging.

    *   **### Day 3: Calm Together – Co-Regulation Basics**
        *   **title**: "Calm Together – Co-Regulation Basics"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Introduction to co-regulation – soothing each other's nervous systems through touch, tone, breathing. Concept of 'heart coherence' when breathing in sync. Goal: handle stress as a team. Reference: EurekAlert image context, Psychology Today on hugs, Yung Sidekick on heart coherence." }
            *   `ContentBlock`: { type: 'link', value: "https://www.psychologytoday.com/us/blog/keep-it-in-mind/202201/what-20-seconds-hugging-can-do-you" } // Example link
            *   `ContentBlock`: { type: 'link', value: "https://yung-sidekick.com/blog/17-proven-couples-therapy-exercises-that-actually-work-in-2025" } // Example link
        *   **activity**: { type: 'action', details: "Guided Activity (Together): Partner Breathing Exercise. Sit facing (or back-to-back). Practice 4-7-8 breathing (or 4-4-6) together for 5+ cycles. Notice relaxation/connection. Reference: Little Flower Yoga for back-to-back option." }
        *   **reflectionPrompt**: "How did it feel to breathe together? Did I notice any change in my body or mood?"
        *   **activity**: { type: 'action', details: "Shared Action: Agree on a signal/code word for needing a calming pause. When used, take 1-2 mins to breathe together or hug." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: In-app guided breathing audio." }
        *   // TDD: Ensure Day 3 content renders. Test signal agreement logging.

    *   **### Day 4: Listen with Heart**
        *   **title**: "Listen with Heart"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Importance of active listening for feeling heard, loved, safe. Tuning in without interrupting, defending, or planning response. Builds trust. Be warm and curious. Reference: PsychCentral on active listening." }
            *   `ContentBlock`: { type: 'link', value: "https://psychcentral.com/blog/how-do-you-create-emotional-safety-in-your-relationships" } // Example link
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Timed (3 min each) Speaker/Listener exercise on an everyday topic. Listener practices active listening (eye contact, nods, encouragers). Listener summarizes at the end. Switch roles. Discuss the experience." }
        *   **reflectionPrompt**: "Was it hard to just listen without speaking? What distracted me, and how can I stay present?"
        *   **activity**: { type: 'action', details: "Shared Action: Practice active listening daily in small ways (e.g., pause activity, put down phone for 1 min when partner talks). Use playful cue if drifting." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Short video demonstrating poor vs. active listening." }
        *   // TDD: Ensure Day 4 content renders. Test summary validation.

    *   **### Day 5: The Power of Appreciation**
        *   **title**: "The Power of Appreciation"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Feeling appreciated is essential for safety. Gottman's 5:1 positive-to-negative interaction ratio. Practice gratitude and appreciation for partner's qualities/actions. Builds goodwill. Reference: Psychology Today on Gottman ratio." }
            *   `ContentBlock`: { type: 'link', value: "https://www.psychologytoday.com/ca/blog/curating-your-life/202206/the-gottman-ratio-happy-relationships-work" } // Example link
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Each partner thinks of 3 things they appreciate about the other. Share them one by one ('I appreciate that you...'). Listener responds 'Thank you'. Swap turns. Let positive feelings sink in. Reference: Yung Sidekick on 'Appreciations' exercise." }
        *   **reflectionPrompt**: "How did it feel to give and receive compliments? What does this tell me about how we show love?"
        *   **activity**: { type: 'action', details: "Shared Action: Voice one positive thing to partner daily (in person or text). Consistency builds safety." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: In-app 'Gratitude Jar' feature for anonymous daily notes, reviewed weekly." }
        *   // TDD: Ensure Day 5 content renders. Test gratitude jar interaction.

    *   **### Day 6: Our Attachment Patterns**
        *   **title**: "Our Attachment Patterns"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Exploring attachment patterns (reaching out vs. pulling back) shaped by past experiences. Understanding underlying needs/fears (anxious vs. avoidant tendencies). Goal: empathy, not labeling. Secure attachment needs ('you've got my back'). Reference: Utah Therapy on EFT/attachment needs." }
            *   `ContentBlock`: { type: 'link', value: "https://www.utahtherapy.com/secure-attachment-and-emotional-safety-in-couples-therapy/" } // Example link
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Attachment Reflection & Share. Individually reflect: 'When disconnected/upset, do I seek closeness or retreat? What's my fear?' Share insights: 'I tend to ___. Deep down I'm feeling ___.'. Listener thanks for sharing. Focus on understanding, not fixing." }
        *   **reflectionPrompt**: "What did I learn about my partner’s needs or fears? What did I learn about my own?"
        *   **activity**: { type: 'action', details: "Shared Action: When noticing attachment alarms (clinging/withdrawing), try a new response: communicate the need/fear gently ('I need space, but I'll be back' or 'I feel anxious, need reassurance'). Respond to partner's distress with extra love/calm." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: In-app Attachment Style Quiz (use as conversation starter)." }
        *   // TDD: Ensure Day 6 content renders. Test quiz interaction.

    *   **### Day 7: Staying Calm in the Storm**
        *   **title**: "Staying Calm in the Storm"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Toolkit for emotional storms (anger, panic). 'Fight, flight, freeze' response. Brain flooding (takes ~20 min to calm). Emotion Regulation skill: pause and self-soothe. DBT's STOP skill (Stop, Take step back, Observe, Proceed mindfully). Goal: respond thoughtfully, not react impulsively. Reference: Yung Sidekick on flooding time, Lilac Center on DBT." }
        *   **activity**: { type: 'action', details: "Guided Activity (Together): Practice the Pause (Role-play). Choose low-tension scenario. Partner A gets mildly upset. Partner B practices STOP skill (pause, breathe, relax posture, observe self/partner, respond calmly like 'I hear you. Let's talk in a moment - need to cool down'). Switch roles. Discuss calling timeouts." }
        *   **reflectionPrompt**: "What physical signs tell me I’m overwhelmed? What calming technique works best for me?"
        *   **activity**: { type: 'action', details: "Shared Action: Create a 'Calm Plan'. Agree on code phrase for needing a break ('I need 15 minutes'). Honor the break (min 20 mins recommended). Reconnect afterward for repair. Reduces reactivity." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: In-app 1-min Calming Meditation or visual breathing guide." }
        *   // TDD: Ensure Day 7 content renders. Test Calm Plan creation/storage.

    *   **### Day 8: Speaking Your Needs (No Blame, All Gain)**
        *   **title**: "Speaking Your Needs (No Blame, All Gain)"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Expressing feelings/needs healthily using 'I statements' and clear requests (avoids blame/defensiveness). Format: 'I feel... when... because... I need/would like...'. Based on EFT/DBT skills. Asking for needs is respectful. Reference: Lilac Center on DBT interpersonal skills." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Transform a Blame into a Request. Choose minor gripe. Write down normal expression (blame/sulk). Rewrite using 'I feel... when... because... I need/would like...' format. Share new statements. Listener paraphrases and validates. Discuss the difference." }
        *   **reflectionPrompt**: "Was it hard to say what I need? Did I worry I’d sound ‘needy’? How did my partner react to the new format vs. old?"
        *   **activity**: { type: 'action', details: "Shared Action: Pact to use 'I feel...I need...' approach at least once this week. Use gentle cues ('Can we rephrase?') if slipping into blame. Turns conflicts into problem-solving." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Quick multiple-choice quiz on identifying good 'I statements'." }
        *   // TDD: Ensure Day 8 content renders. Test 'I statement' practice logging.

    *   **### Day 9: Safe Boundaries, Strong Bond**
        *   **title**: "Safe Boundaries, Strong Bond"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Boundaries protect self and ensure respect, increasing trust/safety. Examples: personal space, emotional limits, privacy, communication style, alone time. Not walls, but guidelines for loving better. Tone: loving, positive, mutual care. Reference: PsychCentral on boundaries." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Boundary Sharing. Each reflects and writes 1-2 important personal boundaries. Share kindly ('One boundary important to me is... because...'). Listener paraphrases ('Okay, so you need...') and agrees to respect ('Got it. I will honor that.'). Ask clarifying questions gently. Switch roles." }
        *   **reflectionPrompt**: "Was it hard to express my boundary? Fear partner's reaction? How did hearing partner's boundaries feel?"
        *   **activity**: { type: 'action', details: "Shared Action: Honor and remember boundaries. Use reminders (notes, code words). Check in periodically ('How are we doing with boundaries?'). Frame as mutual care. Prevents resentment, fosters respect. Reference: PsychCentral on respected boundaries." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: In-app 'Boundaries Menu' with common examples." }
        *   // TDD: Ensure Day 9 content renders. Test boundary storage/retrieval.

    *   **### Day 10: Building Trust and Openness**
        *   **title**: "Building Trust and Openness"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Deepening trust through honesty and transparency. Trust = bedrock of secure attachment (authenticity without fear). Built by consistency, keeping word, openness. Built in small moments via vulnerability/follow-through. Tone: gentle, non-judgmental. Reference: PositivePsychology on trust/vulnerability." }
            *   `ContentBlock`: { type: 'link', value: "https://positivepsychology.com/build-trust/" } // Example link
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Truth & Openness Talk (10-15 min). Each shares 2 parts: 1) Something personal (hope, worry, memory - positive/neutral). 2) One concrete trust-building action commitment ('I'll text if late,' 'I'll own mistakes'). Listener thanks, offers support/validation. Switch roles. Builds intimacy and accountability." }
        *   **reflectionPrompt**: "How did it feel to share that piece of myself? How did partner's reaction feel? Confident in my trust-promise?"
        *   **activity**: { type: 'action', details: "Shared Action: Practice the promised trust-building action consistently. Acknowledge partner's efforts. Be truthful in everyday things (e.g., 'I'm upset but need time' vs. pretending). Own mistakes proactively. Builds reliability." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: App prompts to set reminder/calendar event for specific promises." }
        *   // TDD: Ensure Day 10 content renders. Test promise tracking/reminders.

    *   **### Day 11: Spotting Our Cycle**
        *   **title**: "Spotting Our Cycle"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Identifying repeating conflict patterns ('the dance'). From EFT: the negative cycle is the enemy, not the partner. Roles (pursuer/criticizer vs. withdrawer/defender). Externalize the cycle ('It'). Tone: curiosity, teamwork, no blame. Reference: Utah Therapy on EFT cycles." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Chart Your Conflict Dance. Choose recent disagreement. Map the cycle (paper/whiteboard/app). 'I did/said __ (internal feeling/action) -> You did/said __ (internal feeling/action) -> ...'. Name the cycle ('Chase-and-Hide Loop'). Align together against the pattern." }
        *   **reflectionPrompt**: "What feelings drive me in that cycle? What's my deepest fear/need underneath? How is it similar to childhood patterns?"
        *   **activity**: { type: 'action', details: "Shared Action: Use safe word/signal ('cycle!', 'déjà vu') when sensing the cycle starting. Pause together. Use prior skills (pause, 'I feel...', hug) to interrupt the script. It's 'us vs. the cycle'." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Save cycle diagram in-app. Show generic pursue-withdraw example." }
        *   // TDD: Ensure Day 11 content renders. Test cycle diagram saving.

    *   **### Day 12: Rupture and Repair**
        *   **title**: "Rupture and Repair"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: All relationships have ruptures (disconnection, hurt). Thriving couples repair them effectively. Repair = apology, hug, kind note, revisiting calmly. Proves relationship resilience. Focus: apologizing and forgiving. Tone: compassionate, humble. Goal: restore harmony. Reference: North Berkeley Therapy on rupture/repair." }
            *   `ContentBlock`: { type: 'link', value: "https://www.northberkeleytherapy.com/single-post/four-secure-attachment-principles-for-couples-working-things-out" } // Example link
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): The Art of Apology. Each thinks of a small recent hurt caused. Take turns offering genuine apology using structure: 1) Regret ('I'm sorry for...'), 2) Impact ('It made you feel...'), 3) Change ('In future, I will...'), 4) Forgiveness ('Hope you can forgive me'). Receiver responds ('Thank you, I forgive you' or 'Thank you, need time'). Discuss feelings." }
        *   **reflectionPrompt**: "What did I learn about how my partner experiences my actions? How do I normally handle apologizing/being apologized to?"
        *   **activity**: { type: 'action', details: "Shared Action: Normalize quick repairs. Practice simple apologies ('Oops, sorry'). Invite repair ('Ouch, that hurt. Rephrase?'). Practice forgiveness for small things. Address and mend. 'The reunion is the important part'." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Short video clip of fight/repair or expert talk. List of creative repair ideas." }
        *   // TDD: Ensure Day 12 content renders. Test apology practice logging.

    *   **### Day 13: Courage to Be Vulnerable**
        *   **title**: "Courage to Be Vulnerable"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Vulnerability as the birthplace of intimacy, love, connection (Brené Brown). Sharing deeper feelings/experiences (fears, hopes, wounds). Requires safety built previously. Listener's role: create soft landing (support, empathy, no criticism). Dispels 'Will they still love me?' fear. Strengthens secure attachment ('I can show my true self'). Reference: PositivePsychology on vulnerability/trust." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Vulnerability Share. Set warm scene. Each shares (~5 min) on a vulnerable topic (use prompts: biggest fear, past hurt, deep wish, insecurity, hidden part). Listener listens quietly, offers empathy/support afterward ('Thank you for telling me,' 'I'm here with you'). Embrace/hold. Experience being heard/accepted." }
        *   **reflectionPrompt**: "How did it feel to show that vulnerability? How did it feel to hear partner's share? New compassion/appreciation?"
        *   **activity**: { type: 'action', details: "Shared Action: Honor shared vulnerabilities with ongoing kindness (reassurance, check-ins). Practice small daily vulnerabilities ('I miss you,' 'I was hurt,' 'I need help'). Cultivates culture where both feel fully seen and adored." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Encourage writing a follow-up love note/text referencing the share." }
        *   // TDD: Ensure Day 13 content renders. Test reflection on vulnerability.

    *   **### Day 14: Understanding Our Protective Parts**
        *   **title**: "Understanding Our Protective Parts"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Gentle intro to Internal Family Systems (IFS). We have 'parts' (Critic, Stonewaller, Pleaser) that protect vulnerable self in conflict/stress. Helps depersonalize reactions ('It's not you, it's a part activated by fear'). Take responsibility for managing parts. Tone: exploratory, playful, non-judgmental." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Meet My Protector. Each identifies a primary protector part (nickname?). What does it do? What's it protecting/afraid of? Introduce the part ('I have a part called The General... it protects me from feeling small...'). Share how partner can recognize it and what's needed ('If you see the General, I actually need reassurance'). Listener asks questions/shares feelings. Switch roles. Builds empathy, shared language." }
        *   **reflectionPrompt**: "How do I feel towards partner's protective part now? How about my own part (appreciate intention)?"
        *   **activity**: { type: 'action', details: "Shared Action: Spot each other's parts with compassion. Gently name it ('Is this the General talking? What's it afraid of?'). Voice your own part ('My inner Critic is out because I'm hurt. Let me restart.'). Team up against the perceived threat. Helps parts 'stand down'." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Brief IFS worksheet on common parts. List of funny part names. Doodle protector character." }
        *   // TDD: Ensure Day 14 content renders. Test protector part identification.

    *   **### Day 15: Laugh & Bond**
        *   **title**: "Laugh & Bond"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Importance of play and laughter for bonding, vibrancy, tension release. Builds trust ('I can be goofy'). Secure bond has seriousness and lightness. Goal: have fun, induce smiles/giggles. Tone: upbeat, playful." }
        *   **activity**: { type: 'action', details: "Guided Activity (Together): Playtime Challenge. Choose one fun activity: Memory Lane Game (share funny old photos), Goofy Question Jar, Dance Break (cheesy song), Two Truths and a Tall Tale, Draw Each Other (blindfolded?). Goal: shared laughter/smiles (10-15 min). Keep affectionate." }
        *   **reflectionPrompt**: "What moment made me laugh/smile most? How did it feel seeing partner playful? Do we need more fun?"
        *   **activity**: { type: 'action', details: "Shared Action: Make play/humor a habit (game night, daily joke/meme, inside jokes). Use levity during stress ('Silly face break!'). Nurture 30% playfulness. Secure attachment includes shared laughter." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: App 'surprise me' button with fun challenge/joke. Save funny drawings/answers." }
        *   // TDD: Ensure Day 15 content renders. Test activity choice logging.

    *   **### Day 16: The Comfort of Touch**
        *   **title**: "The Comfort of Touch"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Physical affection's role in bonding/soothing. Non-sexual, comforting touch (hugs, cuddling, hand-holding) calms anxiety, releases oxytocin. Respect boundaries/preferences. Tone: tender, soothing. Virginia Satir quote on hugs/day. Reference: Psychology Today on hugs." }
        *   **activity**: { type: 'action', details: "Guided Activity (Together): Heartfelt Hug & Cuddle. Start with proper 20-second hug (hold, breathe, melt). Transition to comfortable cuddle/close sitting (spoon seated, side-by-side). Maximize contact/pressure pleasantly. Try soothing touch (back rub, hand on heart) or forehead-to-forehead/hand-hold. Optional quiet reassurance ('You're safe'). ~5 min+. Communicate comfort levels." }
        *   **reflectionPrompt**: "How did my body feel during hug/cuddle? Emotions? Desire more touch or space? Learned about preferences?"
        *   **activity**: { type: 'action', details: "Shared Action: Make affectionate touch a daily ritual (20s hug morning/night, hand-holding, pre-sleep cuddle). Use touch for co-regulation (ask first: 'Hug or space?'). Increase positive:negative touch ratio. Aim for Satir's 8 hugs/day (quick ones count)." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Partner yoga/massage tutorial video. Calming music track." }
        *   // TDD: Ensure Day 16 content renders. Test touch preference logging.

    *   **### Day 17: Same Team Mentality**
        *   **title**: "Same Team Mentality"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Shift from 'me vs. you' to 'we vs. problem'. Be allies tackling issues side-by-side (Gottman, Collaborative Communication). Attack problem, not person. See multiple truths (DBT). Mindset: same team, same goal (healthy relationship). Tone: encouraging, cooperative." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Problem-Solving Side by Side. Choose minor issue/decision. Sit side-by-side. State common goal. Outline problem neutrally. Brainstorm solutions together (notepad/app). Evaluate pros/cons as team ('Option A...'). Look for win-win/compromise. Focus on collaborative process. Use physical touch (hold hands) to reinforce unity." }
        *   **reflectionPrompt**: "How did unified mindset feel vs. usual approach? Appreciated partner's teamwork?"
        *   **activity**: { type: 'action', details: "Shared Action: Use team language ('we' vs 'you/me'). Verbally remind 'Same team'. Create team name/mantra? Sit side-by-side for tricky talks. Phrase complaints as 'How can we solve...?'. Aim for win-win. View challenges as external." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Scenario quiz ('Which response shows same-team mindset?'). Cooperative mini-game." }
        *   // TDD: Ensure Day 17 content renders. Test collaborative problem solving outcome.

    *   **### Day 18: Supporting Each Other Under Stress**
        *   **title**: "Supporting Each Other Under Stress"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Handling external stress together (work, health, family). Turn toward, not on, each other. Be stress-buffers (listen, problem-solve, pick up slack). Don't take stress-induced snappiness personally (balance empathy/boundary). Tone: proactive, caring. Relationship as safe base. Reference: Utah Therapy on responsive partner reducing stress effects." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Stress Support Plan. Identify current/upcoming stressor. Discuss/jot down specific support actions for each other: Communication ('Check-in text', 'Name stress source'), Emotional ('Hug on arrival', 'Vent time'), Practical ('Handle cooking', 'Take kids'), Self-Care ('Remind bed time', 'Walk break'), Boundaries ('Say no to events', 'Limit topic discussion'). Make realistic/mutual." }
        *   **reflectionPrompt**: "More confident facing stress with plan? Which support offer touched me most? Realized unvoiced needs?"
        *   **activity**: { type: 'action', details: "Shared Action: Use plan when stress hits. Ask 'How can I support you right now?'. Regular stress check-ins ('What's stressing you? How can I help?'). If both stressed, be gentle, prioritize teamwork. Fight stress, not each other. Celebrate overcoming challenges ('We got through that together')." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Visible 'support cheat-sheet'. Custom app support reminders." }
        *   // TDD: Ensure Day 18 content renders. Test stress plan storage/retrieval.

    *   **### Day 19: Celebrating Our Growth**
        *   **title**: "Celebrating Our Growth"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Reflecting and celebrating progress reinforces change, builds confidence/gratitude. Focus on resilience/strengths. Acknowledge wins (big/small). Tone: joyful, appreciative, affirming. Positive recognition is bonding. Reference: Psychology Today on capitalization (sharing victories)." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Journey Highlights & Appreciation. Get comfy (festive drink?). Take turns answering prompts: 'I appreciate that you...' (partner's growth/efforts), 'I'm proud of us for...' (team achievements), 'One thing I learned about you is...' (new discovery/perspective), Optional: 'Favorite moment/exercise'. Let compliments/pride sink in. Toast/high-five." }
        *   **reflectionPrompt**: "Positive changes in myself? Proud of personally? How has perception of relationship shifted?"
        *   **activity**: { type: 'action', details: "Shared Action: Integrate celebration into culture. Celebrate little wins ('Hey, we did that without yelling!'). Acknowledge personal achievements. Weekly ritual ('Friday night kudos')? Plan special date/treat for journey completion. Mark accomplishment. Identity: 'We are a couple that grows'." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: App progress summary/'certificate'. Prompt for smiling selfie memento." }
        *   // TDD: Ensure Day 19 content renders. Test celebration logging.

    *   **### Day 20: Staying Secure Together**
        *   **title**: "Staying Secure Together"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Consolidate learning into sustainable lifestyle. Core secure attachment principles: Accessible, Responsive, Engaged (ARE). Craft personal toolkit/manual. Tone: forward-looking, committed. Co-author relationship 'constitution'. Reference: Utah Therapy on ARE." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Secure Attachment Game Plan. List top 5-10 vital practices/values to continue (Listen before reacting, Feelings welcome, Pause when upset, Repair, Daily affection, Team us, Respect boundaries, Humor, Appreciation, Honesty). Refine list. Each add personal commitment ('I commit to...'). Share. Create custom Secure Relationship Charter (sign/display optional)." }
        *   **reflectionPrompt**: "Which principle feels easiest/challenging? How handle slip-ups (compassion)?"
        *   **activity**: { type: 'action', details: "Shared Action: Put plan into action. Plan check-ins (monthly/quarterly relationship check-up date). Use charter as reference ('Hey, need more play time...'). Keep learning (articles, workshops). Live commitments daily (warm greetings, empathy, consistency). Continue being ARE." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Save charter in app/email PDF. Set calendar reminder for review. Recommend advanced resources/journeys." }
        *   // TDD: Ensure Day 20 content renders. Test charter saving/retrieval.

    *   **### Day 21: Looking Forward (Our Secure Future)**
        *   **title**: "Looking Forward (Our Secure Future)"
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Lesson: Final day - closure, celebration, looking ahead. Secure relationship = ongoing journey. Reflect on impact, set intentions. Express gratitude, final words. Tone: tender, hopeful, loving. Renew vows informally ('We're in this together, stronger')." }
        *   **activity**: { type: 'discussion', details: "Guided Activity (Together): Reflection & Future Hopes. Peaceful moment. Share 2 things: 1) What this journey meant ('Closer,' 'Learned to listen,' 'Forgave past things,' 'Proud of us'). 2) Hopes/vision for future ('Keep openness,' 'Continue growing,' 'Use skills for X,' 'Unbreakable team'). Symbolic closure (hug, toast, high-five, letter/gift optional)." }
        *   **reflectionPrompt**: "Internal acknowledgment: 'We did it.' How feel about partner now vs. Day 1? Embrace feeling."
        *   **activity**: { type: 'action', details: "Shared Action: Plan check-in/activity 1+ month out (calendar date, class, re-read highlights). Keep using helpful app features. Decide on Part 2/other resources. Enjoy each other! Recall journey as touchstone. Give kudos often. Journey continues daily." }
        *   **content**:
            *   `ContentBlock`: { type: 'text', value: "Optional: Shared memento (selfie, summary note). App 'Note to future selves'. Consider sharing experience (optional)." }
            *   `ContentBlock`: { type: 'text', value: "Final congratulations message: Reinforce skills, normalize ongoing effort, future filled with safety/trust/laughter/love." }
        *   // TDD: Ensure Day 21 content renders. Test future check-in scheduling.