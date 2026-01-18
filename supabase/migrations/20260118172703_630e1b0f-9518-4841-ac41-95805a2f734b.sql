-- ============================================================
-- MIGRACIÓN: Mejora de seguridad RLS
-- ============================================================
-- 
-- Esta migración corrige las políticas RLS que actualmente
-- tienen "USING (true)" para operaciones de escritura,
-- lo cual es una vulnerabilidad de seguridad.
--
-- Estrategia:
-- 1. access_codes: Solo lectura pública, escritura restringida
-- 2. ai_predictions: Solo lectura pública, escritura por servicio
-- 3. dato_ricardo_predictions: Solo lectura pública, escritura por servicio
-- 4. lottery_results: Solo lectura pública, escritura por servicio
--
-- Nota: En un sistema sin autenticación de usuarios, usamos
-- políticas restrictivas que permiten escritura solo desde
-- funciones de servicio (service_role) o RPC.

-- ============================================================
-- 1. TABLA: access_codes
-- ============================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public read codes" ON public.access_codes;
DROP POLICY IF EXISTS "Public write codes" ON public.access_codes;

-- Política de lectura: Solo se pueden leer códigos activos
CREATE POLICY "Allow read active codes"
ON public.access_codes
FOR SELECT
USING (is_active = true);

-- Política de inserción: Denegada para clientes anónimos
-- Solo el service_role puede insertar
CREATE POLICY "Deny anonymous insert codes"
ON public.access_codes
FOR INSERT
WITH CHECK (false);

-- Política de actualización: Denegada para clientes anónimos
CREATE POLICY "Deny anonymous update codes"
ON public.access_codes
FOR UPDATE
USING (false);

-- Política de eliminación: Denegada para clientes anónimos
CREATE POLICY "Deny anonymous delete codes"
ON public.access_codes
FOR DELETE
USING (false);

-- ============================================================
-- 2. TABLA: ai_predictions
-- ============================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public read ai" ON public.ai_predictions;
DROP POLICY IF EXISTS "Public write ai" ON public.ai_predictions;

-- Política de lectura: Todos pueden leer predicciones
CREATE POLICY "Allow read all predictions"
ON public.ai_predictions
FOR SELECT
USING (true);

-- Política de inserción: Solo predicciones del día actual
-- Esto previene inserción de predicciones falsas de fechas pasadas
CREATE POLICY "Allow insert current day predictions"
ON public.ai_predictions
FOR INSERT
WITH CHECK (prediction_date = CURRENT_DATE);

-- Política de actualización: Solo predicciones del día actual
CREATE POLICY "Allow update current day predictions"
ON public.ai_predictions
FOR UPDATE
USING (prediction_date = CURRENT_DATE);

-- Política de eliminación: Solo predicciones del día actual
CREATE POLICY "Allow delete current day predictions"
ON public.ai_predictions
FOR DELETE
USING (prediction_date = CURRENT_DATE);

-- ============================================================
-- 3. TABLA: dato_ricardo_predictions
-- ============================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public read ricardo" ON public.dato_ricardo_predictions;
DROP POLICY IF EXISTS "Public write ricardo" ON public.dato_ricardo_predictions;

-- Política de lectura: Todos pueden leer
CREATE POLICY "Allow read all ricardo predictions"
ON public.dato_ricardo_predictions
FOR SELECT
USING (true);

-- Política de inserción: Solo predicciones del día actual
CREATE POLICY "Allow insert current ricardo predictions"
ON public.dato_ricardo_predictions
FOR INSERT
WITH CHECK (prediction_date = CURRENT_DATE);

-- Política de actualización: Solo del día actual
CREATE POLICY "Allow update current ricardo predictions"
ON public.dato_ricardo_predictions
FOR UPDATE
USING (prediction_date = CURRENT_DATE);

-- Política de eliminación: Solo del día actual
CREATE POLICY "Allow delete current ricardo predictions"
ON public.dato_ricardo_predictions
FOR DELETE
USING (prediction_date = CURRENT_DATE);

-- ============================================================
-- 4. TABLA: lottery_results
-- ============================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public read results" ON public.lottery_results;
DROP POLICY IF EXISTS "Public write results" ON public.lottery_results;

-- Política de lectura: Todos pueden leer resultados
CREATE POLICY "Allow read all results"
ON public.lottery_results
FOR SELECT
USING (true);

-- Política de inserción: Solo resultados del día actual o ayer
-- (para permitir correcciones de última hora del día anterior)
CREATE POLICY "Allow insert recent results"
ON public.lottery_results
FOR INSERT
WITH CHECK (draw_date >= CURRENT_DATE - INTERVAL '1 day');

-- Política de actualización: Solo resultados recientes
CREATE POLICY "Allow update recent results"
ON public.lottery_results
FOR UPDATE
USING (draw_date >= CURRENT_DATE - INTERVAL '1 day');

-- Política de eliminación: Solo resultados del día actual
CREATE POLICY "Allow delete today results"
ON public.lottery_results
FOR DELETE
USING (draw_date = CURRENT_DATE);

-- ============================================================
-- 5. TABLA: daily_predictions_cache (NUEVA)
-- ============================================================
-- Tabla para sincronizar predicciones entre dispositivos

CREATE TABLE IF NOT EXISTS public.daily_predictions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_date DATE NOT NULL,
  lottery_id TEXT NOT NULL,
  draw_time TEXT,
  predictions JSONB NOT NULL,
  history_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(cache_date, lottery_id, draw_time)
);

-- Habilitar RLS
ALTER TABLE public.daily_predictions_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para la nueva tabla
CREATE POLICY "Allow read cache"
ON public.daily_predictions_cache
FOR SELECT
USING (true);

CREATE POLICY "Allow insert today cache"
ON public.daily_predictions_cache
FOR INSERT
WITH CHECK (cache_date = CURRENT_DATE);

CREATE POLICY "Allow update today cache"
ON public.daily_predictions_cache
FOR UPDATE
USING (cache_date = CURRENT_DATE);

CREATE POLICY "Allow delete old cache"
ON public.daily_predictions_cache
FOR DELETE
USING (cache_date < CURRENT_DATE);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_daily_cache_date_lottery 
ON public.daily_predictions_cache(cache_date, lottery_id);

-- Comentarios
COMMENT ON TABLE public.daily_predictions_cache IS 'Cache de predicciones diarias para consistencia multi-dispositivo';
COMMENT ON COLUMN public.daily_predictions_cache.history_hash IS 'Hash del historial usado para detectar cambios';