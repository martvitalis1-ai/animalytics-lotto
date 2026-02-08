-- Create storage bucket for roulette maps
INSERT INTO storage.buckets (id, name, public) VALUES ('roulette-maps', 'roulette-maps', true);

-- Create RLS policies for roulette maps
CREATE POLICY "Anyone can view roulette maps"
ON storage.objects
FOR SELECT
USING (bucket_id = 'roulette-maps');

CREATE POLICY "Admins can upload roulette maps"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'roulette-maps');

CREATE POLICY "Admins can update roulette maps"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'roulette-maps');

CREATE POLICY "Admins can delete roulette maps"
ON storage.objects
FOR DELETE
USING (bucket_id = 'roulette-maps');