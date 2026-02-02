// ============================================================
// EXTENDED MATHEMATICAL PATTERNS - Complete operations set
// ADDITIVE MODULE - Extends existing math patterns
// Supports normalization for 38, 75, 99 ranges
// ============================================================

import { getMaxRangeForLottery, normalizeToRange, getHypothesisWeightSync } from './hypothesisEngine';
import type { PatternType } from './hypothesisEngine';

export interface MathCandidate {
  code: string;
  formula: string;
  weight: number;
  patternType: PatternType;
  rawValue: number;
}

// Extract digits from a number
const getDigits = (num: number): number[] => {
  return Math.abs(num).toString().split('').map(d => parseInt(d));
};

// Digital root
const digitalRoot = (num: number): number => {
  let n = Math.abs(num);
  while (n > 9) {
    n = n.toString().split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return n;
};

// Generate ALL mathematical patterns from recent results
export const generateExtendedMathPatterns = (
  results: string[],
  lotteryId: string
): MathCandidate[] => {
  const maxRange = getMaxRangeForLottery(lotteryId);
  const patterns: MathCandidate[] = [];
  
  if (results.length < 2) return patterns;
  
  const nums = results.slice(0, 4).map(r => parseInt(r) || 0);
  
  // ========== 2 CONSECUTIVE OPERATIONS ==========
  if (nums.length >= 2) {
    const a = nums[0];
    const b = nums[1];
    
    // Sum
    const sum2 = normalizeToRange(a + b, maxRange);
    patterns.push({
      code: sum2.toString(),
      formula: `Σ(${a}+${b})=${sum2}`,
      weight: getHypothesisWeightSync('math_sum_2'),
      patternType: 'math_sum_2',
      rawValue: a + b,
    });
    
    // Difference (absolute)
    const diff2 = normalizeToRange(Math.abs(a - b), maxRange);
    patterns.push({
      code: diff2.toString(),
      formula: `Δ|${a}-${b}|=${diff2}`,
      weight: getHypothesisWeightSync('math_diff_2'),
      patternType: 'math_diff_2',
      rawValue: Math.abs(a - b),
    });
    
    // Multiplication of units
    const mult = normalizeToRange((a % 10) * (b % 10), maxRange);
    patterns.push({
      code: mult.toString(),
      formula: `×(${a % 10}*${b % 10})=${mult}`,
      weight: getHypothesisWeightSync('math_mult'),
      patternType: 'math_mult',
      rawValue: (a % 10) * (b % 10),
    });
    
    // Digit operations for first number
    const digitsA = getDigits(a);
    const digitsB = getDigits(b);
    
    // Sum of digits of each
    const digitSumA = digitsA.reduce((x, y) => x + y, 0);
    const digitSumB = digitsB.reduce((x, y) => x + y, 0);
    
    patterns.push({
      code: normalizeToRange(digitSumA, maxRange).toString(),
      formula: `ΣDig(${a})=${digitSumA}`,
      weight: getHypothesisWeightSync('math_digit_sum'),
      patternType: 'math_digit_sum',
      rawValue: digitSumA,
    });
    
    patterns.push({
      code: normalizeToRange(digitSumB, maxRange).toString(),
      formula: `ΣDig(${b})=${digitSumB}`,
      weight: getHypothesisWeightSync('math_digit_sum'),
      patternType: 'math_digit_sum',
      rawValue: digitSumB,
    });
    
    // Difference of digits
    if (digitsA.length >= 2) {
      const digitDiffA = Math.abs(digitsA[0] - digitsA[1]);
      patterns.push({
        code: normalizeToRange(digitDiffA, maxRange).toString(),
        formula: `ΔDig(${a})=${digitDiffA}`,
        weight: getHypothesisWeightSync('math_digit_diff'),
        patternType: 'math_digit_diff',
        rawValue: digitDiffA,
      });
    }
    
    // Digital root
    const rootA = digitalRoot(a);
    patterns.push({
      code: rootA.toString(),
      formula: `√Dig(${a})=${rootA}`,
      weight: getHypothesisWeightSync('math_digital_root'),
      patternType: 'math_digital_root',
      rawValue: rootA,
    });
    
    // Cross digit-number combinations
    // Unit of A + tens of B
    const crossAB = normalizeToRange((a % 10) * 10 + (b % 10), maxRange);
    patterns.push({
      code: crossAB.toString(),
      formula: `Cross(${a % 10}${b % 10})=${crossAB}`,
      weight: getHypothesisWeightSync('math_cross_digit'),
      patternType: 'math_cross_digit',
      rawValue: crossAB,
    });
    
    // Reversed cross
    const crossBA = normalizeToRange((b % 10) * 10 + (a % 10), maxRange);
    patterns.push({
      code: crossBA.toString(),
      formula: `Cross(${b % 10}${a % 10})=${crossBA}`,
      weight: getHypothesisWeightSync('math_cross_digit'),
      patternType: 'math_cross_digit',
      rawValue: crossBA,
    });
    
    // Cross with intermediate result
    const intermediate = normalizeToRange(digitSumA + digitSumB, maxRange);
    patterns.push({
      code: intermediate.toString(),
      formula: `ΣDig(${a})+ΣDig(${b})=${intermediate}`,
      weight: getHypothesisWeightSync('math_digit_sum'),
      patternType: 'math_digit_sum',
      rawValue: digitSumA + digitSumB,
    });
  }
  
  // ========== 3 CONSECUTIVE OPERATIONS ==========
  if (nums.length >= 3) {
    const [a, b, c] = nums.slice(0, 3);
    
    // Sum of 3
    const sum3 = normalizeToRange(a + b + c, maxRange);
    patterns.push({
      code: sum3.toString(),
      formula: `Σ3(${a}+${b}+${c})=${sum3}`,
      weight: getHypothesisWeightSync('math_sum_3'),
      patternType: 'math_sum_3',
      rawValue: a + b + c,
    });
    
    // Average of 3
    const avg3 = normalizeToRange(Math.round((a + b + c) / 3), maxRange);
    patterns.push({
      code: avg3.toString(),
      formula: `μ3(${a},${b},${c})=${avg3}`,
      weight: getHypothesisWeightSync('math_sum_3'),
      patternType: 'math_sum_3',
      rawValue: Math.round((a + b + c) / 3),
    });
    
    // Difference cascade: (a-b) - c
    const diffCascade = normalizeToRange(Math.abs((a - b) - c), maxRange);
    patterns.push({
      code: diffCascade.toString(),
      formula: `Δ3|(${a}-${b})-${c}|=${diffCascade}`,
      weight: getHypothesisWeightSync('math_diff_3'),
      patternType: 'math_diff_3',
      rawValue: Math.abs((a - b) - c),
    });
    
    // Sum of all digits
    const allDigits = [...getDigits(a), ...getDigits(b), ...getDigits(c)];
    const totalDigitSum = normalizeToRange(allDigits.reduce((x, y) => x + y, 0), maxRange);
    patterns.push({
      code: totalDigitSum.toString(),
      formula: `ΣDig3(${a},${b},${c})=${totalDigitSum}`,
      weight: getHypothesisWeightSync('math_digit_sum'),
      patternType: 'math_digit_sum',
      rawValue: allDigits.reduce((x, y) => x + y, 0),
    });
    
    // Multiplication of units of 3
    const multUnits3 = normalizeToRange((a % 10) * (b % 10) * (c % 10), maxRange);
    patterns.push({
      code: multUnits3.toString(),
      formula: `×3(${a % 10}*${b % 10}*${c % 10})=${multUnits3}`,
      weight: getHypothesisWeightSync('math_mult'),
      patternType: 'math_mult',
      rawValue: (a % 10) * (b % 10) * (c % 10),
    });
  }
  
  // ========== 4 CONSECUTIVE (if available) ==========
  if (nums.length >= 4) {
    const sum4 = normalizeToRange(nums.reduce((x, y) => x + y, 0), maxRange);
    patterns.push({
      code: sum4.toString(),
      formula: `Σ4(${nums.join('+')})=${sum4}`,
      weight: getHypothesisWeightSync('math_sum_3') * 0.8,
      patternType: 'math_sum_3',
      rawValue: nums.reduce((x, y) => x + y, 0),
    });
  }
  
  // Deduplicate by code, keeping highest weight
  const seen = new Map<string, MathCandidate>();
  for (const p of patterns) {
    const existing = seen.get(p.code);
    if (!existing || existing.weight < p.weight) {
      seen.set(p.code, p);
    }
  }
  
  return Array.from(seen.values()).filter(p => p.weight > 0);
};

// Validate a pattern against actual result
export const validateMathPattern = (
  pattern: MathCandidate,
  actualResult: string
): boolean => {
  const normalizedActual = actualResult.toString().trim();
  const normalizedPredicted = pattern.code.padStart(2, '0');
  
  return normalizedActual === pattern.code || 
         normalizedActual === normalizedPredicted ||
         parseInt(normalizedActual) === parseInt(pattern.code);
};
