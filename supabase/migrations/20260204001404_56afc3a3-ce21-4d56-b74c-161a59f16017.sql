-- Table for user tracking logs (Mi Seguimiento)
CREATE TABLE public.user_tracking_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code TEXT NOT NULL,
  lottery_type TEXT NOT NULL,
  draw_time TEXT NOT NULL,
  draw_date DATE NOT NULL DEFAULT CURRENT_DATE,
  selected_number TEXT NOT NULL,
  animal_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_tracking_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since we use access codes, not auth)
CREATE POLICY "Allow read user tracking logs"
ON public.user_tracking_logs
FOR SELECT
USING (true);

CREATE POLICY "Allow insert user tracking logs"
ON public.user_tracking_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update user tracking logs"
ON public.user_tracking_logs
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete user tracking logs"
ON public.user_tracking_logs
FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_user_tracking_lottery ON public.user_tracking_logs(lottery_type);
CREATE INDEX idx_user_tracking_date ON public.user_tracking_logs(draw_date);
CREATE INDEX idx_user_tracking_user ON public.user_tracking_logs(user_code);