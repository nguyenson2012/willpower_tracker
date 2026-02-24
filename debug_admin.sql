-- Check current user profiles and set admin role for testing
SELECT * FROM user_profiles;

-- If you need to set a user as admin, replace 'YOUR_USER_ID' with the actual user ID
-- INSERT INTO user_profiles (id, role) VALUES ('YOUR_USER_ID', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Check user submitted videos
SELECT * FROM user_submitted_videos;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_submitted_videos';