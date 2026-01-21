// ============================================================
// CONTINUOUS LEARNING SYSTEM - Persistent, cumulative learning
// ADDITIVE MODULE - Never resets, always accumulates
// Learning start date: 2026-01-02
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import {
  loadHypotheses,
  saveHypotheses,
  updateHypothesis,
  loadLearningState,
  saveLearningState,
  LEARNING_START_DATE,
  isValidLearningDate,
} from './hypothesisEngine';
import type { PatternType, LearningState, Hypothesis } from './hypothesisEngine';
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

// Storage for learning records
const LEARNING_RECORDS_KEY = 'lottery_learning_records_v2';

// Load learning records
export const loadLearningRecords = (): LearningRecord[] => {
  try {
    const stored = localStorage.getItem(LEARNING_RECORDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading learning records:', e);
  }
  return [];
};

// Save learning records
export const saveLearningRecords = (records: LearningRecord[]): void => {
  try {
    // Keep only last 1000 records to prevent storage overflow
    const trimmed = records.slice(-1000);
    localStorage.setItem(LEARNING_RECORDS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving learning records:', e);
  }
};

// Process a single draw result for learning
export const processDrawResult = (
  actualResult: string,
  lotteryId: string,
  drawTime: string,
  dateStr: string,
  history: any[]
): LearningRecord => {
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
  
  let hypotheses = loadHypotheses();
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
  
  const recentResults = relevantHistory.slice(0, 10).map(h => h.result_number?.toString().trim());
  const lastNumber = recentResults[0];
  
  if (!lastNumber) {
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
    
    hypotheses = updateHypothesis(hypotheses, patternType, isHit);
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
    
    hypotheses = updateHypothesis(hypotheses, pattern.patternType, isHit);
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
    
    hypotheses = updateHypothesis(hypotheses, assoc.patternType, isHit);
  }
  
  // Record association results
  if (lastNumber) {
    recordAssociationResult(
      associations.map(a => a.code),
      actualResult,
      lastNumber
    );
  }
  
  // ========== Evaluate Overdue ==========
  // (overdue evaluation is implicit in the prediction phase)
  
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
  
  // Save record
  const records = loadLearningRecords();
  records.push(record);
  saveLearningRecords(records);
  
  return record;
};

// Daily learning cycle - processes all new results
export const runDailyLearningCycle = async (
  lotteryIds: string[]
): Promise<{ processed: number; hits: number; misses: number }> => {
  const state = loadLearningState();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already processed today
  if (state.lastProcessedDate === today) {
    console.log('Daily learning already processed for today');
    return { processed: 0, hits: 0, misses: 0 };
  }
  
  // Fetch recent results from database
  const { data: results } = await supabase
    .from('lottery_results')
    .select('*')
    .gte('draw_date', LEARNING_START_DATE)
    .order('draw_date', { ascending: true })
    .order('draw_time', { ascending: true });
  
  if (!results || results.length === 0) {
    return { processed: 0, hits: 0, misses: 0 };
  }
  
  // Get already processed records
  const existingRecords = loadLearningRecords();
  const processedKeys = new Set(
    existingRecords.map(r => `${r.date}|${r.lottery}|${r.drawTime}`)
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
      return rDate < result.draw_date || 
             (rDate === result.draw_date && rTime < result.draw_time);
    });
    
    const record = processDrawResult(
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
  
  saveLearningState(newState);
  
  return { processed, hits: totalHits, misses: totalMisses };
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

// Get learning statistics
export const getLearningStats = (): {
  totalRecords: number;
  hitRate: number;
  hypothesesActive: number;
  hypothesesPenalized: number;
  hypothesesDeactivated: number;
  consecutiveDays: number;
  lastProcessed: string;
} => {
  const records = loadLearningRecords();
  const hypotheses = loadHypotheses();
  const state = loadLearningState();
  
  const totalHits = records.reduce((sum, r) => sum + r.hitPatterns.length, 0);
  const totalMisses = records.reduce((sum, r) => sum + r.missPatterns.length, 0);
  const total = totalHits + totalMisses;
  
  const hypothesisList = Object.values(hypotheses);
  
  return {
    totalRecords: records.length,
    hitRate: total > 0 ? totalHits / total : 0,
    hypothesesActive: hypothesisList.filter(h => h.status === 'active' || h.status === 'reactivated').length,
    hypothesesPenalized: hypothesisList.filter(h => h.status === 'penalized').length,
    hypothesesDeactivated: hypothesisList.filter(h => h.status === 'deactivated').length,
    consecutiveDays: state.consecutiveDaysLearning,
    lastProcessed: state.lastProcessedDate,
  };
};

// Force reprocess all data (for recovery)
export const forceReprocessAll = async (lotteryIds: string[]): Promise<void> => {
  // Clear existing records
  localStorage.removeItem(LEARNING_RECORDS_KEY);
  
  // Reset learning state but keep start date
  const state = loadLearningState();
  state.lastProcessedDate = '';
  state.consecutiveDaysLearning = 0;
  saveLearningState(state);
  
  // Run full cycle
  await runDailyLearningCycle(lotteryIds);
};

// Check if learning is happening
export const verifyLearningActive = (): boolean => {
  const state = loadLearningState();
  const records = loadLearningRecords();
  
  // Learning is active if:
  // 1. We have records
  // 2. State shows consecutive learning
  // 3. Last processed is recent
  const today = new Date().toISOString().split('T')[0];
  const daysSinceLastProcess = state.lastProcessedDate 
    ? getDateDiff(state.lastProcessedDate, today)
    : 999;
  
  return records.length > 0 && daysSinceLastProcess <= 7;
};
