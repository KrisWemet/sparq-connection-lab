-- SQL Script to Insert Initial User Daily Question Progress for a Specific User and Category
-- User ID: 81e1110a-0075-4674-b600-d7480fb455a3
-- Category ID for "Adventure & Fun": dd75f035-2110-465c-981a-ea05727da1de

INSERT INTO user_daily_question_progress (user_id, category_id, current_level, current_question_index, last_answered_at)
VALUES (
    '81e1110a-0075-4674-b600-d7480fb455a3', -- Specific User ID
    'dd75f035-2110-465c-981a-ea05727da1de', -- Adventure & Fun Category ID
    'Light',                               -- Start at the 'Light' level
    0,                                     -- Start at the first question (index 0)
    NULL                                   -- No questions answered yet
)
ON CONFLICT (user_id, category_id) DO NOTHING; -- Avoid error if progress already exists

-- Optional: Verify insertion
-- SELECT * FROM user_daily_question_progress WHERE user_id = '81e1110a-0075-4674-b600-d7480fb455a3' AND category_id = 'dd75f035-2110-465c-981a-ea05727da1de';