# Daily Discipline - Admin Features Setup

## New Features Added

### 1. User Roles System
- Added `user_profiles` table to manage user roles (admin/user)
- Automatic profile creation for new users
- Admin badge display in the header

### 2. Motivation Videos System
- **Admin Page**: Dedicated `/admin/videos` page for video management
- **Homepage Display**: Simple video list below inspiration quote
- **Video Management**: Admin can add/edit/delete videos with full interface
- **User Experience**: All users see clickable video links and can play videos

## Database Setup Required

**IMPORTANT**: You need to run the SQL migration to add the new tables and features.

### Steps:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/kzjqqivicqhllfvullte/sql

2. Copy and paste the contents of `migration_script.sql` into the SQL Editor

3. Click "Run" to execute the migration

4. Find your user ID to make yourself an admin:
   ```sql
   SELECT id, email FROM auth.users;
   ```

5. Update your user to be admin:
   ```sql
   UPDATE public.user_profiles SET role = 'admin' WHERE id = 'your-user-id-here';
   ```

## New Layout & User Experience

### Homepage (Dashboard)
- **Calendar**: Centered layout (back to original design)
- **Inspiration Quote**: Below the calendar
- **Video List**: Simple list of videos below inspiration quote
  - Shows video thumbnails and titles
  - Click play button to watch in modal
  - Click external link to open on YouTube

### Admin Features
- **Admin Badge**: Visible in header for admin users
- **"Manage Videos" Button**: Links to dedicated admin page
- **Admin Videos Page** (`/admin/videos`):
  - Full video management interface
  - Add new videos with title, URL, description
  - Edit existing videos
  - Toggle video active/inactive status
  - Delete videos
  - View video thumbnails and creation dates

## File Structure

```
src/
├── hooks/
│   ├── useUserProfile.ts      # User profile management
│   └── useMotivationVideos.ts # Video CRUD operations
├── components/
│   └── VideoList.tsx          # Simple video list for homepage
├── pages/
│   ├── Dashboard.tsx          # Updated with centered layout + video list
│   └── AdminVideos.tsx        # Dedicated admin video management page
```

## Features Overview

### For Regular Users:
- View calendar in centered layout
- Read daily inspiration quotes
- See list of motivation videos below quotes
- Click any video to watch in full screen modal
- Open videos directly on YouTube

### For Admin Users:
- All regular user features PLUS:
- Admin badge in header
- "Manage Videos" button in header
- Access to `/admin/videos` page with:
  - Add unlimited videos
  - Full video management interface
  - Video status control (active/inactive)
  - Video analytics (creation dates, etc.)

## YouTube Integration

The app automatically extracts video IDs from YouTube URLs and:
- Shows thumbnail previews in both lists and admin interface
- Embeds videos for in-app playback
- Handles both `youtube.com/watch?v=` and `youtu.be/` formats
- Provides external links to original YouTube videos

## Security

- Row Level Security (RLS) policies ensure only admins can modify videos
- Admin page automatically redirects non-admin users
- User profiles are protected by RLS
- Videos are only visible when marked as active

## Routes

- `/` or `/dashboard` - Main dashboard with calendar and video list
- `/admin/videos` - Admin-only video management page (auto-redirects non-admins)
- `/auth` - Authentication page

## Next Steps

1. Run the database migration from `migration_script.sql`
2. Set your user as admin using the SQL commands above
3. Visit the app at http://localhost:8080/
4. Click "Manage Videos" to access the admin interface
5. Add your first motivation videos
6. Test the user experience by viewing videos on the homepage

The new design provides a clean separation between admin management and user experience, with videos prominently displayed below the inspiration quotes for maximum motivational impact!