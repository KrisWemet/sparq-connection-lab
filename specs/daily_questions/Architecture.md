# Sparq Connection - Daily Question System Architecture

## 1. Component Breakdown

### Frontend (React Components)

- **useDailyQuestion (Hook)**  
  - Handles fetching today's question, tracking user progress, submitting answers, handling pause/resume, and triggering celebration UI.

- **DailyQuestionView (Page/Screen)**  
  - Core UI displaying the current daily question, user's answer input, progress bar, and pause/resume controls.

- **QuestionDisplay (Component)**  
  - Displays the current question text and optional mini-challenge after a few questions.

- **AnswerInput (Component)**  
  - Text input for submitting the user's answer to the daily question.

- **PauseResumeButton (Component)**  
  - Button to allow pausing and resuming the Daily Question journey.

- **CelebrationView (Component)**  
  - Animated celebration when a user completes a category (badge, confetti, congratulations message).

- **ReflectionPrompt (Optional Component)**  
  - Offers a small reflection question at the end of the day ("How did today's question make you feel?").

---

### Backend (Supabase Edge Functions)

- **/daily-question**  
  - Fetches today's question for the user based on category and progress.

- **/daily-question-answer**  
  - Accepts user answers and updates their progress.

- **/daily-question-pause**  
  - Allows user to pause their Daily Question journey.

- **/daily-question-resume**  
  - Allows user to resume their journey.

---

## 2. Data Flow Overview

1. User opens app → useDailyQuestion hook fetches today's question via `/daily-question`.
2. Question and optional mini-challenge are displayed using DailyQuestionView.
3. User submits answer → sent to `/daily-question-answer` → stored in Supabase.
4. Progress updates. If completed all Light questions, next Medium question is served next day, then Deep.
5. If user clicks Pause, `/daily-question-pause` updates progress to paused.
6. If user clicks Resume, `/daily-question-resume` resumes progression.
7. On category completion → CelebrationView triggers.
8. Evening reflection prompt available at night (optional).

---

## 3. Database Schema (High Level)

Tables to be created:
- `daily_question_categories` (category info)
- `daily_questions` (individual questions)
- `mini_challenges` (optional fun actions)
- `user_daily_question_progress` (user's journey status)
- `user_daily_question_answers` (user's individual answers)

---

## 4. API Endpoints (Request/Response)

### /daily-question (GET)
- Request: `{ user_id }`
- Response: `{ question_id, question_text, mini_challenge (optional) }`

### /daily-question-answer (POST)
- Request: `{ user_id, question_id, answer_text }`
- Response: `{ success: true, next_question_ready: boolean }`

### /daily-question-pause (POST)
- Request: `{ user_id }`
- Response: `{ success: true }`

### /daily-question-resume (POST)
- Request: `{ user_id }`
- Response: `{ success: true, next_question }`

---

## 5. Integration Points

- Frontend calls these Edge Functions through existing Supabase client setup.
- Supabase handles database operations and RLS for user-specific data.
- Progress and celebration states will be used to update UI dynamically.

---

## 6. Notes for Future Expansion
- Add support for multiple categories.
- Allow users to switch or restart categories in the future.
- Surface streak tracking ("You've answered 7 days in a row!") as a motivational tool.
- Optional deeper reflections after 10+ questions answered.