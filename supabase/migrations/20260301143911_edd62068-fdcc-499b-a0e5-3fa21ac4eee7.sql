CREATE TABLE IF NOT EXISTS public.admin_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_type text NOT NULL,
  pick_type text NOT NULL DEFAULT 'explosivo',
  animal_code text NOT NULL,
  animal_name text,
  notes text,
  pick_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read admin picks" ON public.admin_picks FOR SELECT USING (true);
CREATE POLICY "Allow insert admin picks" ON public.admin_picks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update admin picks" ON public.admin_picks FOR UPDATE USING (true);
CREATE POLICY "Allow delete admin picks" ON public.admin_picks FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_picks;