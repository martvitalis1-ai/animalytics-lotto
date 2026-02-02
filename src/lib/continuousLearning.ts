// ============================================================
// CONTINUOUS LEARNING SYSTEM - Persistent, cumulative learning
// FULLY PERSISTENT - Uses Supabase only, NO localStorage
// Learning start date: 2026-01-02
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import {
  loadLearningState,
  saveLearningState,
  updateHypothesis,
  LEARNING_START_DATE,
  isValidLearningDate,
} from './hypothesisEngine';
import type { PatternType, LearningState } from './hypothesisEngine';
import { generateExtendedMathPatterns } from './extendedMathPatterns';
import { generateSpatialCandidates } from './roulettePatterns';
import { getAssociationCandidates, recordAssociationResult } from './animalAssociations';

// Learning result record
export interface LearningRecord {
  date: string;
  lottery: string;
  drawTime: string;
  actualResult: string;
  predictedCodes: string[];
  hitPatterns: PatternType[];
  missPatterns: PatternType[];
  processed: boolean;
}

// Check if a result was already processed
const isResultProcessed = async (
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

// Save learning record to Supabase
const saveLearningRecord = async (record: LearningRecord): Promise<void> => {
  await supabase.from('learning_records').upsert({
    learning_date: record.date,
    lottery_id: record.lottery,
    draw_time: record.drawTime,
    actual_result: record.actualResult,
    hit_patterns: record.hitPatterns,
    miss_patterns: record.missPatterns,
    processed: record.processed,
  }, { onConflict: 'learning_date,lottery_id,draw_time' });
};

// Process a single draw result for learning
export const processDrawResult = async (
  actualResult: string,
  lotteryId: string,
  drawTime: string,
  dateStr: string,
  history: any[]
): Promise<LearningRecord> => {
  // Skip if before learning start date
  if (!isValidLearningDate(dateStr)) {
    return {
      date: dateStr,
      lottery: lotteryId,
      drawTime,
      actualResult,
      predictedCodes: [],
      hitPatterns: [],
      missPatterns: [],
      processed: false,
    };
  }

  // Check if already processed
  const alreadyProcessed = await isResultProcessed(dateStr, lotteryId, drawTime);
  if (alreadyProcessed) {
    return {
      date: dateStr,
      lottery: lotteryId,
      drawTime,
      actualResult,
      predictedCodes: [],
      hitPatterns: [],
      missPatterns: [],
      processed: true,
    };
  }
  
  const hitPatterns: PatternType[] = [];
  const missPatterns: PatternType[] = [];
  const predictedCodes: string[] = [];
  
  // Get recent results (before this draw)
  const relevantHistory = history.filter(h => {
    const hDate = h.draw_date || h.created_at?.split('T')[0];
    const hTime = h.draw_time;
    return h.lottery_type === lotteryId && 
           (hDate < dateStr || (hDate === dateStr && hTime < drawTime));
  });
  
  const recentResults = relevantHistory.slice(0, 20).map(h => h.result_number?.toString().trim());
  const lastNumber = recentResults[0];
  
  if (!lastNumber) {
    const record: LearningRecord = {
      date: dateStr,
      lottery: lotteryId,
      drawTime,
      actualResult,
      predictedCodes: [],
      hitPatterns: [],
      missPatterns: [],
      processed: true,
    };
    await saveLearningRecord(record);
    return record;
  }
  
  // ========== Evaluate Spatial Patterns ==========
  const spatialCandidates = generateSpatialCandidates(lastNumber, lotteryId);
  for (const candidate of spatialCandidates) {
    const patternType: PatternType = candidate.source.includes('Opuesto')
      ? 'spatial_opposite'
      : candidate.source.includes('±')
        ? 'spatial_jump'
        : 'spatial_neighbor';
    
    const isHit = candidate.code === actualResult || 
                  parseInt(candidate.code) === parseInt(actualResult);
    
    predictedCodes.push(candidate.code);
    
    if (isHit) {
      hitPatterns.push(patternType);
    } else {
      missPatterns.push(patternType);
    }
    
    await updateHypothesis(lotteryId, patternType, isHit);
  }
  
  // ========== Evaluate Math Patterns ==========
  const mathPatterns = generateExtendedMathPatterns(recentResults, lotteryId);
  for (const pattern of mathPatterns) {
    const isHit = pattern.code === actualResult ||
                  parseInt(pattern.code) === parseInt(actualResult);
    
    predictedCodes.push(pattern.code);
    
    if (isHit) {
      hitPatterns.push(pattern.patternType);
    } else {
      missPatterns.push(pattern.patternType);
    }
    
    await updateHypothesis(lotteryId, pattern.patternType, isHit);
  }
  
  // ========== Evaluate Animal Associations ==========
  const associations = getAssociationCandidates(recentResults, lotteryId, relevantHistory);
  for (const assoc of associations) {
    const isHit = assoc.code === actualResult ||
                  parseInt(assoc.code) === parseInt(actualResult);
    
    predictedCodes.push(assoc.code);
    
    if (isHit) {
      hitPatterns.push(assoc.patternType);
    } else {
      missPatterns.push(assoc.patternType);
    }
    
    await updateHypothesis(lotteryId, assoc.patternType, isHit);
  }
  
  // Record association results
  if (lastNumber) {
    recordAssociationResult(
      associations.map(a => a.code),
      actualResult,
      lastNumber
    );
  }
  
  const record: LearningRecord = {
    date: dateStr,
    lottery: lotteryId,
    drawTime,
    actualResult,
    predictedCodes: [...new Set(predictedCodes)],
    hitPatterns: [...new Set(hitPatterns)],
    missPatterns: [...new Set(missPatterns)],
    processed: true,
  };
  
  // Save record to Supabase
  await saveLearningRecord(record);
  
  return record;
};

// Get previous day
const getPreviousDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

// Get date difference in days
const getDateDiff = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

// Backfill missing days - processes all unprocessed results since LEARNING_START_DATE
export const backfillMissingDays = async (
  lotteryIds: string[]
): Promise<{ processed: number; backfilledDays: string[] }> => {
  console.log('[Backfill] Starting backfill process...');
  
  // Fetch ALL results since LEARNING_START_DATE without limits
  const { data: results, error } = await supabase
    .from('lottery_results')
    .select('*')
    .gte('draw_date', LEARNING_START_DATE)
    .order('draw_date', { ascending: true })
    .order('draw_time', { ascending: true });

  if (error || !results || results.length === 0) {
    console.log('[Backfill] No results to process');
    return { processed: 0, backfilledDays: [] };
  }

  console.log(`[Backfill] Found ${results.length} total results since ${LEARNING_START_DATE}`);

  // Get already processed records
  const { data: existingRecords } = await supabase
    .from('learning_records')
    .select('learning_date, lottery_id, draw_time');

  const processedKeys = new Set(
    (existingRecords || []).map(r => `${r.learning_date}|${r.lottery_id}|${r.draw_time}`)
  );

  let processed = 0;
  const backfilledDays: string[] = [];

  for (const result of results) {
    const key = `${result.draw_date}|${result.lottery_type}|${result.draw_time}`;
    
    if (processedKeys.has(key)) continue;
    if (!lotteryIds.includes(result.lottery_type)) continue;
    
    // Build history up to this point
    const historyUpToNow = results.filter(r => {
      const rDate = r.draw_date;
      const rTime = r.draw_time;
      return r.lottery_type === result.lottery_type && 
             (rDate < result.draw_date || 
              (rDate === result.draw_date && rTime < result.draw_time));
    });
    
    await processDrawResult(
      result.result_number,
      result.lottery_type,
      result.draw_time,
      result.draw_date,
      historyUpToNow
    );
    
    processed++;
    if (!backfilledDays.includes(result.draw_date)) {
      backfilledDays.push(result.draw_date);
    }
  }

  console.log(`[Backfill] Completed. Processed ${processed} records across ${backfilledDays.length} days`);
  return { processed, backfilledDays };
};

// Daily learning cycle - processes all new results
export const runDailyLearningCycle = async (
  lotteryIds: string[]
): Promise<{ processed: number; hits: number; misses: number }> => {
  const state = await loadLearningState();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already processed today
  if (state.lastProcessedDate === today) {
    console.log('[Learning] Daily learning already processed for today');
    return { processed: 0, hits: 0, misses: 0 };
  }
  
  // First, run backfill to catch any missing days
  await backfillMissingDays(lotteryIds);
  
  // Fetch ALL results since LEARNING_START_DATE (no limit)
  const { data: results, error } = await supabase
    .from('lottery_results')
    .select('*')
    .gte('draw_date', LEARNING_START_DATE)
    .order('draw_date', { ascending: true })
    .order('draw_time', { ascending: true });
  
  if (error || !results || results.length === 0) {
    return { processed: 0, hits: 0, misses: 0 };
  }
  
  // Get already processed records
  const { data: existingRecords } = await supabase
    .from('learning_records')
    .select('learning_date, lottery_id, draw_time, hit_patterns, miss_patterns');

  const processedKeys = new Set(
    (existingRecords || []).map(r => `${r.learning_date}|${r.lottery_id}|${r.draw_time}`)
  );
  
  let processed = 0;
  let totalHits = 0;
  let totalMisses = 0;
  
  // Process each unprocessed result
  for (const result of results) {
    const key = `${result.draw_date}|${result.lottery_type}|${result.draw_time}`;
    
    if (processedKeys.has(key)) continue;
    
    // Build history up to this point
    const historyUpToNow = results.filter(r => {
      const rDate = r.draw_date;
      const rTime = r.draw_time;
      return r.lottery_type === result.lottery_type && 
             (rDate < result.draw_date || 
              (rDate === result.draw_date && rTime < result.draw_time));
    });
    
    const record = await processDrawResult(
      result.result_number,
      result.lottery_type,
      result.draw_time,
      result.draw_date,
      historyUpToNow
    );
    
    if (record.processed) {
      processed++;
      totalHits += record.hitPatterns.length;
      totalMisses += record.missPatterns.length;
    }
  }
  
  // Update learning state
  const newState: LearningState = {
    ...state,
    lastProcessedDate: today,
    consecutiveDaysLearning: state.lastProcessedDate === getPreviousDay(today)
      ? state.consecutiveDaysLearning + 1
      : 1,
    totalDaysLearned: state.totalDaysLearned + 1,
    lastHitDate: totalHits > 0 ? today : state.lastHitDate,
    startDate: LEARNING_START_DATE,
  };
  
  // Detect gaps
  if (state.lastProcessedDate && state.lastProcessedDate !== getPreviousDay(today)) {
    const gapDays = getDateDiff(state.lastProcessedDate, today);
    if (gapDays > 1) {
      newState.gapsDetected = [...(state.gapsDetected || []), gapDays];
    }
  }
  
  await saveLearningState(newState);
  
  return { processed, hits: totalHits, misses: totalMisses };
};

// Get learning statistics from Supabase
export const getLearningStats = async (): Promise<{
  totalRecords: number;
  hitRate: number;
  hypothesesActive: number;
  hypothesesPenalized: number;
  hypothesesDeactivated: number;
  consecutiveDays: number;
  lastProcessed: string;
}> => {
  const [recordsResult, statesResult, state] = await Promise.all([
    supabase.from('learning_records').select('hit_patterns, miss_patterns'),
    supabase.from('learning_state').select('status'),
    loadLearningState(),
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
    consecutiveDays: state.consecutiveDaysLearning,
    lastProcessed: state.lastProcessedDate,
  };
};

// Force reprocess all data (for recovery)
export const forceReprocessAll = async (lotteryIds: string[]): Promise<void> => {
  // Delete existing learning records
  await supabase.from('learning_records').delete().gte('learning_date', LEARNING_START_DATE);
  
  // Reset learning meta
  await supabase.from('learning_meta').delete().neq('id', '');
  
  // Run full cycle with backfill
  await runDailyLearningCycle(lotteryIds);
};

// Check if learning is happening
export const verifyLearningActive = async (): Promise<boolean> => {
  const state = await loadLearningState();
  const { data: records } = await supabase
    .from('learning_records')
    .select('id')
    .limit(1);
  
  const today = new Date().toISOString().split('T')[0];
  const daysSinceLastProcess = state.lastProcessedDate 
    ? getDateDiff(state.lastProcessedDate, today)
    : 999;
  
  return (records?.length || 0) > 0 && daysSinceLastProcess <= 7;
};
