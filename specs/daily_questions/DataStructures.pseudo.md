# Daily Question System - Data Structures Specification

## Overview
This document outlines the data structures required for the Daily Question System.

## Data Structures

### `QuestionCategory`
Represents a category of questions (e.g., "Adventure & Fun").

```pseudocode
STRUCTURE QuestionCategory
    id: STRING // Unique identifier (e.g., "adventure_fun")
    name: STRING // Display name (e.g., "Adventure & Fun")
    description: STRING // Brief description of the category
    icon: STRING // Optional: Identifier for a display icon
    // TDD Anchor: Test fetching categories
END STRUCTURE
```

### `Question`
Represents a single question within a category.

```pseudocode
STRUCTURE Question
    id: STRING // Unique identifier
    category_id: STRING // Foreign key linking to QuestionCategory.id
    text: STRING // The question text
    level: ENUM('Light', 'Medium', 'Deep') // Difficulty/depth level
    order: INTEGER // Sequence order within its level and category
    // TDD Anchor: Test fetching questions by category and level
END STRUCTURE
```

### `MiniChallenge`
Represents an optional mini-challenge related to a category.

```pseudocode
STRUCTURE MiniChallenge
    id: STRING // Unique identifier
    category_id: STRING // Foreign key linking to QuestionCategory.id (optional, could be general)
    text: STRING // The challenge description
    type: ENUM('Action', 'Reflection') // Type of challenge
    // TDD Anchor: Test fetching mini-challenges
END STRUCTURE
```

### `UserProgress`
Tracks a user's progress within a specific question category. Stored per user, potentially per relationship if applicable.

```pseudocode
STRUCTURE UserProgress
    user_id: STRING // Foreign key linking to the user
    relationship_id: STRING // Optional: Foreign key if progress is shared in a relationship
    category_id: STRING // Foreign key linking to QuestionCategory.id
    current_question_id: STRING // ID of the last answered/currently displayed question
    current_level: ENUM('Light', 'Medium', 'Deep') // Current level user is on
    questions_answered_in_level: INTEGER // Count of questions answered in the current level
    is_paused: BOOLEAN // Flag indicating if the user paused this category
    last_active_timestamp: DATETIME // Timestamp of the last interaction
    completed_levels: ARRAY<ENUM('Light', 'Medium', 'Deep')> // Levels fully completed
    is_category_complete: BOOLEAN // Flag indicating if all levels in the category are done
    // TDD Anchor: Test creating, updating, and fetching user progress
END STRUCTURE
```

### `UserAnswer` (Optional but Recommended for History/Reflection)
Stores a user's answer to a specific question.

```pseudocode
STRUCTURE UserAnswer
    id: STRING // Unique identifier
    user_id: STRING // Foreign key linking to the user
    relationship_id: STRING // Optional: Foreign key if answer is shared
    question_id: STRING // Foreign key linking to Question.id
    answer_text: STRING // The user's response (if applicable, might just be acknowledgement)
    answered_timestamp: DATETIME // Timestamp of when the answer was submitted
    reflection_prompt_shown: BOOLEAN // If an evening reflection prompt was associated
    reflection_text: STRING // Optional: User's evening reflection on the answer
    // TDD Anchor: Test saving and retrieving user answers
END STRUCTURE

## Storage Considerations (Beta)
- Suggest using Supabase tables mirroring these structures.
  - `daily_question_categories`
  - `daily_questions`
  - `mini_challenges`
  - `user_daily_question_progress`
  - `user_daily_question_answers` (Optional)
- RLS (Row Level Security) must be configured to ensure users can only access/modify their own progress and answers.