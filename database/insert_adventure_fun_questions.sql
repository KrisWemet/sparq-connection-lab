-- SQL Script to Insert "Adventure & Fun" Daily Questions
-- Category ID for "Adventure & Fun": dd75f035-2110-465c-981a-ea05727da1de

INSERT INTO daily_questions (category_id, content, level) VALUES
-- Light Questions
('dd75f035-2110-465c-981a-ea05727da1de', 'If you could go on a spontaneous road trip right now, where would you go and why?', 'Light'),
('dd75f035-2110-465c-981a-ea05727da1de', 'What''s a simple, fun activity you''d love to do together this week?', 'Light'),
('dd75f035-2110-465c-981a-ea05727da1de', 'Share a funny memory of an adventure you''ve had (together or separately).', 'Light'),
('dd75f035-2110-465c-981a-ea05727da1de', 'What''s one small adventurous thing you''d like to try soon?', 'Light'),
('dd75f035-2110-465c-981a-ea05727da1de', 'If you had a free afternoon, what fun, low-key activity would you choose?', 'Light'),

-- Medium Questions
('dd75f035-2110-465c-981a-ea05727da1de', 'Describe your ideal adventurous weekend getaway.', 'Medium'),
('dd75f035-2110-465c-981a-ea05727da1de', 'What''s an activity you''ve always wanted to try but felt a bit hesitant about?', 'Medium'),
('dd75f035-2110-465c-981a-ea05727da1de', 'If we planned a ''mystery date'' for each other, what kind of adventure would you hope for?', 'Medium'),
('dd75f035-2110-465c-981a-ea05727da1de', 'What does ''adventure'' mean to you in the context of our relationship?', 'Medium'),
('dd75f035-2110-465c-981a-ea05727da1de', 'How can we incorporate more playful fun into our daily lives?', 'Medium'),

-- Deep Questions
('dd75f035-2110-465c-981a-ea05727da1de', 'What''s a fear you''d like to overcome, and how could we face it together adventurously?', 'Deep'),
('dd75f035-2110-465c-981a-ea05727da1de', 'How does stepping outside our comfort zone together strengthen our bond?', 'Deep'),
('dd75f035-2110-465c-981a-ea05727da1de', 'What kind of grand adventure (travel, project, etc.) do you dream of us embarking on someday?', 'Deep'),
('dd75f035-2110-465c-981a-ea05727da1de', 'In what ways can exploring new experiences together help us grow individually and as a couple?', 'Deep'),
('dd75f035-2110-465c-981a-ea05727da1de', 'How can we ensure our adventures align with both our individual desires and our shared values?', 'Deep')
ON CONFLICT (content, category_id) DO NOTHING;

-- Optional: Verify insertion (adjust count based on potential pre-existing duplicates)
-- SELECT level, COUNT(*) FROM daily_questions WHERE category_id = 'dd75f035-2110-465c-981a-ea05727da1de' GROUP BY level;