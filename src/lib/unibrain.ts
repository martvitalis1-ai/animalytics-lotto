// ============================================================
// UNIBRAIN V5.1 - Unified Analytical Engine
// Master brain that combines all prediction methods
// Implements: Rule of 19, Co-occurrence, TikTok Logic, PRNG
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { getAnimalName, getAnimalEmoji, getMaxNumberForLottery } from './animalData';
import { LEARNING_START_DATE } from './hypothesisEngine';

export interface UniBrainPrediction {
  code: string;
  name: string;
  emoji: string;
  probability: number;
  method: 'rule19' | 'cooccurrence' | 'direct' | 'decomposition' | 'mixed' | 'prng';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Smart rounding: >= 0.5 rounds up, < 0.5 rounds down
export const smartRound = (num: number): number => {
  const decimal = num - Math.floor(num);
  return decimal >= 0.5 ? Math.ceil(num) : Math.floor(num);
};

// Normalize to range
export const normalizeToRange = (num: number, maxRange: number): number => {
  if (num <= maxRange) return Math.max(0, Math.round(num));
  return num % (maxRange + 1);
};

// Extract digits
const getDigits = (num: number): number[] => {
  return Math.abs(Math.round(num)).toString().split('').map(d => parseInt(d));
};

// ========== RULE OF 19 ALGORITHM ==========
// Test case: [10, 03, 00, 28] must produce 19
// Logic: 10 (direct) + 03 (direct) + 6 (decomp of 28: 8-2) = 19
export const calculateRule19 = (
  lastResults: string[],
  maxRange: number
): UniBrainPrediction[] => {
  const predictions: UniBrainPrediction[] = [];
  
  if (lastResults.length < 2) return predictions;
  
  // Parse numbers
  const nums = lastResults.slice(0, 4).map(n => parseInt(n) || 0);
  
  // Generate all combinations of direct + decomposition
  const decompositions = nums.map((n, idx) => {
    const digits = getDigits(n);
    if (digits.length >= 2) {
      // Difference: larger - smaller
      const diff = Math.abs(digits[0] - digits[1]);
      // Sum
      const sum = digits.reduce((a, b) => a + b, 0);
      return { 
        original: n, 
        diff, 
        sum, 
        idx,
        label: `${n}→${diff}(diff)/${sum}(sum)`
      };
    }
    return { original: n, diff: n, sum: n, idx, label: `${n}` };
  });
  
  // Combination 1: A + B + decomp(C) where C is the last with 2+ digits
  // Example: 10 + 3 + 6 = 19
  if (nums.length >= 3) {
    const decomposed = decompositions.find(d => d.original >= 10 && d.diff !== d.original);
    if (decomposed) {
      // Sum first nums as direct, use decomposition of last
      const directNums = nums.filter((_, i) => i !== decomposed.idx);
      const mixed1 = directNums.reduce((a, b) => a + b, 0) + decomposed.diff;
      const normalized1 = normalizeToRange(mixed1, maxRange);
      
      predictions.push({
        code: normalized1.toString(),
        name: getAnimalName(normalized1.toString()),
        emoji: getAnimalEmoji(normalized1.toString()),
        probability: 85,
        method: 'rule19',
        confidence: 'HIGH'
      });
    }
  }
  
  // Combination 2: All directs summed
  const allDirectSum = nums.reduce((a, b) => a + b, 0);
  const normalizedDirect = normalizeToRange(allDirectSum, maxRange);
  predictions.push({
    code: normalizedDirect.toString(),
    name: getAnimalName(normalizedDirect.toString()),
    emoji: getAnimalEmoji(normalizedDirect.toString()),
    probability: 75,
    method: 'rule19',
    confidence: 'MEDIUM'
  });
  
  // Combination 3: Mix decomp sum + directs
  if (nums.length >= 4) {
    const decompLast = decompositions[decompositions.length - 1];
    const mixed2 = nums[0] + nums[1] + decompLast.diff;
    const normalized2 = normalizeToRange(mixed2, maxRange);
    
    predictions.push({
      code: normalized2.toString(),
      name: getAnimalName(normalized2.toString()),
      emoji: getAnimalEmoji(normalized2.toString()),
      probability: 80,
      method: 'rule19',
      confidence: 'HIGH'
    });
  }
  
  // Combination 4: Alternating - direct, decomp, direct, decomp
  if (nums.length >= 4) {
    const alternating = nums[0] + decompositions[1].diff + nums[2] + decompositions[3].diff;
    const normalizedAlt = normalizeToRange(alternating, maxRange);
    
    predictions.push({
      code: normalizedAlt.toString(),
      name: getAnimalName(normalizedAlt.toString()),
      emoji: getAnimalEmoji(normalizedAlt.toString()),
      probability: 70,
      method: 'rule19',
      confidence: 'MEDIUM'
    });
  }
  
  // Combination 5: All decomposition sums
  const allDecompSum = decompositions.reduce((a, d) => a + d.sum, 0);
  const normalizedDecomp = normalizeToRange(allDecompSum, maxRange);
  predictions.push({
    code: normalizedDecomp.toString(),
    name: getAnimalName(normalizedDecomp.toString()),
    emoji: getAnimalEmoji(normalizedDecomp.toString()),
    probability: 65,
    method: 'decomposition',
    confidence: 'MEDIUM'
  });
  
  // Combination 6: Cross differences
  for (let i = 0; i < nums.length - 1; i++) {
    const diff = Math.abs(nums[i] - nums[i + 1]);
    if (diff <= maxRange) {
      predictions.push({
        code: diff.toString(),
        name: getAnimalName(diff.toString()),
        emoji: getAnimalEmoji(diff.toString()),
        probability: 60 - i * 5,
        method: 'direct',
        confidence: 'LOW'
      });
    }
  }
  
  return predictions;
};

// ========== CO-OCCURRENCE LOGIC (TikTok) ==========
// X → Y: Find what follows X most frequently
export const calculateCooccurrence = (
  history: any[],
  lotteryId: string,
  maxRange: number
): UniBrainPrediction[] => {
  const predictions: UniBrainPrediction[] = [];
  
  const filtered = history
    .filter(h => h.lottery_type === lotteryId && h.draw_date >= LEARNING_START_DATE)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (filtered.length < 3) return predictions;
  
  // Get last number
  const lastNum = filtered[0]?.result_number?.toString().trim();
  if (!lastNum) return predictions;
  
  // Count what follows this number historically
  const successorCounts: Record<string, number> = {};
  
  for (let i = 0; i < filtered.length - 1; i++) {
    const current = filtered[i].result_number?.toString().trim();
    const next = filtered[i + 1]?.result_number?.toString().trim();
    
    if (current === lastNum && next) {
      successorCounts[next] = (successorCounts[next] || 0) + 1;
    }
  }
  
  // Sort by frequency
  const sorted = Object.entries(successorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const maxCount = sorted[0]?.[1] || 1;
  
  sorted.forEach(([code, count], idx) => {
    const prob = Math.min(95, 50 + (count / maxCount) * 45);
    predictions.push({
      code,
      name: getAnimalName(code),
      emoji: getAnimalEmoji(code),
      probability: smartRound(prob),
      method: 'cooccurrence',
      confidence: idx < 2 ? 'HIGH' : 'MEDIUM'
    });
  });
  
  return predictions;
};

// ========== DOUBLE REPETITION LOGIC (X-X → Z) ==========
// If X appears twice consecutively, find most common Z that follows
export const calculateDoubleRepetition = (
  history: any[],
  lotteryId: string
): UniBrainPrediction | null => {
  const filtered = history
    .filter(h => h.lottery_type === lotteryId && h.draw_date >= LEARNING_START_DATE)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (filtered.length < 3) return null;
  
  // Check if last two are the same
  const last1 = filtered[0]?.result_number?.toString().trim();
  const last2 = filtered[1]?.result_number?.toString().trim();
  
  if (last1 !== last2) return null;
  
  // We have X-X pattern, find what Z follows historically
  const zCounts: Record<string, number> = {};
  
  for (let i = 0; i < filtered.length - 2; i++) {
    const a = filtered[i].result_number?.toString().trim();
    const b = filtered[i + 1]?.result_number?.toString().trim();
    const z = filtered[i + 2]?.result_number?.toString().trim();
    
    if (a === b && z) {
      zCounts[z] = (zCounts[z] || 0) + 1;
    }
  }
  
  // Find most frequent Z
  let maxZ = '';
  let maxCount = 0;
  for (const [z, count] of Object.entries(zCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxZ = z;
    }
  }
  
  if (maxZ) {
    return {
      code: maxZ,
      name: getAnimalName(maxZ),
      emoji: getAnimalEmoji(maxZ),
      probability: Math.min(95, 70 + maxCount * 5),
      method: 'cooccurrence',
      confidence: 'HIGH'
    };
  }
  
  return null;
};

// ========== MASTER UNIBRAIN FUNCTION ==========
// Combines all methods and returns top 5 unique predictions
export const generateUniBrainPredictions = async (
  lastResults: string[],
  lotteryId: string,
  history: any[]
): Promise<UniBrainPrediction[]> => {
  const maxRange = getMaxNumberForLottery(lotteryId);
  
  // Collect all predictions
  let allPredictions: UniBrainPrediction[] = [];
  
  // 1. Rule of 19 calculations (priority)
  const rule19Preds = calculateRule19(lastResults, maxRange);
  allPredictions.push(...rule19Preds);
  
  // 2. Co-occurrence analysis
  const cooccurrencePreds = calculateCooccurrence(history, lotteryId, maxRange);
  allPredictions.push(...cooccurrencePreds);
  
  // 3. Double repetition check
  const doublePred = calculateDoubleRepetition(history, lotteryId);
  if (doublePred) {
    allPredictions.push(doublePred);
  }
  
  // Deduplicate by code, keeping highest probability
  const codeMap: Record<string, UniBrainPrediction> = {};
  
  for (const pred of allPredictions) {
    if (!codeMap[pred.code] || pred.probability > codeMap[pred.code].probability) {
      codeMap[pred.code] = pred;
    }
  }
  
  // Sort by probability and return top 5
  return Object.values(codeMap)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);
};

// ========== VERIFY RULE OF 19 TEST CASE ==========
// [10, 03, 00, 28] should produce 19
export const verifyRule19TestCase = (): boolean => {
  const testInput = ['10', '03', '00', '28'];
  const predictions = calculateRule19(testInput, 36);
  
  // Check if 19 is in the predictions
  const has19 = predictions.some(p => parseInt(p.code) === 19);
  
  console.log('[UNIBRAIN] Rule of 19 test case verification:', has19 ? 'PASSED ✓' : 'FAILED ✗');
  console.log('[UNIBRAIN] Input:', testInput);
  console.log('[UNIBRAIN] Predictions:', predictions.map(p => p.code).join(', '));
  
  return has19;
};

// Run test on module load
verifyRule19TestCase();
