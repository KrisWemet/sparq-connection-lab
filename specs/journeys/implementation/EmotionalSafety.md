# Implementation Plan: Emotional Safety & Secure Attachment Journey

## 1. Overview

This document outlines the detailed implementation plan for the "Emotional Safety & Secure Attachment" journey within the Lovable Web App. The journey is a 21-day program designed to help couples build a foundation of emotional safety and secure attachment through daily lessons, activities, reflections, and shared actions.

## 2. Journey Specifications

Based on the details from `specs/journeys/PathToTogether.pseudo.md`:

```javascript
{
  id: "emotional-safety-secure-attachment",
  title: "Emotional Safety & Secure Attachment",
  description: "A 21-day journey designed to help couples build a foundation of emotional safety and a secure, loving attachment through daily lessons, activities, reflections, and shared actions. Can be split into Part 1 (Fundamentals, Days 1-10) and Part 2 (Advanced Skills, Days 11-21).",
  estimatedDurationDays: 21,
  theme: ["Emotional Safety", "Attachment"],
  // The days content is defined in PathToTogether.pseudo.md
}
```

## 3. UI Components

### 3.1 New Components

#### JourneyCard.tsx
- **Purpose**: Display the Emotional Safety & Secure Attachment journey in the journey selection grid
- **Properties**:
  - `journey`: Journey object with id, title, description, etc.
  - `onClick`: Function to navigate to the journey detail page
- **Behavior**: Displays the journey card with title, description, category badge, duration, and "Explore Journey" button
- **Usage**: Used in the PathToTogether.tsx page

#### EmotionalSafetyJourneyDetails.tsx
- **Purpose**: Display detailed information about the Emotional Safety journey
- **Properties**:
  - `journey`: Complete journey object including days
- **Behavior**: Displays journey overview, psychological foundations, benefits, phases, and CTA to start the journey
- **Usage**: Shown when user clicks on the Emotional Safety journey card

#### DailyView.tsx
- **Purpose**: Display the content for a specific day of the journey
- **Properties**:
  - `day`: Day object containing title, content blocks, activity, reflection prompt
  - `dayNumber`: Current day number
  - `onComplete`: Callback when day is marked as complete
  - `isCompleted`: Boolean indicating if day is already completed
- **Behavior**: Renders the day's title, content blocks, activities, and reflection prompt
- **Usage**: Main component within JourneyDay.tsx

#### ContentBlockRenderer.tsx
- **Purpose**: Render different types of content blocks (text, video, link, etc.)
- **Properties**:
  - `block`: ContentBlock object with type and value
- **Behavior**: Renders appropriate UI based on content block type
- **Usage**: Used within DailyView.tsx

#### ActivityComponent.tsx
- **Purpose**: Display and handle day's activity (discussion, action, quiz)
- **Properties**:
  - `activity`: Activity object with type and details
  - `onComplete`: Callback when activity is completed
- **Behavior**: Provides instructions and UI for completing the activity
- **Usage**: Used within DailyView.tsx

#### ReflectionInput.tsx
- **Purpose**: Allow users to enter and save reflections for a day
- **Properties**:
  - `dayNumber`: Current day number
  - `journeyId`: Journey ID
  - `initialReflection`: Any existing reflection text
  - `sharedWithPartner`: Boolean for sharing status
  - `hasPartner`: Boolean indicating if user has linked partner
  - `onSave`: Callback when reflection is saved
- **Behavior**: Text area for reflection, save button, share toggle if partner linked
- **Usage**: Used within JourneyDay.tsx

#### ProgressTracker.tsx
- **Purpose**: Visual indicator of progress through journey days
- **Properties**:
  - `totalDays`: Total number of days in journey
  - `currentDay`: Current day user is on
  - `completedDays`: Array of completed day numbers
- **Behavior**: Shows progress indicators for each day (completed, current, locked)
- **Usage**: Used in JourneyProgress.tsx

### 3.2 Modified Components

#### PathToTogether.tsx
- **Modification**: Add the Emotional Safety journey to the journeys array
- **Implementation**:
  ```jsx
  {
    id: "emotional-safety-secure-attachment",
    title: "Emotional Safety & Secure Attachment",
    description: "A 21-day journey designed to help couples build a foundation of emotional safety and a secure, loving attachment through daily lessons, activities, reflections, and shared actions.",
    duration: "3 weeks",
    category: "Foundation",
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Attachment Theory",
      "Emotion-Focused Therapy (EFT)",
      "Dialectical Behavior Therapy (DBT)"
    ],
    benefits: [
      "Build emotional safety in your relationship",
      "Develop secure attachment patterns",
      "Improve communication during emotional moments",
      "Create stronger trust and openness"
    ],
    icon: <Shield className="w-5 h-5" />,
    phases: [
      {
        name: "Foundations",
        days: "Days 1-10",
        description: "Learn the fundamentals of emotional safety and secure attachment",
        icon: "🏠"
      },
      {
        name: "Advanced Skills",
        days: "Days 11-21",
        description: "Deepen your practice with advanced emotional techniques",
        icon: "🌱"
      }
    ]
  }
  ```

## 4. User Interactions

### 4.1 Journey Selection
1. User navigates to `/path-to-together`
2. User browses available journeys and clicks on "Emotional Safety & Secure Attachment" card
3. System navigates to `/journey/emotional-safety-secure-attachment`

### 4.2 Journey Detail View
1. System displays journey overview, psychological foundations, benefits, and phases
2. User reads information and clicks "Begin This Journey" button
3. System creates a new journey progress record and navigates to `/journey/emotional-safety-secure-attachment/day/1`

### 4.3 Day Navigation
1. User views content for the current day
2. User completes the activity and enters a reflection
3. User clicks "Mark as Complete" button
4. System updates progress and unlocks the next day
5. User can navigate between unlocked days using "Previous Day" and "Next Day" buttons or the progress tracker

### 4.4 Reflection Input
1. User reads the reflection prompt for the day
2. User enters their reflection in the text area
3. If user has a linked partner, they can toggle whether to share the reflection
4. User clicks "Save Reflection" button
5. System saves the reflection to the user's journey progress

### 4.5 Completing the Journey
1. User progresses through all 21 days
2. After completing day 21, system displays a journey completion message
3. User can revisit completed days to review content and reflections

## 5. Application Logic

### 5.1 Journey Initialization
- When user starts the journey, create a `UserJourneyProgress` record
- Set `currentDay` to 1, `completedDays` to an empty array, and `startDate` to current time
- Store in Supabase using the `me-journey-start` function

### 5.2 Day Unlocking Logic
- Access to Day N is allowed only if:
  - Day N-1 is marked as complete, OR
  - N is the user's current day
- Navigation controls are enabled/disabled based on these rules

### 5.3 Progress Tracking
- When user marks a day as complete:
  - Add day number to `completedDays` array
  - If it was the current day, increment `currentDay` to the next day
  - Update `lastAccessedDate`
  - Save using the `me-journey-progress-update` function

### 5.4 Reflection Management
- When user saves a reflection:
  - Create or update the reflection for the current day
  - Save the reflection text and sharing status
  - Store using the `me-journey-day-reflection` function

## 6. Data Requirements

### 6.1 Journey Data Structure
```typescript
type EmotionalSafetyJourney = {
  id: string; // "emotional-safety-secure-attachment"
  title: string; // "Emotional Safety & Secure Attachment"
  description: string;
  estimatedDurationDays: number; // 21
  theme: string[]; // ["Emotional Safety", "Attachment"]
  days: Day[]; // Array of 21 days
};

type Day = {
  dayNumber: number; // 1-21
  title: string; // E.g., "Our Safe Journey Begins"
  content: ContentBlock[];
  reflectionPrompt: string;
  activity?: Activity;
};

type ContentBlock = {
  type: 'text' | 'video' | 'exercise' | 'link';
  value: string;
};

type Activity = {
  type: 'quiz' | 'discussion' | 'action';
  details: string;
};
```

### 6.2 User Progress Structure
```typescript
type UserJourneyProgress = {
  userId: string;
  journeyId: string; // "emotional-safety-secure-attachment"
  currentDay: number;
  completedDays: number[];
  startDate: Date;
  lastAccessedDate: Date;
  reflections: Reflection[];
};

type Reflection = {
  dayNumber: number;
  responseText: string;
  timestamp: Date;
  sharedWithPartner: boolean;
};
```

## 7. API Integration

### 7.1 Required Endpoints

#### GET /api/journeys
- Fetch all available journeys, including the Emotional Safety journey
- Used in PathToTogether.tsx to display journey cards

#### GET /api/journeys/emotional-safety-secure-attachment
- Fetch full details for the Emotional Safety journey
- Used in JourneyDetails.tsx to display journey information

#### POST /api/users/{userId}/journeys/emotional-safety-secure-attachment/start
- Initialize progress for a user starting the journey
- Called when user clicks "Begin This Journey"

#### GET /api/users/{userId}/journeys/emotional-safety-secure-attachment/progress
- Fetch user's progress through the journey
- Used to determine current day, completed days, and reflections

#### PUT /api/users/{userId}/journeys/emotional-safety-secure-attachment/progress
- Update user's progress (mark day complete, update current day)
- Called when user completes a day

#### POST /api/users/{userId}/journeys/emotional-safety-secure-attachment/days/{dayNumber}/reflection
- Save or update a reflection for a specific day
- Called when user saves a reflection

### 7.2 Supabase Functions Integration

#### journey-detail
- Function: `supabase/functions/journey-detail/index.ts`
- Modification: Ensure it can retrieve the Emotional Safety journey from the database

#### me-journey-start
- Function: `supabase/functions/me-journey-start/index.ts`
- Modification: No changes needed, already handles generic journey starting

#### me-journey-progress-update
- Function: `supabase/functions/me-journey-progress-update/index.ts`
- Modification: No changes needed, handles generic progress updates

#### me-journey-day-reflection
- Function: `supabase/functions/me-journey-day-reflection/index.ts`
- Modification: No changes needed, handles reflection saving for any journey

## 8. Implementation Steps

### 8.1 Database Setup
1. Ensure the `journeys` table has a record for the Emotional Safety journey
2. Ensure the `journey_days` table has entries for all 21 days with their content
3. Verify the `user_journey_progress` and related tables are ready to store user data

### 8.2 Frontend Components
1. Create/modify components in order:
   - Update `PathToTogether.tsx` to include the new journey
   - Create/modify `JourneyCard.tsx` to display journey cards
   - Create/update `JourneyDetails.tsx` to display journey details
   - Implement `ProgressTracker.tsx` for visual progress tracking
   - Create `DailyView.tsx` for displaying day content
   - Implement `ContentBlockRenderer.tsx` for rendering different content types
   - Create `ActivityComponent.tsx` for handling activities
   - Implement `ReflectionInput.tsx` for user reflections

### 8.3 API Integration
1. Verify all required Supabase functions are working correctly
2. Implement frontend service functions to call these endpoints
3. Connect UI components to API services

### 8.4 Testing
1. Test journey card display on Path to Together page
2. Test journey details page
3. Test starting the journey
4. Test day navigation and completion
5. Test reflection saving and retrieval
6. Test progress tracking and day unlocking
7. Test journey completion

## 9. Routing Structure

- `/path-to-together` - Main journey selection page
- `/journey/emotional-safety-secure-attachment` - Journey details page
- `/journey/emotional-safety-secure-attachment/start` - Journey start confirmation page
- `/journey/emotional-safety-secure-attachment/day/:dayNumber` - Individual day view
- `/journey/emotional-safety-secure-attachment/complete` - Journey completion page

## 10. Responsive Design Considerations

1. Ensure all components adapt to different screen sizes
2. On mobile, stack elements vertically where appropriate
3. Adjust font sizes and padding for smaller screens
4. Ensure touch targets are appropriately sized on mobile
5. Test on multiple device sizes (mobile, tablet, desktop)

## 11. Accessibility Considerations

1. Use semantic HTML elements throughout
2. Ensure proper ARIA attributes where needed
3. Maintain sufficient color contrast
4. Provide text alternatives for non-text content
5. Ensure keyboard navigability
6. Test with screen readers

## 12. Future Enhancements

1. Notifications to remind users to continue their journey
2. Social sharing of journey milestones
3. Partner synchronization for completing days together
4. Downloadable PDFs of journey content and reflections
5. Audio/video content for enhanced learning
6. Community features to connect with others on the same journey 