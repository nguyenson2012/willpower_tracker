-- Create a function to get user submitted videos for admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_submitted_videos_for_admin()
RETURNS TABLE (
  id UUID,
  title TEXT,
  video_url TEXT,
  description TEXT,
  status TEXT,
  submitted_by UUID,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
) 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if the current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY 
  SELECT 
    usv.id,
    usv.title,
    usv.video_url,
    usv.description,
    usv.status,
    usv.submitted_by,
    usv.reviewed_by,
    usv.rejection_reason,
    usv.created_at,
    usv.updated_at,
    usv.reviewed_at
  FROM public.user_submitted_videos usv
  ORDER BY usv.created_at DESC;
END;
$$ LANGUAGE plpgsql;