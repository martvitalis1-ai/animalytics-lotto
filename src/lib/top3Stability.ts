// ============================================================
// TOP 3 STABILITY SYSTEM - Database-cached stable predictions
// TOP 3 only changes on daily retraining or significant evidence
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { AdvancedPrediction, getExplosivePredictions } from './advancedProbability';

export interface CachedTop3 {
  lottery_id: string;
  cache_date: string;
  top3_numbers: AdvancedPrediction[];
  last_recalculated: string;
  recalculation_reason: string | null;
}

// Get stable TOP 3 from cache or calculate if needed
export const getStableTop3 = async (
  lotteryId: string,
  history: any[],
  forceRecalculate: boolean = false,
  reason?: string
): Promise<AdvancedPrediction[]> => {
  const today = new Date().toISOString().split('T')[0];

  // Check cache first
  if (!forceRecalculate) {
    const { data: cached } = await supabase
      .from('top3_cache')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('cache_date', today)
      .maybeSingle();

    if (cached) {
      // Return cached TOP 3 - ensure stability
      const cachedPredictions = cached.top3_numbers as unknown as AdvancedPrediction[];
      if (Array.isArray(cachedPredictions) && cachedPredictions.length >= 3) {
        return cachedPredictions;
      }
    }
  }

  // Calculate new TOP 3
  const newTop3 = getExplosivePredictions(lotteryId, history, today, 3);

  // Save to cache
  try {
    await supabase.from('top3_cache').upsert(
      {
        lottery_id: lotteryId,
        cache_date: today,
        top3_numbers: newTop3 as unknown as any,
        last_recalculated: new Date().toISOString(),
        recalculation_reason: reason || (forceRecalculate ? 'forced' : 'initial'),
      },
      { onConflict: 'lottery_id,cache_date' }
    );
  } catch (e) {
    console.error('Error caching TOP 3:', e);
  }

  return newTop3;
};

// Check if TOP 3 should be recalculated
export const shouldRecalculateTop3 = async (
  lotteryId: string,
  latestResultTime: string
): Promise<{ shouldRecalculate: boolean; reason: string }> => {
  const today = new Date().toISOString().split('T')[0];

  const { data: cached } = await supabase
    .from('top3_cache')
    .select('last_recalculated')
    .eq('lottery_id', lotteryId)
    .eq('cache_date', today)
    .maybeSingle();

  if (!cached) {
    return { shouldRecalculate: true, reason: 'no_cache' };
  }

  const lastRecalc = new Date(cached.last_recalculated);
  const now = new Date();

  // Check if it's after 8 PM and we haven't recalculated today after 8 PM
  const eightPM = new Date(today);
  eightPM.setHours(20, 0, 0, 0);

  if (now >= eightPM && lastRecalc < eightPM) {
    return { shouldRecalculate: true, reason: 'daily_retraining_8pm' };
  }

  // Check if there's a new result after last recalculation
  if (latestResultTime && new Date(latestResultTime) > lastRecalc) {
    return { shouldRecalculate: true, reason: 'new_result_available' };
  }

  return { shouldRecalculate: false, reason: 'cache_valid' };
};

// Force daily recalculation (called at 8 PM or first access after)
export const triggerDailyRetraining = async (
  lotteryId: string,
  history: any[]
): Promise<AdvancedPrediction[]> => {
  return getStableTop3(lotteryId, history, true, 'daily_retraining_8pm');
};

// Get cache status message for internal use
export const getTop3CacheStatus = async (lotteryId: string): Promise<string> => {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('top3_cache')
    .select('last_recalculated, recalculation_reason')
    .eq('lottery_id', lotteryId)
    .eq('cache_date', today)
    .maybeSingle();

  if (!data) {
    return 'Sin caché - se calculará al cargar';
  }

  const lastRecalc = new Date(data.last_recalculated);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastRecalc.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `TOP 3 estable. Calculado hace ${diffMinutes} min. Razón: ${data.recalculation_reason}`;
  }

  return `TOP 3 estable. Sin evidencia suficiente para modificación.`;
};
