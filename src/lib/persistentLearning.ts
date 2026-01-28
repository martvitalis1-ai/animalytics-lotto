// ============================================================
// PERSISTENT LEARNING SYSTEM - Database-backed learning state
// Replaces localStorage with Supabase persistence
// Learning start date: 2026-01-02
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export const LEARNING_START_DATE = '2026-01-02';

export type HypothesisStatus = 'active' | 'penalized' | 'deactivated' | 'reactivated';

export interface PersistentHypothesis {
  id: string;
  lottery_id: string;
  hypothesis_id: string;
  pattern_type: string;
  weight: number;
  hits: number;
  misses: number;
  hit_rate: number;
  baseline_chance: number;
  status: HypothesisStatus;
  consecutive_below_chance: number;
  last_evaluated: string;
}

export interface LearningMeta {
  last_processed_date: string | null;
  consecutive_days_learning: number;
  total_days_learned: number;
  last_hit_date: string | null;
  start_date: string;
  gaps_detected: number[];
}

// Get or create hypothesis state from database
export const getHypothesisState = async (
  lotteryId: string,
  hypothesisId: string,
  patternType: string,
  baselineChance: number = 0.027
): Promise<PersistentHypothesis> => {
  const { data, error } = await supabase
    .from('learning_state')
    .select('*')
    .eq('lottery_id', lotteryId)
    .eq('hypothesis_id', hypothesisId)
    .maybeSingle();

  if (data) {
    return {
      id: data.id,
      lottery_id: data.lottery_id,
      hypothesis_id: data.hypothesis_id,
      pattern_type: data.pattern_type,
      weight: Number(data.weight) || 0.5,
      hits: data.hits || 0,
      misses: data.misses || 0,
      hit_rate: Number(data.hit_rate) || 0,
      baseline_chance: Number(data.baseline_chance) || baselineChance,
      status: (data.status as HypothesisStatus) || 'active',
      consecutive_below_chance: data.consecutive_below_chance || 0,
      last_evaluated: data.last_evaluated || new Date().toISOString(),
    };
  }

  // Create new hypothesis
  const newHypothesis: Omit<PersistentHypothesis, 'id'> = {
    lottery_id: lotteryId,
    hypothesis_id: hypothesisId,
    pattern_type: patternType,
    weight: 0.5,
    hits: 0,
    misses: 0,
    hit_rate: 0,
    baseline_chance: baselineChance,
    status: 'active',
    consecutive_below_chance: 0,
    last_evaluated: new Date().toISOString(),
  };

  const { data: inserted, error: insertError } = await supabase
    .from('learning_state')
    .insert({
      lottery_id: lotteryId,
      hypothesis_id: hypothesisId,
      pattern_type: patternType,
      weight: 0.5,
      baseline_chance: baselineChance,
    })
    .select()
    .single();

  if (inserted) {
    return { ...newHypothesis, id: inserted.id };
  }

  return { ...newHypothesis, id: crypto.randomUUID() };
};

// Update hypothesis after evaluation
export const updateHypothesisState = async (
  lotteryId: string,
  hypothesisId: string,
  isHit: boolean
): Promise<PersistentHypothesis | null> => {
  const { data: existing } = await supabase
    .from('learning_state')
    .select('*')
    .eq('lottery_id', lotteryId)
    .eq('hypothesis_id', hypothesisId)
    .maybeSingle();

  if (!existing) return null;

  let newHits = existing.hits || 0;
  let newMisses = existing.misses || 0;
  let newWeight = Number(existing.weight) || 0.5;
  let newStatus = existing.status || 'active';
  let newConsecutiveBelow = existing.consecutive_below_chance || 0;

  if (isHit) {
    newHits++;
    newConsecutiveBelow = 0;
    newWeight = Math.min(1.0, newWeight + 0.03);
    if (newStatus === 'deactivated' || newStatus === 'penalized') {
      newStatus = 'reactivated';
    }
  } else {
    newMisses++;
  }

  const total = newHits + newMisses;
  const newHitRate = total > 0 ? newHits / total : 0;
  const baseline = Number(existing.baseline_chance) || 0.027;

  // Compare to baseline after enough samples
  if (total >= 20) {
    if (newHitRate < baseline * 0.5) {
      newConsecutiveBelow++;
      newWeight = Math.max(0.05, newWeight - 0.05);
      if (newConsecutiveBelow >= 5) {
        newStatus = 'deactivated';
      } else if (newConsecutiveBelow >= 3) {
        newStatus = 'penalized';
      }
    } else if (newHitRate > baseline * 1.5) {
      newWeight = Math.min(1.0, newWeight + 0.02);
      newStatus = 'active';
      newConsecutiveBelow = 0;
    }
  }

  const { data: updated, error } = await supabase
    .from('learning_state')
    .update({
      hits: newHits,
      misses: newMisses,
      hit_rate: newHitRate,
      weight: newWeight,
      status: newStatus,
      consecutive_below_chance: newConsecutiveBelow,
      last_evaluated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lottery_id', lotteryId)
    .eq('hypothesis_id', hypothesisId)
    .select()
    .single();

  if (updated) {
    return {
      id: updated.id,
      lottery_id: updated.lottery_id,
      hypothesis_id: updated.hypothesis_id,
      pattern_type: updated.pattern_type,
      weight: Number(updated.weight),
      hits: updated.hits,
      misses: updated.misses,
      hit_rate: Number(updated.hit_rate),
      baseline_chance: Number(updated.baseline_chance),
      status: updated.status as HypothesisStatus,
      consecutive_below_chance: updated.consecutive_below_chance,
      last_evaluated: updated.last_evaluated,
    };
  }

  return null;
};

// Get all hypotheses for a lottery
export const getAllHypothesesForLottery = async (
  lotteryId: string
): Promise<PersistentHypothesis[]> => {
  const { data, error } = await supabase
    .from('learning_state')
    .select('*')
    .eq('lottery_id', lotteryId)
    .order('weight', { ascending: false });

  if (!data) return [];

  return data.map(d => ({
    id: d.id,
    lottery_id: d.lottery_id,
    hypothesis_id: d.hypothesis_id,
    pattern_type: d.pattern_type,
    weight: Number(d.weight) || 0.5,
    hits: d.hits || 0,
    misses: d.misses || 0,
    hit_rate: Number(d.hit_rate) || 0,
    baseline_chance: Number(d.baseline_chance) || 0.027,
    status: (d.status as HypothesisStatus) || 'active',
    consecutive_below_chance: d.consecutive_below_chance || 0,
    last_evaluated: d.last_evaluated || new Date().toISOString(),
  }));
};

// Get learning meta
export const getLearningMeta = async (): Promise<LearningMeta> => {
  const { data, error } = await supabase
    .from('learning_meta')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (data) {
    return {
      last_processed_date: data.last_processed_date,
      consecutive_days_learning: data.consecutive_days_learning || 0,
      total_days_learned: data.total_days_learned || 0,
      last_hit_date: data.last_hit_date,
      start_date: data.start_date || LEARNING_START_DATE,
      gaps_detected: data.gaps_detected || [],
    };
  }

  return {
    last_processed_date: null,
    consecutive_days_learning: 0,
    total_days_learned: 0,
    last_hit_date: null,
    start_date: LEARNING_START_DATE,
    gaps_detected: [],
  };
};

// Update learning meta
export const updateLearningMeta = async (
  updates: Partial<LearningMeta>
): Promise<void> => {
  const { data: existing } = await supabase
    .from('learning_meta')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('learning_meta')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('learning_meta').insert({
      start_date: LEARNING_START_DATE,
      ...updates,
    });
  }
};

// Record a learning result
export const recordLearningResult = async (
  learningDate: string,
  lotteryId: string,
  drawTime: string,
  actualResult: string,
  hitPatterns: string[],
  missPatterns: string[]
): Promise<boolean> => {
  const { error } = await supabase.from('learning_records').upsert(
    {
      learning_date: learningDate,
      lottery_id: lotteryId,
      draw_time: drawTime,
      actual_result: actualResult,
      hit_patterns: hitPatterns,
      miss_patterns: missPatterns,
      processed: true,
    },
    { onConflict: 'learning_date,lottery_id,draw_time' }
  );

  return !error;
};

// Check if a result was already processed
export const isResultProcessed = async (
  learningDate: string,
  lotteryId: string,
  drawTime: string
): Promise<boolean> => {
  const { data } = await supabase
    .from('learning_records')
    .select('id')
    .eq('learning_date', learningDate)
    .eq('lottery_id', lotteryId)
    .eq('draw_time', drawTime)
    .maybeSingle();

  return !!data;
};

// Get learning statistics
export const getLearningStats = async (): Promise<{
  totalRecords: number;
  hitRate: number;
  hypothesesActive: number;
  hypothesesPenalized: number;
  hypothesesDeactivated: number;
  consecutiveDays: number;
  lastProcessed: string | null;
}> => {
  const [recordsResult, statesResult, metaResult] = await Promise.all([
    supabase.from('learning_records').select('hit_patterns, miss_patterns'),
    supabase.from('learning_state').select('status'),
    getLearningMeta(),
  ]);

  const records = recordsResult.data || [];
  const states = statesResult.data || [];

  let totalHits = 0;
  let totalMisses = 0;
  
  records.forEach(r => {
    totalHits += (r.hit_patterns?.length || 0);
    totalMisses += (r.miss_patterns?.length || 0);
  });

  const total = totalHits + totalMisses;

  return {
    totalRecords: records.length,
    hitRate: total > 0 ? totalHits / total : 0,
    hypothesesActive: states.filter(s => s.status === 'active' || s.status === 'reactivated').length,
    hypothesesPenalized: states.filter(s => s.status === 'penalized').length,
    hypothesesDeactivated: states.filter(s => s.status === 'deactivated').length,
    consecutiveDays: metaResult.consecutive_days_learning,
    lastProcessed: metaResult.last_processed_date,
  };
};
