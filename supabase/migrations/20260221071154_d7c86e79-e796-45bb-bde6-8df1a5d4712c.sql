
-- Add video_url column to exercises table
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS video_url text;

-- Add category and body_part columns for better organization
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS body_part text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url text;
