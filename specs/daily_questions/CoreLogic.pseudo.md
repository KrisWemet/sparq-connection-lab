# Daily Question System - Core Logic Specification

## Overview
This document details the core logic for managing and delivering daily questions, tracking progress, and handling user interactions.

## Modules / Functions

### `DailyQuestionService` (Backend/Supabase Function)

#### `getCurrentOrNextQuestion(userId, relationshipId)`
Determines and retrieves the appropriate question for the user for the current day.

```pseudocode
FUNCTION getCurrentOrNextQuestion(userId, relationshipId)
    // 1. Determine Active Category (For Beta, hardcode "Adventure & Fun", later allow selection)
    activeCategoryId = "adventure_fun" // TODO: Make dynamic later

    // 2. Fetch User Progress for the active category
    userProgress = fetchUserProgress(userId, relationshipId, activeCategoryId)
    // TDD Anchor: Test fetching progress returns correct data or null/default

    // 3. Handle New User / New Category Start
    IF userProgress IS NULL THEN
        userProgress = initializeUserProgress(userId, relationshipId, activeCategoryId)
        // TDD Anchor: Test initialization creates progress at Light level, question 1
    END IF

    // 4. Check if Paused
    IF userProgress.is_paused THEN
        RETURN { status: "paused", progress: userProgress }
        // TDD Anchor: Test paused status returns correctly
    END IF

    // 5. Check if Category Completed
    IF userProgress.is_category_complete THEN
        RETURN { status: "category_complete", progress: userProgress }
        // TDD Anchor: Test category completion status returns correctly
    END IF

    // 6. Check if already answered today (based on last_active_timestamp or a separate flag)
    //    (Simplification for Beta: Assume one question interaction per day. More robust logic needed later)
    today = getCurrentDate()
    lastActiveDate = getDatePart(userProgress.last_active_timestamp)
    IF lastActiveDate == today AND userProgress.current_question_id IS NOT NULL THEN
         // Already interacted today, show the same question or a "come back tomorrow" message
         currentQuestion = fetchQuestionById(userProgress.current_question_id)
         RETURN { status: "already_answered_today", question: currentQuestion, progress: userProgress }
         // TDD Anchor: Test returning the same question if answered today
    END IF

    // 7. Determine the next question based on progress
    nextQuestion = findNextQuestion(userProgress)
    // TDD Anchor: Test finding the correct next question (within level, advancing level)

    // 8. Handle Category Completion Logic within findNextQuestion or here
    IF nextQuestion IS NULL AND userProgress.current_level == 'Deep' THEN
        markCategoryComplete(userProgress)
        RETURN { status: "category_complete", progress: userProgress }
        // TDD Anchor: Test category completion marking
    END IF

    // 9. Handle Level Advancement Logic within findNextQuestion or here
    IF nextQuestion IS NULL AND userProgress.current_level != 'Deep' THEN
        advanceLevel(userProgress)
        nextQuestion = findNextQuestion(userProgress) // Find first question of new level
        // TDD Anchor: Test level advancement logic
    END IF

    // 10. If somehow still no question (error or edge case)
    IF nextQuestion IS NULL THEN
        logError("Could not determine next question for user", userId, categoryId)
        RETURN { status: "error", message: "Could not find the next question." }
        // TDD Anchor: Test error handling for no question found
    END IF

    // 11. Update progress (set current_question_id, maybe update timestamp here or on answer)
    //     Decision: Update timestamp on answer submission for better tracking.
    //     Set the question ID now so the UI knows what to display.
    updateUserProgress(userProgress.id, { current_question_id: nextQuestion.id })

    RETURN { status: "new_question", question: nextQuestion, progress: userProgress }
    // TDD Anchor: Test returning a new question successfully
END FUNCTION
```

#### `submitAnswer(userId, relationshipId, questionId, answerText)`
Handles the submission of an answer, updates progress.

```pseudocode
FUNCTION submitAnswer(userId, relationshipId, questionId, answerText)
    // 1. Fetch User Progress for the category of the question
    question = fetchQuestionById(questionId)
    IF question IS NULL THEN RETURN { status: "error", message: "Invalid question ID." }
    categoryId = question.category_id
    userProgress = fetchUserProgress(userId, relationshipId, categoryId)
    IF userProgress IS NULL OR userProgress.current_question_id != questionId THEN
        logWarning("Answer submitted for non-current question", userId, questionId)
        RETURN { status: "error", message: "Mismatch in current question." }
        // TDD Anchor: Test handling answers for wrong questions
    END IF

    // 2. (Optional) Save the answer
    saveUserAnswer(userId, relationshipId, questionId, answerText)
    // TDD Anchor: Test answer saving

    // 3. Update Progress
    newAnswerCount = userProgress.questions_answered_in_level + 1
    updateUserProgress(userProgress.id, {
        questions_answered_in_level: newAnswerCount,
        last_active_timestamp: getCurrentTimestamp()
        // current_question_id remains until next fetch, or set to null here?
        // Decision: Keep current_question_id until the *next* fetch determines the *next* question.
    })
    // TDD Anchor: Test progress update after answering

    // 4. Check for Mini-Challenge Trigger (e.g., every 5 questions)
    challenge = NULL
    IF shouldTriggerMiniChallenge(newAnswerCount) THEN
        challenge = fetchRandomMiniChallenge(categoryId)
        // TDD Anchor: Test mini-challenge trigger logic
    END IF

    // 5. Check for Evening Reflection Trigger (based on time of day or settings)
    reflectionPrompt = NULL
    IF shouldTriggerEveningReflection() THEN
        reflectionPrompt = generateReflectionPrompt(question)
        // TDD Anchor: Test reflection prompt generation
    END IF

    RETURN { status: "success", mini_challenge: challenge, reflection_prompt: reflectionPrompt }
    // TDD Anchor: Test successful answer submission return value
END FUNCTION
```

#### `pauseCategory(userId, relationshipId, categoryId)`
Marks a category as paused for the user.

```pseudocode
FUNCTION pauseCategory(userId, relationshipId, categoryId)
    userProgress = fetchUserProgress(userId, relationshipId, categoryId)
    IF userProgress IS NOT NULL THEN
        updateUserProgress(userProgress.id, { is_paused: TRUE, last_active_timestamp: getCurrentTimestamp() })
        RETURN { status: "success" }
        // TDD Anchor: Test pausing updates the flag
    ELSE
        RETURN { status: "error", message: "Progress not found." }
    END IF
END FUNCTION
```

#### `resumeCategory(userId, relationshipId, categoryId)`
Resumes a paused category.

```pseudocode
FUNCTION resumeCategory(userId, relationshipId, categoryId)
    userProgress = fetchUserProgress(userId, relationshipId, categoryId)
    IF userProgress IS NOT NULL AND userProgress.is_paused THEN
        updateUserProgress(userProgress.id, { is_paused: FALSE, last_active_timestamp: getCurrentTimestamp() })
        // Optionally: Add logic for positive reinforcement message generation
        RETURN { status: "success", message: "Welcome back!" } // Simple message for now
        // TDD Anchor: Test resuming updates the flag
    ELSE IF userProgress IS NOT NULL AND NOT userProgress.is_paused THEN
         RETURN { status: "info", message: "Category already active." }
    ELSE
        RETURN { status: "error", message: "Progress not found." }
    END IF
END FUNCTION
```

### Helper Functions (Internal to Service or DB)

```pseudocode
FUNCTION fetchUserProgress(userId, relationshipId, categoryId)
    // DB Query: SELECT * FROM user_daily_question_progress WHERE user_id = ? AND relationship_id = ? AND category_id = ? LIMIT 1
    RETURN result OR NULL
END FUNCTION

FUNCTION initializeUserProgress(userId, relationshipId, categoryId)
    // DB Insert: INSERT INTO user_daily_question_progress (...) VALUES (...)
    // Default values: current_level='Light', questions_answered_in_level=0, is_paused=FALSE, etc.
    RETURN newly created progress record
END FUNCTION

FUNCTION fetchQuestionById(questionId)
    // DB Query: SELECT * FROM daily_questions WHERE id = ?
    RETURN result OR NULL
END FUNCTION

FUNCTION findNextQuestion(userProgress)
    // Logic:
    // 1. Find the highest 'order' question answered in the current level (requires answer tracking or careful progress update)
    //    Alternative: Use userProgress.current_question_id and its order.
    // 2. Find the next question in sequence within the current level.
    // DB Query: SELECT * FROM daily_questions
    //           WHERE category_id = ? AND level = ? AND order > (SELECT order FROM daily_questions WHERE id = ?)
    //           ORDER BY order ASC LIMIT 1
    currentQuestionOrder = fetchQuestionOrder(userProgress.current_question_id) // Or 0 if starting level
    nextQuestion = queryDbForNextQuestion(userProgress.category_id, userProgress.current_level, currentQuestionOrder)

    RETURN nextQuestion // Returns NULL if no more questions in this level
END FUNCTION

FUNCTION fetchQuestionOrder(questionId)
    IF questionId IS NULL THEN RETURN 0
    // DB Query: SELECT order FROM daily_questions WHERE id = ?
    RETURN order OR 0
END FUNCTION

FUNCTION markCategoryComplete(userProgress)
    // DB Update: UPDATE user_daily_question_progress SET is_category_complete = TRUE WHERE id = ?
END FUNCTION

FUNCTION advanceLevel(userProgress)
    nextLevel = getNextLevel(userProgress.current_level) // e.g., Light -> Medium, Medium -> Deep
    IF nextLevel IS NOT NULL THEN
        // DB Update: UPDATE user_daily_question_progress
        //            SET current_level = ?, questions_answered_in_level = 0, completed_levels = array_append(completed_levels, ?)
        //            WHERE id = ?
    END IF
END FUNCTION

FUNCTION getNextLevel(currentLevel)
    IF currentLevel == 'Light' THEN RETURN 'Medium'
    IF currentLevel == 'Medium' THEN RETURN 'Deep'
    RETURN NULL
END FUNCTION

FUNCTION saveUserAnswer(userId, relationshipId, questionId, answerText)
    // DB Insert: INSERT INTO user_daily_question_answers (...) VALUES (...)
END FUNCTION

FUNCTION shouldTriggerMiniChallenge(answerCount)
    // Simple logic: Trigger every 5 answers, or randomly?
    RETURN (answerCount % 5 == 0) // Example: Every 5th question
END FUNCTION

FUNCTION fetchRandomMiniChallenge(categoryId)
    // DB Query: SELECT * FROM mini_challenges WHERE category_id = ? ORDER BY RANDOM() LIMIT 1
    // Or fetch all and pick one in code.
    RETURN challenge OR NULL
END FUNCTION

FUNCTION shouldTriggerEveningReflection()
    // Logic based on time of day (e.g., after 6 PM) and maybe user settings
    currentTime = getCurrentTime()
    RETURN hourOf(currentTime) >= 18 // Example: 6 PM or later
END FUNCTION

FUNCTION generateReflectionPrompt(question)
    // Simple prompt based on the question asked earlier
    RETURN "Reflect on your thoughts about: '" + question.text + "'"
END FUNCTION

FUNCTION updateUserProgress(progressId, updates)
    // DB Update: UPDATE user_daily_question_progress SET ... WHERE id = ?
    // updates is an object like { is_paused: TRUE, last_active_timestamp: ... }
END FUNCTION
```

## Error Handling
- Log errors and warnings appropriately (e.g., database errors, invalid states).
- Return meaningful status codes and messages to the frontend.