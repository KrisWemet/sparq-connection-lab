-- Create a profile for the user with ID 81e1110a-0075-4674-b600-d7480fb455a3
INSERT INTO profiles (
  id, 
  name,
  email, 
  avatar_url,
  partner_id,
  partner_code,
  created_at,
  updated_at,
  isonboarded,
  relationship_level,
  relationship_points,
  streak_count,
  last_daily_activity
) VALUES (
  '81e1110a-0075-4674-b600-d7480fb455a3', 
  'Chris O',
  'kris.wemet81@gmail.com', 
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW(),
  true,
  'beginner',
  0,
  0,
  NULL
)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW(),
  isonboarded = EXCLUDED.isonboarded; 