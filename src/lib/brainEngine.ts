 // ============================================================
 // BRAIN ENGINE V6.0 - Complete PRNG, Float Logic, and Dual Calculation
 // Weighted pseudo-random generator with learned weights
 // Supports: Float rounding, Direct/Decomposition methods, Hour anchoring
 // ============================================================
 
 import { getLearnedWeights, LEARNING_START_DATE, normalizeToRange, getMaxRangeForLottery } from './hypothesisEngine';
 import { getAnimalName, getAnimalEmoji } from './animalData';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface BrainPrediction {
   code: string;
   name: string;
   emoji: string;
   probability: number;
   method: 'direct' | 'decomposition' | 'mixed' | 'prng' | 'hourly_cross';
   formula?: string;
   rawValue?: number;
 }
 
 // Rounding rule: >= 0.5 rounds up, < 0.5 rounds down
 export const smartRound = (num: number): number => {
   const decimal = num - Math.floor(num);
   return decimal >= 0.5 ? Math.ceil(num) : Math.floor(num);
 };
 
 // Extract digits from a number
 const getDigits = (num: number): number[] => {
   return Math.abs(Math.round(num)).toString().split('').map(d => parseInt(d));
 };
 
 // Digital root calculation
 const digitalRoot = (num: number): number => {
   let n = Math.abs(Math.round(num));
   while (n > 9) {
     n = n.toString().split('').reduce((a, d) => a + parseInt(d), 0);
   }
   return n;
 };
 
 // ========== DUAL CALCULATION METHODS ==========
 
 // Method 1: Direct operations (with full numbers)
 export const calculateDirect = (
   nums: number[],
   maxRange: number
 ): BrainPrediction[] => {
   const predictions: BrainPrediction[] = [];
   
   if (nums.length < 2) return predictions;
   
   // Sum of 2
   const sum2 = smartRound(nums[0] + nums[1]);
   const normalized2 = normalizeToRange(sum2, maxRange);
   predictions.push({
     code: normalized2.toString(),
     name: getAnimalName(normalized2.toString()),
     emoji: getAnimalEmoji(normalized2.toString()),
     probability: 0,
     method: 'direct',
     formula: `${nums[0]}+${nums[1]}=${sum2}→${normalized2}`,
     rawValue: sum2
   });
   
   // Difference of 2
   const diff2 = smartRound(Math.abs(nums[0] - nums[1]));
   const normalizedDiff = normalizeToRange(diff2, maxRange);
   predictions.push({
     code: normalizedDiff.toString(),
     name: getAnimalName(normalizedDiff.toString()),
     emoji: getAnimalEmoji(normalizedDiff.toString()),
     probability: 0,
     method: 'direct',
     formula: `|${nums[0]}-${nums[1]}|=${diff2}→${normalizedDiff}`,
     rawValue: diff2
   });
   
   if (nums.length >= 3) {
     // Sum of 3
     const sum3 = smartRound(nums[0] + nums[1] + nums[2]);
     const normalized3 = normalizeToRange(sum3, maxRange);
     predictions.push({
       code: normalized3.toString(),
       name: getAnimalName(normalized3.toString()),
       emoji: getAnimalEmoji(normalized3.toString()),
       probability: 0,
       method: 'direct',
       formula: `${nums[0]}+${nums[1]}+${nums[2]}=${sum3}→${normalized3}`,
       rawValue: sum3
     });
     
     // Average of 3
     const avg3 = smartRound((nums[0] + nums[1] + nums[2]) / 3);
     const normalizedAvg = normalizeToRange(avg3, maxRange);
     predictions.push({
       code: normalizedAvg.toString(),
       name: getAnimalName(normalizedAvg.toString()),
       emoji: getAnimalEmoji(normalizedAvg.toString()),
       probability: 0,
       method: 'direct',
       formula: `(${nums[0]}+${nums[1]}+${nums[2]})/3≈${avg3}→${normalizedAvg}`,
       rawValue: avg3
     });
   }
   
   return predictions;
 };
 
 // Method 2: Decomposition (digit operations)
 export const calculateDecomposition = (
   nums: number[],
   maxRange: number
 ): BrainPrediction[] => {
   const predictions: BrainPrediction[] = [];
   
   if (nums.length < 1) return predictions;
   
   for (const num of nums.slice(0, 3)) {
     const digits = getDigits(num);
     
     // Sum of digits
     const digitSum = digits.reduce((a, b) => a + b, 0);
     const normalizedSum = normalizeToRange(digitSum, maxRange);
     predictions.push({
       code: normalizedSum.toString(),
       name: getAnimalName(normalizedSum.toString()),
       emoji: getAnimalEmoji(normalizedSum.toString()),
       probability: 0,
       method: 'decomposition',
       formula: `Σ(${digits.join('+')})=${digitSum}→${normalizedSum}`,
       rawValue: digitSum
     });
     
     // Difference of digits (if 2+ digits)
     if (digits.length >= 2) {
       const digitDiff = Math.abs(digits[0] - digits[1]);
       const normalizedDiff = normalizeToRange(digitDiff, maxRange);
       predictions.push({
         code: normalizedDiff.toString(),
         name: getAnimalName(normalizedDiff.toString()),
         emoji: getAnimalEmoji(normalizedDiff.toString()),
         probability: 0,
         method: 'decomposition',
         formula: `|${digits[0]}-${digits[1]}|=${digitDiff}`,
         rawValue: digitDiff
       });
     }
     
     // Digital root
     const root = digitalRoot(num);
     predictions.push({
       code: root.toString(),
       name: getAnimalName(root.toString()),
       emoji: getAnimalEmoji(root.toString()),
       probability: 0,
       method: 'decomposition',
       formula: `√Dig(${num})=${root}`,
       rawValue: root
     });
   }
   
   return predictions;
 };
 
 // Method 3: Mixed (combines direct and decomposition)
 export const calculateMixed = (
   nums: number[],
   maxRange: number
 ): BrainPrediction[] => {
   const predictions: BrainPrediction[] = [];
   
   if (nums.length < 2) return predictions;
   
   // Example: 10 (direct) + 6 (decomposition of 28) + 3 (direct)
   const a = nums[0];
   const b = nums[1] || 0;
   const c = nums[2] || 0;
   
   // Decomposition of B
   const digitsB = getDigits(b);
   const decompB = digitsB.length >= 2 ? Math.abs(digitsB[0] - digitsB[1]) : digitsB[0] || 0;
   
   // Mixed: A + decomp(B)
   const mixed1 = smartRound(a + decompB);
   const normalizedMixed1 = normalizeToRange(mixed1, maxRange);
   predictions.push({
     code: normalizedMixed1.toString(),
     name: getAnimalName(normalizedMixed1.toString()),
     emoji: getAnimalEmoji(normalizedMixed1.toString()),
     probability: 0,
     method: 'mixed',
     formula: `${a}+decomp(${b})=${a}+${decompB}=${mixed1}→${normalizedMixed1}`,
     rawValue: mixed1
   });
   
   if (nums.length >= 3) {
     // Mixed: A + decomp(B) + C
     const mixed2 = smartRound(a + decompB + c);
     const normalizedMixed2 = normalizeToRange(mixed2, maxRange);
     predictions.push({
       code: normalizedMixed2.toString(),
       name: getAnimalName(normalizedMixed2.toString()),
       emoji: getAnimalEmoji(normalizedMixed2.toString()),
       probability: 0,
       method: 'mixed',
       formula: `${a}+decomp(${b})+${c}=${a}+${decompB}+${c}=${mixed2}→${normalizedMixed2}`,
       rawValue: mixed2
     });
     
     // Decomposition of A + direct B + decomposition of C
     const digitsA = getDigits(a);
     const decompA = digitsA.reduce((x, y) => x + y, 0);
     const digitsC = getDigits(c);
     const decompC = digitsC.reduce((x, y) => x + y, 0);
     
     const mixed3 = smartRound(decompA + b + decompC);
     const normalizedMixed3 = normalizeToRange(mixed3, maxRange);
     predictions.push({
       code: normalizedMixed3.toString(),
       name: getAnimalName(normalizedMixed3.toString()),
       emoji: getAnimalEmoji(normalizedMixed3.toString()),
       probability: 0,
       method: 'mixed',
       formula: `decomp(${a})+${b}+decomp(${c})=${decompA}+${b}+${decompC}=${mixed3}→${normalizedMixed3}`,
       rawValue: mixed3
     });
   }
   
   return predictions;
 };
 
 // ========== HOURLY CROSS ANCHORING ==========
 // Cross each hour with ALL subsequent hours
 export const calculateHourlyCross = (
   hourlyResults: { time: string; number: number }[],
   maxRange: number
 ): BrainPrediction[] => {
   const predictions: BrainPrediction[] = [];
   
   // Sort by time
   const sorted = [...hourlyResults].sort((a, b) => {
     const timeA = a.time.replace(/\s*(AM|PM)/i, '');
     const timeB = b.time.replace(/\s*(AM|PM)/i, '');
     return timeA.localeCompare(timeB);
   });
   
   // Cross each hour with all subsequent hours
   for (let i = 0; i < sorted.length - 1; i++) {
     for (let j = i + 1; j < sorted.length; j++) {
       const a = sorted[i];
       const b = sorted[j];
       
       // Sum
       const sum = smartRound(a.number + b.number);
       const normalizedSum = normalizeToRange(sum, maxRange);
       predictions.push({
         code: normalizedSum.toString(),
         name: getAnimalName(normalizedSum.toString()),
         emoji: getAnimalEmoji(normalizedSum.toString()),
         probability: 0,
         method: 'hourly_cross',
         formula: `${a.time}+${b.time}: ${a.number}+${b.number}=${sum}→${normalizedSum}`,
         rawValue: sum
       });
       
       // Difference
       const diff = smartRound(Math.abs(a.number - b.number));
       const normalizedDiff = normalizeToRange(diff, maxRange);
       predictions.push({
         code: normalizedDiff.toString(),
         name: getAnimalName(normalizedDiff.toString()),
         emoji: getAnimalEmoji(normalizedDiff.toString()),
         probability: 0,
         method: 'hourly_cross',
         formula: `${a.time}+${b.time}: |${a.number}-${b.number}|=${diff}→${normalizedDiff}`,
         rawValue: diff
       });
     }
   }
   
   return predictions;
 };
 
 // ========== WEIGHTED PRNG ENGINE ==========
 // Seed: last results. Weighted by historical frequency and learned weights.
 export const generateWeightedPRNG = async (
   recentResults: string[],
   lotteryId: string,
   history: any[],
   count: number = 5
 ): Promise<BrainPrediction[]> => {
   const maxRange = getMaxRangeForLottery(lotteryId);
   
   // Load learned weights from Supabase
   const learnedWeights = await getLearnedWeights(lotteryId);
   
   // Calculate frequency map from history since LEARNING_START_DATE
   const frequencyMap: Record<string, number> = {};
   const filteredHistory = history.filter(h => 
     h.lottery_type === lotteryId && h.draw_date >= LEARNING_START_DATE
   );
   
   for (const result of filteredHistory) {
     const num = result.result_number?.toString().trim();
     if (num) {
       frequencyMap[num] = (frequencyMap[num] || 0) + 1;
     }
   }
   
   // Calculate max frequency for normalization
   const maxFreq = Math.max(...Object.values(frequencyMap), 1);
   
   // Build weighted pool
   const weightedPool: string[] = [];
   
   for (let i = 0; i <= maxRange; i++) {
     const code = i.toString();
     const freq = frequencyMap[code] || 0;
     const freqWeight = freq / maxFreq;
     
     // Apply learned pattern weights
     let patternBoost = 1;
     for (const [pattern, weight] of Object.entries(learnedWeights)) {
       patternBoost += (weight - 0.5) * 0.2; // Slight boost based on pattern performance
     }
     
     // Higher frequency = more entries in pool
     const poolCount = Math.max(1, Math.round(freqWeight * patternBoost * 10));
     for (let j = 0; j < poolCount; j++) {
       weightedPool.push(code);
     }
   }
   
   // Create seed from recent results
   const seedValue = recentResults.slice(0, 4).reduce((acc, r) => {
     return acc + (parseInt(r) || 0);
   }, Date.now() % 10000);
   
   // Simple seeded PRNG (LCG)
   let seed = seedValue;
   const nextRandom = () => {
     seed = (seed * 1103515245 + 12345) % 2147483648;
     return seed / 2147483648;
   };
   
   // Pick unique numbers
   const selected = new Set<string>();
   const predictions: BrainPrediction[] = [];
   
   while (predictions.length < count && predictions.length < maxRange) {
     const idx = Math.floor(nextRandom() * weightedPool.length);
     const code = weightedPool[idx];
     
     if (!selected.has(code)) {
       selected.add(code);
       const freq = frequencyMap[code] || 0;
       const probability = Math.min(98, Math.max(35, 35 + (freq / maxFreq) * 63));
       
       predictions.push({
         code,
         name: getAnimalName(code),
         emoji: getAnimalEmoji(code),
         probability: smartRound(probability),
         method: 'prng',
         formula: `PRNG(seed=${seedValue.toString().slice(-4)})`,
         rawValue: freq
       });
     }
   }
   
   return predictions.sort((a, b) => b.probability - a.probability);
 };
 
 // ========== REPETITION LOGIC (X-X → X-X → Z) ==========
 // If pattern X-X→X-X appears, find most frequent third element Z
 export const findRepetitionPattern = (
   history: any[],
   lotteryId: string
 ): BrainPrediction | null => {
   const maxRange = getMaxRangeForLottery(lotteryId);
   const filteredHistory = history.filter(h => 
     h.lottery_type === lotteryId && h.draw_date >= LEARNING_START_DATE
   );
   
   if (filteredHistory.length < 4) return null;
   
   // Get last 4 results
   const last4 = filteredHistory.slice(0, 4).map(h => h.result_number?.toString().trim());
   
   // Check for X-X pattern in positions 0-1 and 2-3
   if (last4[0] === last4[1] && last4[2] === last4[3]) {
     // Count what comes after X-X→X-X pattern historically
     const zCounts: Record<string, number> = {};
     
     for (let i = 0; i < filteredHistory.length - 4; i++) {
       const a = filteredHistory[i].result_number?.toString().trim();
       const b = filteredHistory[i + 1].result_number?.toString().trim();
       const c = filteredHistory[i + 2].result_number?.toString().trim();
       const d = filteredHistory[i + 3].result_number?.toString().trim();
       const z = filteredHistory[i + 4]?.result_number?.toString().trim();
       
       if (a === b && c === d && z) {
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
         method: 'prng',
         formula: `Patrón X-X→X-X detectado → Z=${maxZ}`,
         rawValue: maxCount
       };
     }
   }
   
   return null;
 };
 
 // ========== MASTER BRAIN FUNCTION ==========
 // Combines all methods and returns top predictions
 export const generateBrainPredictions = async (
   lotteryId: string,
   history: any[],
   count: number = 5
 ): Promise<BrainPrediction[]> => {
   const maxRange = getMaxRangeForLottery(lotteryId);
   const filteredHistory = history.filter(h => 
     h.lottery_type === lotteryId && h.draw_date >= LEARNING_START_DATE
   );
   
   if (filteredHistory.length < 3) return [];
   
   // Get recent numbers
   const recentNumbers = filteredHistory.slice(0, 4).map(h => 
     parseInt(h.result_number) || 0
   );
   const recentStrings = filteredHistory.slice(0, 4).map(h => 
     h.result_number?.toString().trim()
   );
   
   // Collect all predictions
   let allPredictions: BrainPrediction[] = [];
   
   // 1. Direct calculations
   allPredictions.push(...calculateDirect(recentNumbers, maxRange));
   
   // 2. Decomposition calculations
   allPredictions.push(...calculateDecomposition(recentNumbers, maxRange));
   
   // 3. Mixed calculations
   allPredictions.push(...calculateMixed(recentNumbers, maxRange));
   
   // 4. Weighted PRNG
   const prngPredictions = await generateWeightedPRNG(recentStrings, lotteryId, history, count);
   allPredictions.push(...prngPredictions);
   
   // 5. Check for repetition pattern
   const repetitionPred = findRepetitionPattern(history, lotteryId);
   if (repetitionPred) {
     allPredictions.push(repetitionPred);
   }
   
   // 6. Hourly cross (if we have today's results)
   const today = new Date().toISOString().split('T')[0];
   const todayResults = filteredHistory.filter(h => h.draw_date === today);
   if (todayResults.length >= 2) {
     const hourlyData = todayResults.map(h => ({
       time: h.draw_time,
       number: parseInt(h.result_number) || 0
     }));
     allPredictions.push(...calculateHourlyCross(hourlyData, maxRange));
   }
   
   // Deduplicate and weight by frequency of appearance
   const codeScores: Record<string, { pred: BrainPrediction; score: number }> = {};
   
   for (const pred of allPredictions) {
     if (!codeScores[pred.code]) {
       codeScores[pred.code] = { pred, score: 1 };
     } else {
       codeScores[pred.code].score++;
       // Keep highest probability
       if (pred.probability > codeScores[pred.code].pred.probability) {
         codeScores[pred.code].pred = pred;
       }
     }
   }
   
   // Calculate final probabilities
   const maxScore = Math.max(...Object.values(codeScores).map(c => c.score), 1);
   const finalPredictions: BrainPrediction[] = Object.values(codeScores).map(({ pred, score }) => ({
     ...pred,
     probability: Math.min(98, Math.max(35, smartRound(35 + (score / maxScore) * 63)))
   }));
   
   // Sort by probability and return top N
   return finalPredictions
     .sort((a, b) => b.probability - a.probability)
     .slice(0, count);
 };