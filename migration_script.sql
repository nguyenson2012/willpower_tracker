-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/kzjqqivicqhllfvullte/sql

-- Add role column to auth.users using user_metadata
-- Since we can't modify auth.users directly, we'll create a profiles table instead

-- Create user_profiles table to extend user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Create motivation_videos table for admin to manage videos
CREATE TABLE IF NOT EXISTS public.motivation_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.motivation_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for motivation_videos
DROP POLICY IF EXISTS "Anyone can view active motivation videos" ON public.motivation_videos;
CREATE POLICY "Anyone can view active motivation videos"
ON public.motivation_videos FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert motivation videos" ON public.motivation_videos;
CREATE POLICY "Admins can insert motivation videos"
ON public.motivation_videos FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update motivation videos" ON public.motivation_videos;
CREATE POLICY "Admins can update motivation videos"
ON public.motivation_videos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete motivation videos" ON public.motivation_videos;
CREATE POLICY "Admins can delete motivation videos"
ON public.motivation_videos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on motivation_videos
DROP TRIGGER IF EXISTS update_motivation_videos_updated_at ON public.motivation_videos;
CREATE TRIGGER update_motivation_videos_updated_at
BEFORE UPDATE ON public.motivation_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users (if any)
INSERT INTO public.user_profiles (id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Update the first user to be admin (replace with your actual user ID)
-- You can find your user ID by running: SELECT id, email FROM auth.users;
-- UPDATE public.user_profiles SET role = 'admin' WHERE id = 'your-user-id-here';