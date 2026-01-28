-- =============================================
-- COMPREHENSIVE SYSTEM UPGRADE MIGRATION
-- Bot Memory, Learning State, TOP 3 Stability
-- =============================================

-- 1. Create bot_memory table for persistent chatbot memory
CREATE TABLE IF NOT EXISTS public.bot_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    role TEXT NOT NULL DEFAULT 'system',
    content TEXT NOT NULL,
    memory_type TEXT DEFAULT 'instruction', -- 'instruction', 'learning', 'preference'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bot_memory
ALTER TABLE public.bot_memory ENABLE ROW LEVEL SECURITY;

-- Only admins can write, everyone can read active memories
CREATE POLICY "Allow read active bot memories"
ON public.bot_memory
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow admin insert bot memories"
ON public.bot_memory
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin update bot memories"
ON public.bot_memory
FOR UPDATE
USING (true);

-- 2. Create learning_state table for persistent hypothesis tracking
CREATE TABLE IF NOT EXISTS public.learning_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id TEXT NOT NULL,
    hypothesis_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL,
    weight NUMERIC DEFAULT 0.5,
    hits INTEGER DEFAULT 0,
    misses INTEGER DEFAULT 0,
    hit_rate NUMERIC DEFAULT 0,
    baseline_chance NUMERIC DEFAULT 0.027,
    status TEXT DEFAULT 'active', -- 'active', 'penalized', 'deactivated', 'reactivated'
    consecutive_below_chance INTEGER DEFAULT 0,
    last_evaluated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(lottery_id, hypothesis_id)
);

-- Enable RLS on learning_state
ALTER TABLE public.learning_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read learning state"
ON public.learning_state
FOR SELECT
USING (true);

CREATE POLICY "Allow insert learning state"
ON public.learning_state
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update learning state"
ON public.learning_state
FOR UPDATE
USING (true);

-- 3. Create top3_cache table for stable TOP 3 predictions
CREATE TABLE IF NOT EXISTS public.top3_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id TEXT NOT NULL,
    cache_date DATE NOT NULL DEFAULT CURRENT_DATE,
    top3_numbers JSONB NOT NULL,
    last_recalculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    recalculation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(lottery_id, cache_date)
);

-- Enable RLS on top3_cache
ALTER TABLE public.top3_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read top3 cache"
ON public.top3_cache
FOR SELECT
USING (true);

CREATE POLICY "Allow insert top3 cache"
ON public.top3_cache
FOR INSERT
WITH CHECK (cache_date = CURRENT_DATE);

CREATE POLICY "Allow update today top3 cache"
ON public.top3_cache
FOR UPDATE
USING (cache_date = CURRENT_DATE);

-- 4. Create learning_records table for tracking daily learning
CREATE TABLE IF NOT EXISTS public.learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_date DATE NOT NULL,
    lottery_id TEXT NOT NULL,
    draw_time TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    hit_patterns TEXT[] DEFAULT '{}',
    miss_patterns TEXT[] DEFAULT '{}',
    processed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(learning_date, lottery_id, draw_time)
);

-- Enable RLS on learning_records
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read learning records"
ON public.learning_records
FOR SELECT
USING (true);

CREATE POLICY "Allow insert learning records"
ON public.learning_records
FOR INSERT
WITH CHECK (true);

-- 5. Create learning_meta table for tracking overall learning state
CREATE TABLE IF NOT EXISTS public.learning_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_processed_date DATE,
    consecutive_days_learning INTEGER DEFAULT 0,
    total_days_learned INTEGER DEFAULT 0,
    last_hit_date DATE,
    start_date DATE DEFAULT '2026-01-02',
    gaps_detected INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on learning_meta
ALTER TABLE public.learning_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read learning meta"
ON public.learning_meta
FOR SELECT
USING (true);

CREATE POLICY "Allow upsert learning meta"
ON public.learning_meta
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update learning meta"
ON public.learning_meta
FOR UPDATE
USING (true);

-- Insert default learning meta row
INSERT INTO public.learning_meta (start_date, last_processed_date, consecutive_days_learning, total_days_learned)
VALUES ('2026-01-02', NULL, 0, 0)
ON CONFLICT DO NOTHING;

-- 6. Add index for performance
CREATE INDEX IF NOT EXISTS idx_learning_records_date ON public.learning_records(learning_date);
CREATE INDEX IF NOT EXISTS idx_learning_state_lottery ON public.learning_state(lottery_id);
CREATE INDEX IF NOT EXISTS idx_top3_cache_date ON public.top3_cache(cache_date);
CREATE INDEX IF NOT EXISTS idx_bot_memory_type ON public.bot_memory(memory_type);