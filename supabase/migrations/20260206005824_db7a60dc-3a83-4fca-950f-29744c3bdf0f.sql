-- Add unique constraint to prevent duplicate results from scraper
-- Constraint on (lottery_type, draw_date, draw_time)
ALTER TABLE public.lottery_results
ADD CONSTRAINT lottery_results_unique_draw UNIQUE (lottery_type, draw_date, draw_time);

-- Enable realtime for lottery_results table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_results;