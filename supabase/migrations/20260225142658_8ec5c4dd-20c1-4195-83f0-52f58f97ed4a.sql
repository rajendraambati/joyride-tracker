
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
-- Only allow the trigger (security definer) to insert; no direct client inserts needed
-- The trigger runs as SECURITY DEFINER so it bypasses RLS
