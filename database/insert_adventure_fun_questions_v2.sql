-- SQL Script to Insert "Adventure & Fun" Daily Questions (Version 2)
-- Category ID for "Adventure & Fun": dd75f035-2110-465c-981a-ea05727da1de

INSERT INTO daily_questions (id, category_id, question_text, level, "position", created_at) VALUES
-- Light Questions (Positions 1-5)
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'If you could go on a spontaneous road trip right now, where would you go and why?', 'Light', 1, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What''s a simple, fun activity you''d love to do together this week?', 'Light', 2, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'Share a funny memory of an adventure you''ve had (together or separately).', 'Light', 3, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What''s one small adventurous thing you''d like to try soon?', 'Light', 4, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'If you had a free afternoon, what fun, low-key activity would you choose?', 'Light', 5, NOW()),

-- Medium Questions (Positions 6-10)
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'Describe your ideal adventurous weekend getaway.', 'Medium', 6, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What''s an activity you''ve always wanted to try but felt a bit hesitant about?', 'Medium', 7, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'If we planned a ''mystery date'' for each other, what kind of adventure would you hope for?', 'Medium', 8, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What does ''adventure'' mean to you in the context of our relationship?', 'Medium', 9, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'How can we incorporate more playful fun into our daily lives?', 'Medium', 10, NOW()),

-- Deep Questions (Positions 11-15)
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What''s a fear you''d like to overcome, and how could we face it together adventurously?', 'Deep', 11, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'How does stepping outside our comfort zone together strengthen our bond?', 'Deep', 12, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'What kind of grand adventure (travel, project, etc.) do you dream of us embarking on someday?', 'Deep', 13, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'In what ways can exploring new experiences together help us grow individually and as a couple?', 'Deep', 14, NOW()),
(gen_random_uuid(), 'dd75f035-2110-465c-981a-ea05727da1de', 'How can we ensure our adventures align with both our individual desires and our shared values?', 'Deep', 15, NOW())
ON CONFLICT (category_id, "position") DO NOTHING; -- Assumes position is unique per category

-- Optional: Verify insertion
-- SELECT level, COUNT(*) FROM daily_questions WHERE category_id = 'dd75f035-2110-465c-981a-ea05727da1de' GROUP BY level;
-- SELECT "position", question_text FROM daily_questions WHERE category_id = 'dd75f035-2110-465c-981a-ea05727da1de' ORDER BY "position";