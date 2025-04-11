-- Seed initial data for the 'Adventure & Fun' Daily Question category

DO $$
DECLARE
    adventure_fun_category_id uuid;
BEGIN
    -- 1. Get the Category ID (assuming it was inserted in an earlier migration)
    SELECT id INTO adventure_fun_category_id
    FROM daily_question_categories
    WHERE name = 'Adventure & Fun' LIMIT 1;

    -- 2. Insert Light Questions (Position 1-10)
    INSERT INTO daily_questions (category_id, level, position, question_text) VALUES
    (adventure_fun_category_id, 'Light', 1, 'What''s one silly thing we did that still makes you laugh?'),
    (adventure_fun_category_id, 'Light', 2, 'What''s a tiny new adventure you''d love us to try this week?'),
    (adventure_fun_category_id, 'Light', 3, 'If our fun moments were a movie, what genre would they be?'),
    (adventure_fun_category_id, 'Light', 4, 'What''s a goofy memory where everything went wrong — but now we laugh about it?'),
    (adventure_fun_category_id, 'Light', 5, 'What''s a "bucket list" thing you''d try with me, even if it’s ridiculous?'),
    (adventure_fun_category_id, 'Light', 6, 'What''s a place nearby you''d love to explore with me?'),
    (adventure_fun_category_id, 'Light', 7, 'What''s a time we turned a boring day into something special?'),
    (adventure_fun_category_id, 'Light', 8, 'What''s a funny hobby you think we should try together?'),
    (adventure_fun_category_id, 'Light', 9, 'What''s a "secret spot" you’d love to make ours?'),
    (adventure_fun_category_id, 'Light', 10, 'What''s a spontaneous choice we made that became a favorite memory?');

    -- 3. Insert Medium Questions (Position 11-25)
    INSERT INTO daily_questions (category_id, level, position, question_text) VALUES
    (adventure_fun_category_id, 'Medium', 11, 'What''s a fear you''d face if I promised to stay by your side?'),
    (adventure_fun_category_id, 'Medium', 12, 'What’s a trip we took that changed how you see us?'),
    (adventure_fun_category_id, 'Medium', 13, 'What’s an adventure that didn’t go as planned, but taught us something?'),
    (adventure_fun_category_id, 'Medium', 14, 'What''s a place you''d revisit with me just to feel the magic again?'),
    (adventure_fun_category_id, 'Medium', 15, 'What''s a dream trip you haven''t shared with me yet?'),
    (adventure_fun_category_id, 'Medium', 16, 'If our adventures had a theme song, what would it be?'),
    (adventure_fun_category_id, 'Medium', 17, 'What''s a time we got lost but found something better than we planned?'),
    (adventure_fun_category_id, 'Medium', 18, 'What''s a "tiny thrill" you want to share with me soon (like singing karaoke)?'),
    (adventure_fun_category_id, 'Medium', 19, 'What''s a memory that made you feel young and free again?'),
    (adventure_fun_category_id, 'Medium', 20, 'If we could move anywhere and start fresh, where would it be?'),
    (adventure_fun_category_id, 'Medium', 21, 'What''s a risk you''d take with me that you''d never do alone?'),
    (adventure_fun_category_id, 'Medium', 22, 'When have we surprised ourselves by being braver together?'),
    (adventure_fun_category_id, 'Medium', 23, 'What''s a "dream day" you imagine for just the two of us?'),
    (adventure_fun_category_id, 'Medium', 24, 'What''s a place you''re scared to suggest, but secretly want to?'),
    (adventure_fun_category_id, 'Medium', 25, 'When have we felt like we were the only two people in the world?');

    -- 4. Insert Deep Questions (Position 26-50)
    INSERT INTO daily_questions (category_id, level, position, question_text) VALUES
    (adventure_fun_category_id, 'Deep', 26, 'What''s a trip we took that felt like a mirror of our relationship?'),
    (adventure_fun_category_id, 'Deep', 27, 'What''s a "what if" adventure you''ve dreamed about but never shared?'),
    (adventure_fun_category_id, 'Deep', 28, 'When did we turn a mess into a memory we’ll tell forever?'),
    (adventure_fun_category_id, 'Deep', 29, 'Where would you love to get stuck with me — and why?'),
    (adventure_fun_category_id, 'Deep', 30, 'What''s a dream you''d chase with me even if it meant big changes?'),
    (adventure_fun_category_id, 'Deep', 31, 'What''s a fear you''d laugh through if I was by your side?'),
    (adventure_fun_category_id, 'Deep', 32, 'What''s a time we felt completely free together?'),
    (adventure_fun_category_id, 'Deep', 33, 'What''s a "secret mission" you''d love us to complete someday?'),
    (adventure_fun_category_id, 'Deep', 34, 'What''s a place you’d take me to show me a part of your soul?'),
    (adventure_fun_category_id, 'Deep', 35, 'What''s a dream adventure you secretly want more than anything?'),
    (adventure_fun_category_id, 'Deep', 36, 'When have we felt like explorers discovering a new world?'),
    (adventure_fun_category_id, 'Deep', 37, 'What''s a "what if" scenario you wish we could live out for a day?'),
    (adventure_fun_category_id, 'Deep', 38, 'When did it feel like we were writing our own fairy tale?'),
    (adventure_fun_category_id, 'Deep', 39, 'What''s a place where you dream we could build a life together?'),
    (adventure_fun_category_id, 'Deep', 40, 'What''s a dream you''d chase with me even if it was risky?'),
    (adventure_fun_category_id, 'Deep', 41, 'When did it feel like we were breaking the rules... in the best way?'),
    (adventure_fun_category_id, 'Deep', 42, 'What''s a place you’d take me to help heal a piece of your past?'),
    (adventure_fun_category_id, 'Deep', 43, 'What''s a dream adventure you’re scared to admit you need?'),
    (adventure_fun_category_id, 'Deep', 44, 'When have we felt like the heroes of our own story?'),
    (adventure_fun_category_id, 'Deep', 45, 'What''s a place you’re scared to suggest but your heart wants to?'),
    (adventure_fun_category_id, 'Deep', 46, 'When did it feel like we touched something sacred together?'),
    (adventure_fun_category_id, 'Deep', 47, 'What''s a dream you''d chase with me even if it meant leaving old parts behind?'),
    (adventure_fun_category_id, 'Deep', 48, 'What''s a place you’d take me to show your hidden dreams?'),
    (adventure_fun_category_id, 'Deep', 49, 'When did it feel like we were writing a love story only we could understand?'),
    (adventure_fun_category_id, 'Deep', 50, 'What''s a dream adventure you''d chase with me — no matter the risk?');

    -- 5. Insert Mini-Challenges
    INSERT INTO mini_challenges (category_id, challenge_text) VALUES
    (adventure_fun_category_id, 'Dream Day Collage: Each of you draw or collage your perfect day together — no rules, just fun.'),
    (adventure_fun_category_id, 'Secret Spot Hunt: Find a new favorite secret place (like a park, café, lookout) that’s just yours.'),
    (adventure_fun_category_id, 'Tiny Bucket List: Each write 1 dream adventure on a slip of paper. Choose one randomly to plan soon!'),
    (adventure_fun_category_id, 'Memory Jar: Each write one favorite memory and one future dream. Save them in a jar for later.'),
    (adventure_fun_category_id, 'Mini Adventure Dare: Pick a small "new first" (try a food, street, hobby) and do it together today.'),
    (adventure_fun_category_id, 'Surprise Playlist: Make a short playlist for each other that feels like your “adventure soundtrack.”'),
    (adventure_fun_category_id, 'First-Time Challenge: Do something neither of you has done before (even if it''s just trying a weird snack).');

END $$;