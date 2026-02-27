
-- Create drowsiness alerts table
CREATE TABLE public.drowsiness_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal', -- normal, warning, alert
  left_eye TEXT NOT NULL DEFAULT 'open', -- open, closed
  right_eye TEXT NOT NULL DEFAULT 'open', -- open, closed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drowsiness_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can read all alerts
CREATE POLICY "Admins can read all drowsiness alerts"
  ON public.drowsiness_alerts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Drivers can read own alerts
CREATE POLICY "Drivers can read own drowsiness alerts"
  ON public.drowsiness_alerts FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Allow insert without auth (from edge function with service role)
CREATE POLICY "Service can insert drowsiness alerts"
  ON public.drowsiness_alerts FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.drowsiness_alerts;
