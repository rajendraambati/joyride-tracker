
-- Add enrollment_status to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_status text NOT NULL DEFAULT 'active';
-- Possible values: active, graduated, transferred, left
