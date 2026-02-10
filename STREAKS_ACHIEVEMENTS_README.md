# Streak Tracking & Achievements Implementation

## Summary
This implementation adds streak tracking and achievement functionality to the Sparq Connection app.

## Files Created

### Types
- `/frontend/src/types/streaks.ts` - Type definitions for streaks and achievements

### Hooks
- `/frontend/src/hooks/useStreaks.ts` - Hook for managing user streaks
- `/frontend/src/hooks/useAchievements.ts` - Hook for managing achievements

### Services
- `/frontend/src/services/supabase/StreakService.ts` - Service for streak operations
- `/frontend/src/services/supabase/AchievementService.ts` - Service for achievement operations

### Components
- `/frontend/src/components/StreakIndicator.tsx` - Displays current streak with fire icon
- `/frontend/src/components/AchievementBadge.tsx` - Badge component for individual achievements

### Pages
- `/frontend/src/pages/Achievements.tsx` - Full achievements page with categories and progress

### Database
- `/database/create_streaks_achievements_tables.sql` - Migration for user_streaks and achievements tables

## Files Modified

### Services Index
- `/frontend/src/services/supabase/index.ts` - Added exports for StreakService and AchievementService

### App.tsx
- Added route for `/achievements`
- Imported Achievements page

### Dashboard.tsx
- Added StreakIndicator component
- Added link to Achievements page
- Integrated useStreaks hook

### DailyQuestions.tsx
- Added StreakIndicator with celebration animation
- Added achievement checking after answer submission
- Integrated useStreaks and useAchievements hooks

### Supabase Types
- `/frontend/src/types/supabase.ts` - Added user_streaks table definition
- `/frontend/src/integrations/supabase/types.ts` - Copied types file (was empty)

## Achievement Definitions

### Streaks Category
1. **Week Warrior** (7-day streak) - `week_warrior`
2. **Fortnight Champion** (14-day streak) - `fortnight_champion`

### Completions Category
1. **First Step** (complete first session) - `first_step`
2. **Phase Explorer** (complete a phase) - `phase_explorer`

### Engagement Category
1. **Mirror Gazer** (view Day 14 narrative) - `mirror_gazer`
2. **Sharer** (share first answer with partner) - `sharer`

## Database Schema

### user_streaks table
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `current_streak` (integer)
- `longest_streak` (integer)
- `last_activity_date` (timestamp)
- `streak_start_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### achievements table
- `id` (text, primary key - achievement identifier)
- `user_id` (uuid, references auth.users)
- `title` (text)
- `description` (text)
- `icon` (text)
- `type` (text - category)
- `awarded_at` (timestamp)
- `created_at` (timestamp)

## Testing Instructions

### Manual Testing

1. **Run the database migration:**
   ```sql
   -- Execute in Supabase SQL Editor
   \i database/create_streaks_achievements_tables.sql
   ```

2. **Insert test streak data:**
   ```sql
   INSERT INTO public.user_streaks (
     user_id, 
     current_streak, 
     longest_streak, 
     last_activity_date,
     streak_start_date
   ) VALUES (
     'your-user-id',
     5,
     10,
     NOW() - INTERVAL '1 day',
     NOW() - INTERVAL '5 days'
   );
   ```

3. **Insert test achievement data:**
   ```sql
   INSERT INTO public.achievements (
     id,
     user_id,
     title,
     description,
     icon,
     type,
     awarded_at
   ) VALUES (
     'first_step',
     'your-user-id',
     'First Step',
     'Complete your first session',
     'footprints',
     'completions',
     NOW()
   );
   ```

4. **View the Dashboard:**
   - Streak indicator should show "5 Days" with fire icon
   - "Best: 10" should show longest streak
   - Click "Achievements" button to view full page

5. **Test Daily Questions:**
   - Submit an answer
   - Streak should update (if it's a new day)
   - Achievement toast should appear if criteria met

### Trigger Points

1. **After session completion** (DailyQuestions.tsx):
   - Updates streak
   - Checks for "First Step" achievement
   - Checks streak-based achievements

2. **After streak update**:
   - Shows celebration animation
   - Triggers Week Warrior / Fortnight Champion achievements

3. **After Day 14 narrative viewed**:
   - TODO: Add trigger in JourneyDay page when day 14 is viewed

## Known Limitations

1. Day 14 narrative achievement trigger needs to be implemented in the JourneyDay component
2. Sharer achievement needs integration with partner sharing functionality
3. Phase Explorer achievement needs phase completion tracking

## Future Enhancements

1. Add more achievement categories (social, exploration, etc.)
2. Add achievement sharing to social media
3. Add streak freeze/break recovery options
4. Add weekly/monthly streak summaries
5. Add push notifications for streak maintenance
