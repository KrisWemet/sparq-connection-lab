-- Add last_question_answered_at timestamp to user progress

alter table user_daily_question_progress
add column last_question_answered_at timestamp with time zone;

-- Optional: Add an index if querying based on this timestamp becomes frequent
-- create index idx_user_progress_last_answered on user_daily_question_progress (user_id, category_id, last_question_answered_at);

-- Update existing rows to avoid null issues if needed, though functions should handle null initially
-- Example: update user_daily_question_progress set last_question_answered_at = updated_at where last_question_answered_at is null;
-- It's generally better to handle nulls in the application logic.