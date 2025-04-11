# Daily Questions Feature Implementation Plan

## Overview

This plan outlines the steps to refine the Daily Questions feature in the frontend application. The goals are:

1.  Dynamically enable/disable question categories based on the presence of corresponding content files.
2.  Implement a feature allowing users to review their past answers.
3.  Add a conditional "Share with Partner" button after answering, with behavior dependent on the user's subscription tier and partner connection status.

## Available Categories (Based on `content/Daily Questions`)

The following category names (normalized) are considered available and should be enabled in the UI:

*   "Adventure & Fun"
*   "Appreciation & Gratitude"
*   "Conflict Repair"
*   "Emotional Intimacy"
*   "Hopes & Dreams"

## Implementation Steps

1.  **Identify Available Categories (Frontend Constant):**
    *   Define a constant list/set within the frontend code (e.g., in `frontend/src/pages/DailyQuestions.tsx` or a shared constants file) containing the normalized available category names listed above.

2.  **Modify `frontend/src/pages/DailyQuestions.tsx`:**
    *   **Fetch & Process Categories:** Fetch the full list of categories from the Supabase `daily_question_categories` table as currently implemented.
    *   After fetching, iterate through the received category list. For each category, add a new boolean property, `isEnabled`, based on whether its `name` exists in the *normalized available categories list* defined in Step 1.
    *   **Pass Props:** Pass this augmented list of categories (including the `isEnabled` flag) as a prop to the `CategorySelection` component.
    *   **Implement Review Feature:**
        *   Add state: `const [showReview, setShowReview] = useState(false);`
        *   Add a "Review Past Answers" button within the main content area rendered by the `renderContent` function.
        *   Configure the button's `onClick` handler to set `showReview` to `true`.
        *   Update the `renderContent` function:
            *   If `showReview` is `true`, render the `<PastAnswers />` component. Ensure the `fetchPastAnswers()` function (from the `useDailyQuestion` hook) is called when this component mounts or becomes visible. Include a "Back" button to set `showReview` back to `false`.
            *   If `showReview` is `false`, render `<CategorySelection />` or `<DailyQuestionView />` based on existing logic.

3.  **Modify `frontend/src/components/DailyQuestions/CategorySelection.tsx`:**
    *   Remove the hardcoded `ENABLED_CATEGORY_IDS` array.
    *   Update the component's props interface (`CategorySelectionProps`) to expect the `isEnabled` flag within each `Category` object it receives.
    *   Modify the rendering logic to use the passed `category.isEnabled` prop for:
        *   Disabling the category button (`disabled={isLoading || isCompleted || !category.isEnabled}`).
        *   Applying opacity styling (`className={... ${!category.isEnabled ? 'opacity-60' : ''}`).
        *   Conditionally showing the "Coming Soon" text/icon.

4.  **Modify `frontend/src/components/DailyQuestions/DailyQuestionView.tsx` (or the component handling answer submission):**
    *   **Add Conditional Share Button:** After an answer is successfully submitted, display a "Share with Partner" button.
    *   **Button State:**
        *   The button should be *disabled* (greyed out) if the user is on the Freemium tier OR does not have a connected partner.
        *   The button should be *enabled* for Premium/Ultimate users *with* a connected partner.
        *   *(Dependency: This component needs access to the user's subscription tier and partner connection status).*
    *   **Button Action (Placeholder):** The enabled button's `onClick` handler should initially perform a placeholder action (e.g., log to console, show a toast: "Sharing answer..."). The full sharing implementation (sending message/notification) will be handled separately.
    *   **Next Step:** Ensure a clear way for the user to proceed after answering/sharing (e.g., "Done", "Next Question" button).

## Process Flow Diagram

```mermaid
graph TD
    subgraph DailyQuestions Page (DailyQuestions.tsx)
        A[User visits /daily-question] --> B{User has selected category?};
        B -- No --> C[Fetch Categories + Progress];
        C --> D[Process: Add 'isEnabled' based on content files];
        D --> E[Render CategorySelection];
        B -- Yes --> G[Render DailyQuestionView];

        H[Review Button on Page] -- Click --> I{Set showReview=true};
        I --> J[Render PastAnswers Component];
        J --> K[Fetch Past Answers Data];
        K -- Back Button --> L{Set showReview=false};
        L --> B;
    end

    subgraph Category Selection (CategorySelection.tsx)
        E -- Receives categories w/ isEnabled --> M[Display List: Use isEnabled for styling/disabling];
        M -- User selects enabled category --> N[Call startCategory / setSelectedCategory];
    end

    subgraph Question View (DailyQuestionView.tsx)
        G --> O[Display Question];
        O -- User Submits Answer --> P[Handle Submission];
        P --> Q{Check Tier & Partner Status};
        Q -- Premium/Ultimate + Partnered --> R[Show ENABLED 'Share' Button];
        Q -- Freemium OR No Partner --> S[Show DISABLED 'Share' Button];
        R -- Click --> T(Log 'Sharing...' / Placeholder Action);
        S --> U[Show 'Done'/'Next'];
        T --> U;
    end

    N --> G;
```

## Assumptions & Dependencies

*   **Category Mapping:** Assumes the `name` field in the `daily_question_categories` table (e.g., "Adventure & Fun") directly maps to the corresponding filename in `content/Daily Questions` (e.g., `Adventure&Fun.md`) after removing the extension and normalizing spacing/casing.
*   **User Context:** The component responsible for displaying the "Share" button needs access to the current user's subscription tier and partner connection status.