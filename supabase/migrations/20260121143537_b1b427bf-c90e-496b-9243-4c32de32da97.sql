-- Actualizar política de INSERT para permitir resultados de hasta 30 días atrás
DROP POLICY IF EXISTS "Allow insert recent results" ON public.lottery_results;

CREATE POLICY "Allow insert recent results" 
ON public.lottery_results 
FOR INSERT 
WITH CHECK (draw_date >= (CURRENT_DATE - '30 days'::interval));

-- Actualizar política de UPDATE para permitir editar resultados de hasta 30 días atrás
DROP POLICY IF EXISTS "Allow update recent results" ON public.lottery_results;

CREATE POLICY "Allow update recent results" 
ON public.lottery_results 
FOR UPDATE 
USING (draw_date >= (CURRENT_DATE - '30 days'::interval));

-- Actualizar política de DELETE para permitir eliminar resultados de hasta 7 días atrás
DROP POLICY IF EXISTS "Allow delete today results" ON public.lottery_results;

CREATE POLICY "Allow delete recent results" 
ON public.lottery_results 
FOR DELETE 
USING (draw_date >= (CURRENT_DATE - '7 days'::interval));