-- Create user_submitted_videos table for users to submit videos for admin review
CREATE TABLE public.user_submitted_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_submitted_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_submitted_videos

-- Users can view their own submitted videos
CREATE POLICY "Users can view their own submitted videos"
ON public.user_submitted_videos FOR SELECT
USING (auth.uid() = submitted_by);

-- Admins can view all submitted videos
CREATE POLICY "Admins can view all submitted videos"
ON public.user_submitted_videos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can insert their own video submissions
CREATE POLICY "Users can submit videos"
ON public.user_submitted_videos FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

-- Admins can update submitted videos (for approval/rejection)
CREATE POLICY "Admins can update submitted videos"
ON public.user_submitted_videos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at on user_submitted_videos
CREATE TRIGGER update_user_submitted_videos_updated_at
BEFORE UPDATE ON public.user_submitted_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to move approved videos to motivation_videos table
CREATE OR REPLACE FUNCTION public.approve_user_video(submission_id UUID, admin_id UUID)
RETURNS VOID AS $$
DECLARE
  video_record RECORD;
BEGIN
  -- Get the submission details
  SELECT * FROM public.user_submitted_videos 
  WHERE id = submission_id AND status = 'pending'
  INTO video_record;
  
  IF video_record IS NULL THEN
    RAISE EXCEPTION 'Video submission not found or already processed';
  END IF;
  
  -- Insert into motivation_videos
  INSERT INTO public.motivation_videos (title, video_url, description, created_by, is_active)
  VALUES (video_record.title, video_record.video_url, video_record.description, video_record.submitted_by, true);
  
  -- Update submission status
  UPDATE public.user_submitted_videos 
  SET status = 'approved', 
      reviewed_by = admin_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to reject user video
CREATE OR REPLACE FUNCTION public.reject_user_video(submission_id UUID, admin_id UUID, reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_submitted_videos 
  SET status = 'rejected',
      reviewed_by = admin_id,
      reviewed_at = now(),
      rejection_reason = reason,
      updated_at = now()
  WHERE id = submission_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Video submission not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;