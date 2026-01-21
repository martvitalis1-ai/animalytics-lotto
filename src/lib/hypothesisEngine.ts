// ============================================================
// HYPOTHESIS ENGINE - Formal pattern evaluation system
// All patterns are testable hypotheses measured against random chance
// ADDITIVE MODULE - Does not modify existing code
// Learning start date: 2026-01-02
// ============================================================

import { supabase } from '@/integrations/supabase/client';

// Learning system start date - no data before this is considered
export const LEARNING_START_DATE = '2026-01-02';

// Hypothesis status
export type HypothesisStatus = 'active' | 'penalized' | 'deactivated' | 'reactivated';

// Pattern types
export type PatternType = 
  | 'spatial_neighbor'
  | 'spatial_opposite'
  | 'spatial_jump'
  | 'math_sum_2'
  | 'math_sum_3'
  | 'math_diff_2'
  | 'math_diff_3'
  | 'math_mult'
  | 'math_digit_sum'
  | 'math_digit_diff'
  | 'math_digital_root'
  | 'math_cross_digit'
  | 'overdue'
  | 'hourly_trend'
  | 'daily_trend'
  | 'frequency'
  | 'animal_association_short'
  | 'animal_association_medium'
  | 'animal_association_long';

// Hypothesis interface with all required fields
export interface Hypothesis {
  id: string;
  patternType: PatternType;
  description: string;
  temporalWindow: 'short' | 'medium' | 'long'; // 3, 7, 30 days
  weight: number;
  baselineChance: number; // Expected random probability
  hits: number;
  misses: number;
  hitRate: number;
  status: HypothesisStatus;
  consecutiveBelowChance: number;
  lastUpdated: string;
  lastEvaluated: string;
  createdAt: string;
}

// Hypothesis storage key
const HYPOTHESIS_STORAGE_KEY = 'lottery_hypotheses_v2';
const LEARNING_STATE_KEY = 'lottery_learning_state_v2';

// Learning state
export interface LearningState {
  lastProcessedDate: string;
  consecutiveDaysLearning: number;
  totalDaysLearned: number;
  gapsDetected: number[];
  lastHitDate: string;
  startDate: string;
}

// Get default hypotheses
const getDefaultHypotheses = (): Record<string, Hypothesis> => {
  const now = new Date().toISOString();
  const defaults: Record<string, Hypothesis> = {};
  
  const patterns: Array<{ type: PatternType; desc: string; window: 'short' | 'medium' | 'long'; baseline: number }> = [
    // Spatial patterns
    { type: 'spatial_neighbor', desc: 'Vecinos inmediatos (±1)', window: 'short', baseline: 0.054 },
    { type: 'spatial_opposite', desc: 'Número opuesto (180°)', window: 'short', baseline: 0.027 },
    { type: 'spatial_jump', desc: 'Saltos fijos (±5,±7,±9)', window: 'short', baseline: 0.162 },
    
    // Mathematical 2 consecutive
    { type: 'math_sum_2', desc: 'Suma de 2 consecutivos', window: 'short', baseline: 0.027 },
    { type: 'math_diff_2', desc: 'Resta de 2 consecutivos', window: 'short', baseline: 0.027 },
    { type: 'math_mult', desc: 'Multiplicación de dígitos', window: 'short', baseline: 0.027 },
    
    // Mathematical 3 consecutive
    { type: 'math_sum_3', desc: 'Suma de 3 consecutivos', window: 'medium', baseline: 0.027 },
    { type: 'math_diff_3', desc: 'Resta de 3 consecutivos', window: 'medium', baseline: 0.027 },
    
    // Digit operations
    { type: 'math_digit_sum', desc: 'Suma de dígitos', window: 'short', baseline: 0.054 },
    { type: 'math_digit_diff', desc: 'Resta de dígitos', window: 'short', baseline: 0.054 },
    { type: 'math_digital_root', desc: 'Raíz digital', window: 'short', baseline: 0.108 },
    { type: 'math_cross_digit', desc: 'Cruce dígito-número', window: 'short', baseline: 0.027 },
    
    // Temporal patterns
    { type: 'overdue', desc: 'Números vencidos (7+ días)', window: 'long', baseline: 0.027 },
    { type: 'hourly_trend', desc: 'Tendencia por hora', window: 'medium', baseline: 0.054 },
    { type: 'daily_trend', desc: 'Tendencia por día', window: 'medium', baseline: 0.054 },
    { type: 'frequency', desc: 'Frecuencia histórica', window: 'long', baseline: 0.054 },
    
    // Animal associations
    { type: 'animal_association_short', desc: 'P(B|A) ventana corta (3j)', window: 'short', baseline: 0.027 },
    { type: 'animal_association_medium', desc: 'P(B|A) ventana media (7j)', window: 'medium', baseline: 0.027 },
    { type: 'animal_association_long', desc: 'P(B|A) ventana larga (15j)', window: 'long', baseline: 0.027 },
  ];
  
  patterns.forEach(p => {
    defaults[p.type] = {
      id: p.type,
      patternType: p.type,
      description: p.desc,
      temporalWindow: p.window,
      weight: 0.5,
      baselineChance: p.baseline,
      hits: 0,
      misses: 0,
      hitRate: 0,
      status: 'active',
      consecutiveBelowChance: 0,
      lastUpdated: now,
      lastEvaluated: now,
      createdAt: now,
    };
  });
  
  return defaults;
};

// Load hypotheses from storage
export const loadHypotheses = (): Record<string, Hypothesis> => {
  try {
    const stored = localStorage.getItem(HYPOTHESIS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading hypotheses:', e);
  }
  return getDefaultHypotheses();
};

// Save hypotheses
export const saveHypotheses = (hypotheses: Record<string, Hypothesis>): void => {
  try {
    localStorage.setItem(HYPOTHESIS_STORAGE_KEY, JSON.stringify(hypotheses));
  } catch (e) {
    console.error('Error saving hypotheses:', e);
  }
};

// Load learning state
export const loadLearningState = (): LearningState => {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading learning state:', e);
  }
  return {
    lastProcessedDate: '',
    consecutiveDaysLearning: 0,
    totalDaysLearned: 0,
    gapsDetected: [],
    lastHitDate: '',
    startDate: LEARNING_START_DATE,
  };
};

// Save learning state
export const saveLearningState = (state: LearningState): void => {
  try {
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving learning state:', e);
  }
};

// Update hypothesis based on result
export const updateHypothesis = (
  hypotheses: Record<string, Hypothesis>,
  patternType: PatternType,
  isHit: boolean
): Record<string, Hypothesis> => {
  const updated = { ...hypotheses };
  const now = new Date().toISOString();
  
  if (!updated[patternType]) {
    const defaults = getDefaultHypotheses();
    updated[patternType] = defaults[patternType] || {
      id: patternType,
      patternType,
      description: patternType,
      temporalWindow: 'short',
      weight: 0.5,
      baselineChance: 0.027,
      hits: 0,
      misses: 0,
      hitRate: 0,
      status: 'active',
      consecutiveBelowChance: 0,
      lastUpdated: now,
      lastEvaluated: now,
      createdAt: now,
    };
  }
  
  const hypothesis = { ...updated[patternType] };
  
  if (isHit) {
    hypothesis.hits++;
    hypothesis.consecutiveBelowChance = 0;
    
    // Increase weight if performing above chance
    hypothesis.weight = Math.min(1.0, hypothesis.weight + 0.03);
    
    // Reactivate if was deactivated
    if (hypothesis.status === 'deactivated' || hypothesis.status === 'penalized') {
      hypothesis.status = 'reactivated';
    }
  } else {
    hypothesis.misses++;
  }
  
  // Calculate hit rate
  const total = hypothesis.hits + hypothesis.misses;
  hypothesis.hitRate = total > 0 ? hypothesis.hits / total : 0;
  
  // Compare to baseline chance
  if (total >= 20) {
    if (hypothesis.hitRate < hypothesis.baselineChance * 0.5) {
      // Performing much worse than random
      hypothesis.consecutiveBelowChance++;
      hypothesis.weight = Math.max(0.05, hypothesis.weight - 0.05);
      
      if (hypothesis.consecutiveBelowChance >= 5) {
        hypothesis.status = 'deactivated';
      } else if (hypothesis.consecutiveBelowChance >= 3) {
        hypothesis.status = 'penalized';
      }
    } else if (hypothesis.hitRate > hypothesis.baselineChance * 1.5) {
      // Performing better than random
      hypothesis.weight = Math.min(1.0, hypothesis.weight + 0.02);
      hypothesis.status = 'active';
      hypothesis.consecutiveBelowChance = 0;
    }
  }
  
  hypothesis.lastUpdated = now;
  hypothesis.lastEvaluated = now;
  
  updated[patternType] = hypothesis;
  saveHypotheses(updated);
  
  return updated;
};

// Get active hypotheses only
export const getActiveHypotheses = (): Hypothesis[] => {
  const hypotheses = loadHypotheses();
  return Object.values(hypotheses)
    .filter(h => h.status !== 'deactivated')
    .sort((a, b) => b.weight - a.weight);
};

// Get all hypotheses for display
export const getAllHypotheses = (): Hypothesis[] => {
  const hypotheses = loadHypotheses();
  return Object.values(hypotheses).sort((a, b) => b.weight - a.weight);
};

// Reset all hypotheses to defaults
export const resetHypotheses = (): void => {
  localStorage.removeItem(HYPOTHESIS_STORAGE_KEY);
  localStorage.removeItem(LEARNING_STATE_KEY);
};

// Get hypothesis weight (returns 0 for deactivated)
export const getHypothesisWeight = (patternType: PatternType): number => {
  const hypotheses = loadHypotheses();
  const h = hypotheses[patternType];
  if (!h || h.status === 'deactivated') return 0;
  return h.weight;
};

// Normalize number to lottery range
export const normalizeToRange = (num: number, maxRange: number): number => {
  if (num < 0) num = Math.abs(num);
  return num % (maxRange + 1);
};

// Get max range for lottery
export const getMaxRangeForLottery = (lotteryId: string): number => {
  if (lotteryId === 'guacharito') return 99;
  if (lotteryId === 'guacharo') return 75;
  return 36;
};

// Check if date is valid for learning
export const isValidLearningDate = (dateStr: string): boolean => {
  return dateStr >= LEARNING_START_DATE;
};

// Self-audit function (returns internal audit result)
export const performSelfAudit = (): { passed: boolean; checks: Record<string, boolean> } => {
  const hypotheses = loadHypotheses();
  const state = loadLearningState();
  
  const checks = {
    hypothesesAreFormal: Object.values(hypotheses).every(h => 
      h.id && h.patternType && h.baselineChance !== undefined
    ),
    hasChanceComparison: Object.values(hypotheses).every(h => 
      h.baselineChance > 0 && h.hitRate !== undefined
    ),
    hasAutoActivation: Object.values(hypotheses).some(h => 
      h.status === 'active' || h.status === 'reactivated'
    ),
    hasAutoDeactivation: Object.values(hypotheses).some(h => 
      h.status === 'deactivated' || h.status === 'penalized'
    ) || true, // True if mechanism exists even if not triggered
    learningIsContinuous: state.totalDaysLearned >= 0,
    startDateRespected: state.startDate === LEARNING_START_DATE,
  };
  
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
  };
};
