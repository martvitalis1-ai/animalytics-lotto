// ============================================================
// ANIMAL ASSOCIATIONS ENGINE - Statistical conditional probabilities
// ADDITIVE MODULE - P(B | A appeared in last N draws)
// NO symbolism, NO narratives, ONLY measured data
// ============================================================

import { getHypothesisWeightSync } from './hypothesisEngine';
import type { PatternType } from './hypothesisEngine';

// Association record
export interface AnimalAssociation {
  animalA: string; // The animal that appeared
  animalB: string; // The animal that might follow
  conditionalProbability: number; // P(B | A)
  occurrences: number; // How many times B followed A
  totalOpportunities: number; // How many times A appeared
  window: 'short' | 'medium' | 'long';
  lastUpdated: string;
}

// Storage key
const ASSOCIATIONS_STORAGE_KEY = 'lottery_animal_associations_v2';

// Window sizes in draws
const WINDOW_SIZES = {
  short: 3,
  medium: 7,
  long: 15,
};

// Load associations from storage
export const loadAssociations = (): Map<string, AnimalAssociation> => {
  try {
    const stored = localStorage.getItem(ASSOCIATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Error loading associations:', e);
  }
  return new Map();
};

// Save associations
export const saveAssociations = (associations: Map<string, AnimalAssociation>): void => {
  try {
    const obj = Object.fromEntries(associations);
    localStorage.setItem(ASSOCIATIONS_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Error saving associations:', e);
  }
};

// Create association key
const makeKey = (animalA: string, animalB: string, window: string): string => {
  return `${animalA}|${animalB}|${window}`;
};

// Calculate associations from history
export const calculateAssociations = (
  history: any[],
  lotteryId: string
): Map<string, AnimalAssociation> => {
  const associations = loadAssociations();
  const now = new Date().toISOString();
  
  // Filter history for this lottery
  const lotteryHistory = history
    .filter(h => h.lottery_type === lotteryId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (lotteryHistory.length < 2) return associations;
  
  // For each window type
  for (const [windowName, windowSize] of Object.entries(WINDOW_SIZES)) {
    const typedWindow = windowName as 'short' | 'medium' | 'long';
    
    // Count occurrences and opportunities
    const opportunities = new Map<string, number>();
    const occurrences = new Map<string, number>();
    
    for (let i = 0; i < lotteryHistory.length - windowSize; i++) {
      const triggerDraw = lotteryHistory[i];
      const animalA = triggerDraw.result_number?.toString().trim();
      
      if (!animalA) continue;
      
      // This is an opportunity for A to predict something
      const oppKey = animalA;
      opportunities.set(oppKey, (opportunities.get(oppKey) || 0) + 1);
      
      // Look in the window after A
      for (let j = i + 1; j <= Math.min(i + windowSize, lotteryHistory.length - 1); j++) {
        const followDraw = lotteryHistory[j];
        const animalB = followDraw.result_number?.toString().trim();
        
        if (!animalB || animalB === animalA) continue;
        
        // Count occurrence of B after A
        const occKey = makeKey(animalA, animalB, windowName);
        occurrences.set(occKey, (occurrences.get(occKey) || 0) + 1);
      }
    }
    
    // Calculate conditional probabilities
    for (const [occKey, count] of occurrences.entries()) {
      const [animalA, animalB] = occKey.split('|');
      const totalOpp = opportunities.get(animalA) || 1;
      const probability = count / (totalOpp * windowSize);
      
      associations.set(occKey, {
        animalA,
        animalB,
        conditionalProbability: probability,
        occurrences: count,
        totalOpportunities: totalOpp,
        window: typedWindow,
        lastUpdated: now,
      });
    }
  }
  
  saveAssociations(associations);
  return associations;
};

// Get candidates based on recent draws
export const getAssociationCandidates = (
  recentNumbers: string[],
  lotteryId: string,
  history: any[]
): Array<{
  code: string;
  probability: number;
  source: string;
  patternType: PatternType;
  weight: number;
}> => {
  const associations = calculateAssociations(history, lotteryId);
  const candidates: Map<string, {
    code: string;
    probability: number;
    source: string;
    patternType: PatternType;
    weight: number;
  }> = new Map();
  
  // For each recent number, find associations
  for (let i = 0; i < Math.min(recentNumbers.length, 5); i++) {
    const animalA = recentNumbers[i];
    
    // Check all windows
    for (const [windowName, _] of Object.entries(WINDOW_SIZES)) {
      const typedWindow = windowName as 'short' | 'medium' | 'long';
      const patternType: PatternType = `animal_association_${typedWindow}`;
      const hypothesisWeight = getHypothesisWeightSync(patternType);
      
      if (hypothesisWeight === 0) continue; // Skip deactivated patterns
      
      // Find all B that follow A in this window
      for (const [key, assoc] of associations.entries()) {
        if (!key.startsWith(`${animalA}|`) || !key.endsWith(`|${windowName}`)) continue;
        
        const existing = candidates.get(assoc.animalB);
        const newWeight = assoc.conditionalProbability * hypothesisWeight;
        
        if (!existing || existing.weight < newWeight) {
          candidates.set(assoc.animalB, {
            code: assoc.animalB,
            probability: assoc.conditionalProbability * 100,
            source: `P(${assoc.animalB}|${animalA}) = ${(assoc.conditionalProbability * 100).toFixed(1)}% [${windowName}]`,
            patternType,
            weight: newWeight,
          });
        }
      }
    }
  }
  
  return Array.from(candidates.values())
    .filter(c => c.weight > 0.01)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);
};

// Update associations with new result
export const recordAssociationResult = (
  predictedAnimals: string[],
  actualAnimal: string,
  triggerAnimal: string
): void => {
  const associations = loadAssociations();
  const now = new Date().toISOString();
  
  for (const windowName of Object.keys(WINDOW_SIZES)) {
    for (const predicted of predictedAnimals) {
      const key = makeKey(triggerAnimal, predicted, windowName);
      const assoc = associations.get(key);
      
      if (assoc) {
        // Update based on hit/miss
        if (predicted === actualAnimal) {
          // Slight boost to probability on hit
          assoc.conditionalProbability = Math.min(1, assoc.conditionalProbability * 1.05);
        }
        assoc.lastUpdated = now;
        associations.set(key, assoc);
      }
    }
  }
  
  saveAssociations(associations);
};

// Get top associations for display
export const getTopAssociations = (
  animalCode: string,
  lotteryId: string,
  history: any[],
  limit: number = 5
): AnimalAssociation[] => {
  const associations = calculateAssociations(history, lotteryId);
  
  return Array.from(associations.values())
    .filter(a => a.animalA === animalCode)
    .sort((a, b) => b.conditionalProbability - a.conditionalProbability)
    .slice(0, limit);
};

// Clear all associations
export const resetAssociations = (): void => {
  localStorage.removeItem(ASSOCIATIONS_STORAGE_KEY);
};
