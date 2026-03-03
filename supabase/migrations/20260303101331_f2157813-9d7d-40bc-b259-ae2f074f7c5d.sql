-- Allow drivers to update their own duty_status
CREATE POLICY "Drivers can update own duty status"
ON public.drivers
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());