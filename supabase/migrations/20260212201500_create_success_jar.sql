
-- Create success_jar table for storing achievements and successes
CREATE TABLE IF NOT EXISTS public.success_jar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.success_jar ENABLE ROW LEVEL SECURITY;

-- RLS policies for success_jar
DROP POLICY IF EXISTS "Users can view their own success items" ON public.success_jar;
CREATE POLICY "Users can view their own success items"
ON public.success_jar FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own success items" ON public.success_jar;
CREATE POLICY "Users can insert their own success items"
ON public.success_jar FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own success items" ON public.success_jar;
CREATE POLICY "Users can delete their own success items"
ON public.success_jar FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_success_jar_updated_at ON public.success_jar;
CREATE TRIGGER update_success_jar_updated_at
BEFORE UPDATE ON public.success_jar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
