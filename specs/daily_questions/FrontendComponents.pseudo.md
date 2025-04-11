# Daily Question System - Frontend Components Specification

## Overview
This document outlines the frontend components responsible for displaying daily questions, handling user interactions, and reflecting the system's state based on data from the `DailyQuestionService`.

## Core Hook: `useDailyQuestion`

This hook encapsulates the logic for fetching the daily question state and interacting with the backend service.

```pseudocode
HOOK useDailyQuestion(userId, relationshipId)
    // State Variables
    state: currentQuestionData = NULL // Holds { status, question, progress, mini_challenge, reflection_prompt, error } from backend
    state: isLoading = TRUE
    state: error = NULL

    // Effect: Fetch initial state on mount and when dependencies change
    EFFECT onMount OR [userId, relationshipId] change:
        isLoading = TRUE
        CALL DailyQuestionService.getCurrentOrNextQuestion(userId, relationshipId)
            ON SUCCESS (data):
                currentQuestionData = data
                isLoading = FALSE
                error = NULL
                // TDD Anchor: Test hook initializes with correct data based on service response (new_question, paused, etc.)
            ON FAILURE (err):
                error = err
                isLoading = FALSE
                currentQuestionData = NULL // Clear previous state on error
                // TDD Anchor: Test hook handles service errors gracefully
        END CALL
    END EFFECT

    // Action: Submit Answer
    FUNCTION handleAnswerSubmit(answerText)
        IF currentQuestionData.question IS NULL THEN RETURN // Cannot answer without a question
        questionId = currentQuestionData.question.id
        CALL DailyQuestionService.submitAnswer(userId, relationshipId, questionId, answerText)
            ON SUCCESS (response):
                // Re-fetch state to show "already answered" or next day's question?
                // Decision: For simplicity, assume UI shows a "Completed for today" message.
                // More complex: Could update local state optimistically or refetch.
                // Let's refetch for consistency in Beta.
                CALL DailyQuestionService.getCurrentOrNextQuestion(userId, relationshipId) -> update currentQuestionData
                // Optionally display mini-challenge/reflection based on response
                IF response.mini_challenge THEN displayMiniChallenge(response.mini_challenge)
                IF response.reflection_prompt THEN scheduleReflectionPrompt(response.reflection_prompt)
                // TDD Anchor: Test submitting answer triggers service call and updates state/shows challenge/prompt
            ON FAILURE (err):
                handleError("Failed to submit answer", err)
                // TDD Anchor: Test handling answer submission errors
        END CALL
    END FUNCTION

    // Action: Pause Category
    FUNCTION handlePause()
        categoryId = currentQuestionData?.progress?.category_id
        IF categoryId IS NULL THEN RETURN
        CALL DailyQuestionService.pauseCategory(userId, relationshipId, categoryId)
            ON SUCCESS:
                // Refetch state to show paused message
                CALL DailyQuestionService.getCurrentOrNextQuestion(userId, relationshipId) -> update currentQuestionData
                // TDD Anchor: Test pausing triggers service call and updates state to 'paused'
            ON FAILURE (err):
                handleError("Failed to pause", err)
        END CALL
    END FUNCTION

    // Action: Resume Category
    FUNCTION handleResume()
        categoryId = currentQuestionData?.progress?.category_id
        IF categoryId IS NULL THEN RETURN
        CALL DailyQuestionService.resumeCategory(userId, relationshipId, categoryId)
            ON SUCCESS:
                // Refetch state to get the next question
                CALL DailyQuestionService.getCurrentOrNextQuestion(userId, relationshipId) -> update currentQuestionData
                // TDD Anchor: Test resuming triggers service call and updates state to 'new_question' (or relevant status)
            ON FAILURE (err):
                handleError("Failed to resume", err)
        END CALL
    END FUNCTION

    // Return values
    RETURN {
        isLoading,
        error,
        status: currentQuestionData?.status, // 'new_question', 'paused', 'category_complete', 'already_answered_today', 'error'
        question: currentQuestionData?.question,
        progress: currentQuestionData?.progress,
        actions: { handleAnswerSubmit, handlePause, handleResume }
    }
END HOOK
```

## Components

### `DailyQuestionView` (Container Component)
Uses the `useDailyQuestion` hook and renders child components based on the state.

```pseudocode
COMPONENT DailyQuestionView(userId, relationshipId)
    // Use the hook
    hookData = useDailyQuestion(userId, relationshipId)

    // Render Loading State
    IF hookData.isLoading THEN
        RENDER LoadingSpinner
        // TDD Anchor: Test loading state is shown initially
    END IF

    // Render Error State
    IF hookData.error THEN
        RENDER ErrorMessage(message: hookData.error.message)
        // TDD Anchor: Test error message is shown on hook error
    END IF

    // Render Content based on Status
    SWITCH hookData.status
        CASE 'new_question':
            RENDER QuestionDisplay(question: hookData.question)
            RENDER AnswerInput(onSubmit: hookData.actions.handleAnswerSubmit)
            RENDER PauseResumeButton(isPaused: FALSE, onPause: hookData.actions.handlePause, onResume: NULL)
            // TDD Anchor: Test rendering question, input, and pause button for 'new_question' status
            BREAK
        CASE 'paused':
            RENDER PausedMessage(categoryName: hookData.progress?.category_id) // Fetch category name if needed
            RENDER PauseResumeButton(isPaused: TRUE, onPause: NULL, onResume: hookData.actions.handleResume)
            // TDD Anchor: Test rendering paused message and resume button for 'paused' status
            BREAK
        CASE 'category_complete':
            RENDER CelebrationView(categoryName: hookData.progress?.category_id)
            // TDD Anchor: Test rendering celebration view for 'category_complete' status
            BREAK
        CASE 'already_answered_today':
            RENDER QuestionDisplay(question: hookData.question) // Show the question they answered
            RENDER AlreadyAnsweredMessage
            RENDER PauseResumeButton(isPaused: FALSE, onPause: hookData.actions.handlePause, onResume: NULL) // Still allow pausing
            // TDD Anchor: Test rendering answered message for 'already_answered_today' status
            BREAK
        DEFAULT:
            // Handle unexpected status or initial NULL state before loading finishes
            RENDER EmptyState or GenericMessage
    END SWITCH

    // TODO: Integrate MiniChallengeCard and ReflectionPrompt display logic
    // These might be triggered by handleAnswerSubmit and shown conditionally,
    // potentially outside the main SWITCH or via a modal/toast system.

END COMPONENT
```

### `QuestionDisplay` (Presentational Component)
Displays the question text and potentially its level.

```pseudocode
COMPONENT QuestionDisplay(question)
    RENDER Text("Level: " + question.level) // Optional display
    RENDER Heading(question.text)
    // TDD Anchor: Test component renders question text and level correctly
END COMPONENT
```

### `AnswerInput` (Presentational Component)
Provides the interface for answering (e.g., a text area and submit button).

```pseudocode
COMPONENT AnswerInput(onSubmit)
    state: answerText = ""

    FUNCTION handleSubmit()
        onSubmit(answerText)
    END FUNCTION

    RENDER TextArea(value: answerText, onChange: update answerText)
    RENDER Button(onClick: handleSubmit, text: "Submit Answer")
    // TDD Anchor: Test input updates state and submit calls onSubmit callback
END COMPONENT
```
*(Note: For Beta, this could be simplified to just a "Mark as Read" button if text input isn't required initially)*

### `PauseResumeButton` (Presentational Component)
Button to pause or resume the category.

```pseudocode
COMPONENT PauseResumeButton(isPaused, onPause, onResume)
    IF isPaused THEN
        RENDER Button(onClick: onResume, text: "Resume Questions")
        // TDD Anchor: Test renders Resume button when paused, calls onResume
    ELSE
        RENDER Button(onClick: onPause, text: "Pause for Now")
        // TDD Anchor: Test renders Pause button when active, calls onPause
    END IF
END COMPONENT
```

### `CelebrationView` (Presentational Component)
Displays a celebratory message upon category completion.

```pseudocode
COMPONENT CelebrationView(categoryName)
    RENDER Heading("Congratulations!")
    RENDER Text("You've completed the " + categoryName + " category!")
    // Add confetti/animation effect
    // TDD Anchor: Test renders correct completion message
END COMPONENT
```

### `PausedMessage` (Presentational Component)
Informs the user the category is paused.

```pseudocode
COMPONENT PausedMessage(categoryName)
    RENDER Text("You've paused the " + categoryName + " questions.")
    RENDER Text("Ready to jump back in?") // Encouragement nudge
    // TDD Anchor: Test renders paused message
END COMPONENT
```

### `AlreadyAnsweredMessage` (Presentational Component)
Informs the user they've completed the question for the day.

```pseudocode
COMPONENT AlreadyAnsweredMessage
    RENDER Text("Great job today!")
    RENDER Text("Come back tomorrow for your next question.")
    // TDD Anchor: Test renders already answered message
END COMPONENT
```

### `MiniChallengeCard` (Presentational Component)
Displays a mini-challenge. (Triggered after answer submission).

```pseudocode
COMPONENT MiniChallengeCard(challenge, onDismiss)
    RENDER Card {
        RENDER Heading("Mini Challenge!")
        RENDER Text(challenge.text)
        RENDER Button(onClick: onDismiss, text: "Got it!")
    }
    // TDD Anchor: Test renders challenge text and dismiss button
END COMPONENT
```

### `ReflectionPrompt` (Presentational Component)
Displays the evening reflection prompt. (Triggered after answer submission, potentially shown later via notification/modal).

```pseudocode
COMPONENT ReflectionPrompt(promptText, onSubmitReflection, onDismiss)
    state: reflectionText = ""

    FUNCTION handleSubmit()
        onSubmitReflection(reflectionText) // Needs corresponding service function
    END FUNCTION

    RENDER Modal or Card {
        RENDER Heading("Evening Reflection")
        RENDER Text(promptText)
        RENDER TextArea(value: reflectionText, onChange: update reflectionText)
        RENDER Button(onClick: handleSubmit, text: "Save Reflection")
        RENDER Button(onClick: onDismiss, text: "Maybe Later")
    }
    // TDD Anchor: Test renders prompt, handles input, calls submit/dismiss callbacks
END COMPONENT
```

## Data Flow Summary
1.  `DailyQuestionView` mounts, calls `useDailyQuestion`.
2.  `useDailyQuestion` calls `DailyQuestionService.getCurrentOrNextQuestion`.
3.  Service returns state (`status`, `question`, `progress`).
4.  Hook updates its state, `DailyQuestionView` re-renders.
5.  Appropriate child components are rendered based on `status`.
6.  User interacts (e.g., submits answer via `AnswerInput`).
7.  `AnswerInput` calls `handleAnswerSubmit` from the hook.
8.  Hook calls `DailyQuestionService.submitAnswer`.
9.  Service processes, updates DB, returns success/challenge/prompt.
10. Hook potentially re-fetches state or updates locally. `DailyQuestionView` re-renders showing "Already Answered" or displays challenge/prompt.
11. Pause/Resume follow similar interaction patterns.