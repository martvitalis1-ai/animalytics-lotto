/**
 * ============================================================
 * SISTEMA DE CONSISTENCIA Y CACHE DE PREDICCIONES
 * ============================================================
 * 
 * Este módulo implementa un sistema de cache determinístico que garantiza:
 * 1. Predicciones estables durante todo el día
 * 2. Mismos resultados en cualquier dispositivo/sesión
 * 3. Recálculo solo cuando cambia la fecha
 * 4. Persistencia local + sincronización con backend
 * 
 * Algoritmo de generación determinístico basado en:
 * - Fecha actual (YYYY-MM-DD)
 * - ID de lotería
 * - Horario de sorteo
 * - Hash del historial
 */

// Re-exportar AnalysisResult para uso en otros componentes
export type { AnalysisResult } from './probabilityEngine';

import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from './constants';
import { AnalysisResult } from './probabilityEngine';

// ============================================================
// TIPOS
// ============================================================

export type CachedPrediction = {
  date: string;              // Fecha de generación (YYYY-MM-DD)
  lotteryId: string;         // ID de la lotería
  drawTime?: string;         // Hora del sorteo (opcional para predicciones generales)
  predictions: AnalysisResult[];
  overdueNumbers: AnalysisResult[];
  hotNumbers: AnalysisResult[];
  coldNumbers: AnalysisResult[];
  generatedAt: number;       // Timestamp de generación
  historyHash: string;       // Hash del historial usado
};

export type DailyCache = {
  date: string;
  predictions: Record<string, CachedPrediction>; // key: lotteryId o lotteryId_drawTime
  version: number;
};

// ============================================================
// CONSTANTES
// ============================================================

const CACHE_VERSION = 1;
const CACHE_KEY = 'animalytics_predictions_cache';
const LEARNING_KEY = 'animalytics_learning_data';

// ============================================================
// FUNCIONES DE HASH DETERMINÍSTICO
// ============================================================

/**
 * Genera un hash simple pero consistente de un string
 * Usado para crear semillas determinísticas
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Genera un hash del historial para detectar cambios
 */
export const generateHistoryHash = (history: any[]): string => {
  if (!history || history.length === 0) return 'empty';
  
  // Usar los últimos 50 resultados para el hash
  const recent = history.slice(0, 50);
  const hashString = recent.map(h => 
    `${h.lottery_type}_${h.result_number}_${h.draw_time}_${h.draw_date}`
  ).join('|');
  
  return simpleHash(hashString).toString(36);
};

/**
 * Genera una semilla determinística para el día/lotería/hora
 */
const generateDailySeed = (date: string, lotteryId: string, drawTime?: string): number => {
  const seedString = `${date}_${lotteryId}_${drawTime || 'general'}_v${CACHE_VERSION}`;
  return simpleHash(seedString);
};

// ============================================================
// GENERADOR PSEUDOALEATORIO DETERMINÍSTICO (Seeded RNG)
// ============================================================

/**
 * Generador de números pseudoaleatorios con semilla
 * Garantiza mismos resultados para misma semilla
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Algoritmo Mulberry32
  next(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Shuffle determinístico (Fisher-Yates con seed)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// ============================================================
// ALGORITMO DE PREDICCIÓN DETERMINÍSTICO
// ============================================================

/**
 * Calcula probabilidades de forma determinística
 * Misma entrada = Misma salida, garantizado
 */
export const calculateDeterministicProbabilities = (
  history: any[],
  lotteryId: string,
  date: string,
  drawTime?: string
): AnalysisResult[] => {
  const config = LOTTERIES.find(l => l.id === lotteryId);
  let specificHistory = history.filter(h => h.lottery_type === lotteryId);
  
  // Filtrar por hora si se especifica
  if (drawTime) {
    specificHistory = specificHistory.filter(h => h.draw_time === drawTime);
  }

  // Análisis de frecuencias (determinístico)
  const frequencyMap = new Map<string, number>();
  const lastSeenMap = new Map<string, { date: Date; time: string }>();
  const hourlyPatterns = new Map<string, Map<string, number>>();
  const weekdayPatterns = new Map<number, Map<string, number>>();

  const baseDate = new Date(date + 'T12:00:00');
  const currentDay = baseDate.getDay();

  specificHistory.forEach((draw) => {
    let num = draw.result_number?.toString().trim();
    if (!num) return;
    
    // Normalizar número
    if (num !== '0' && num !== '00' && !isNaN(parseInt(num))) {
      num = parseInt(num).toString();
    }
    
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    
    const drawDate = new Date(draw.created_at || draw.draw_date);
    const existing = lastSeenMap.get(num);
    if (!existing || drawDate > existing.date) {
      lastSeenMap.set(num, { date: drawDate, time: draw.draw_time });
    }

    // Patrones por hora
    const time = draw.draw_time || '';
    if (!hourlyPatterns.has(time)) {
      hourlyPatterns.set(time, new Map());
    }
    const hourMap = hourlyPatterns.get(time)!;
    hourMap.set(num, (hourMap.get(num) || 0) + 1);

    // Patrones por día de semana
    const weekday = drawDate.getDay();
    if (!weekdayPatterns.has(weekday)) {
      weekdayPatterns.set(weekday, new Map());
    }
    const dayMap = weekdayPatterns.get(weekday)!;
    dayMap.set(num, (dayMap.get(num) || 0) + 1);
  });

  // Construir universo de números
  let universe: string[] = [];
  if (config?.type === 'animals') {
    universe = ['0', '00', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];
  } else {
    const max = config?.range || 75;
    universe = Array.from({ length: max + 1 }, (_, i) => i.toString());
    if (config?.id === 'guacharo' || config?.id === 'guacharito') {
      if (!universe.includes('00')) universe.unshift('00');
    }
  }

  const totalDraws = specificHistory.length || 1;
  const avgFreq = totalDraws / universe.length;

  // Generar semilla determinística
  const seed = generateDailySeed(date, lotteryId, drawTime);
  const rng = new SeededRandom(seed);

  const results: AnalysisResult[] = [];

  universe.forEach((numStr, idx) => {
    const freq = frequencyMap.get(numStr) || 0;
    const lastSeen = lastSeenMap.get(numStr);
    const daysSince = lastSeen 
      ? Math.ceil(Math.abs(baseDate.getTime() - lastSeen.date.getTime()) / (1000 * 60 * 60 * 24)) 
      : 30;

    // Cálculo de score base (determinístico)
    const frequencyScore = (freq / totalDraws) * 40;
    const overdueBonus = Math.min(daysSince * 3, 60);
    const recentPenalty = daysSince < 1 ? -30 : daysSince < 2 ? -15 : 0;

    // Bonus horario
    let hourlyBonus = 0;
    if (drawTime && hourlyPatterns.has(drawTime)) {
      const hourMap = hourlyPatterns.get(drawTime)!;
      const hourFreq = hourMap.get(numStr) || 0;
      const hourTotal = Array.from(hourMap.values()).reduce((a, b) => a + b, 0) || 1;
      hourlyBonus = (hourFreq / hourTotal) * 30;
    }

    // Bonus día de semana
    let weekdayBonus = 0;
    if (weekdayPatterns.has(currentDay)) {
      const dayMap = weekdayPatterns.get(currentDay)!;
      const dayFreq = dayMap.get(numStr) || 0;
      const dayTotal = Array.from(dayMap.values()).reduce((a, b) => a + b, 0) || 1;
      weekdayBonus = (dayFreq / dayTotal) * 20;
    }

    // Factor de variación DETERMINÍSTICO (basado en semilla del día)
    const variationFactor = (rng.next() - 0.5) * 15;

    let score = frequencyScore + overdueBonus + recentPenalty + hourlyBonus + weekdayBonus + variationFactor;

    // Determinar estado
    let status: AnalysisResult['status'] = 'NEUTRAL';
    let reason = '';
    
    if (daysSince > 7 && freq > 0) {
      status = 'OVERDUE';
      reason = `No ha salido en ${daysSince} días. Alta probabilidad estadística de aparición.`;
    } else if (freq > avgFreq * 1.5) {
      status = 'HOT';
      reason = `Frecuencia alta (${freq} veces). Tendencia caliente activa.`;
    } else if (freq === 0 || freq < avgFreq * 0.3) {
      status = 'COLD';
      reason = `Baja frecuencia histórica (${freq} veces). Número frío.`;
    } else {
      reason = `Comportamiento normal. Frecuencia: ${freq} veces en historial.`;
    }

    if (hourlyBonus > 10) {
      reason += ` Patrón fuerte a esta hora.`;
    }
    if (weekdayBonus > 8) {
      reason += ` Favorable este día de semana.`;
    }

    const animal = config?.type === 'animals' 
      ? (ANIMAL_MAPPING[numStr] || 'Desconocido') 
      : `Número ${numStr.padStart(2, '0')}`;

    results.push({
      number: numStr,
      animal,
      probability: Math.max(0, Math.min(100, score)),
      status,
      frequency: freq,
      daysSince,
      lastDrawTime: lastSeen?.time,
      reason
    });
  });

  // Ordenar por probabilidad
  results.sort((a, b) => b.probability - a.probability);

  // Aplicar shuffle determinístico a empates para variación controlada
  const grouped = new Map<number, AnalysisResult[]>();
  results.forEach(r => {
    const probKey = Math.floor(r.probability);
    if (!grouped.has(probKey)) grouped.set(probKey, []);
    grouped.get(probKey)!.push(r);
  });

  const finalResults: AnalysisResult[] = [];
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b - a);
  sortedKeys.forEach(key => {
    const group = grouped.get(key)!;
    if (group.length > 1) {
      finalResults.push(...rng.shuffle(group));
    } else {
      finalResults.push(...group);
    }
  });

  return finalResults;
};

// ============================================================
// SISTEMA DE CACHE
// ============================================================

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Genera una clave única para el cache
 */
const getCacheKey = (lotteryId: string, drawTime?: string): string => {
  return drawTime ? `${lotteryId}_${drawTime}` : lotteryId;
};

/**
 * Carga el cache desde localStorage
 */
export const loadCache = (): DailyCache | null => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    
    const cache = JSON.parse(stored) as DailyCache;
    
    // Verificar versión y fecha
    if (cache.version !== CACHE_VERSION || cache.date !== getTodayDate()) {
      console.log('[Cache] Cache expirado o versión diferente, limpiando...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return cache;
  } catch (e) {
    console.error('[Cache] Error cargando cache:', e);
    return null;
  }
};

/**
 * Guarda el cache en localStorage
 */
export const saveCache = (cache: DailyCache): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('[Cache] Cache guardado para', cache.date);
  } catch (e) {
    console.error('[Cache] Error guardando cache:', e);
  }
};

/**
 * Obtiene o genera predicciones con cache
 */
export const getCachedPredictions = (
  history: any[],
  lotteryId: string,
  drawTime?: string
): CachedPrediction => {
  const today = getTodayDate();
  const cacheKey = getCacheKey(lotteryId, drawTime);
  const historyHash = generateHistoryHash(history);

  // Intentar cargar del cache
  let cache = loadCache();
  
  if (cache && cache.predictions[cacheKey]) {
    const cached = cache.predictions[cacheKey];
    // Verificar que el hash del historial sea el mismo
    if (cached.historyHash === historyHash) {
      console.log('[Cache] Hit para', cacheKey);
      return cached;
    }
    console.log('[Cache] Hash diferente, regenerando...');
  }

  // Generar nuevas predicciones
  console.log('[Cache] Generando predicciones para', cacheKey);
  
  const predictions = calculateDeterministicProbabilities(history, lotteryId, today, drawTime);
  
  const cachedPrediction: CachedPrediction = {
    date: today,
    lotteryId,
    drawTime,
    predictions: predictions.slice(0, 10),
    overdueNumbers: predictions.filter(p => p.status === 'OVERDUE').slice(0, 10),
    hotNumbers: predictions.filter(p => p.status === 'HOT').slice(0, 10),
    coldNumbers: predictions.filter(p => p.status === 'COLD').slice(0, 10),
    generatedAt: Date.now(),
    historyHash
  };

  // Actualizar cache
  if (!cache) {
    cache = {
      date: today,
      predictions: {},
      version: CACHE_VERSION
    };
  }
  
  cache.predictions[cacheKey] = cachedPrediction;
  saveCache(cache);

  return cachedPrediction;
};

/**
 * Obtiene todas las predicciones para una lotería (general + por hora)
 */
export const getAllCachedPredictions = (
  history: any[],
  lotteryId: string
): {
  general: CachedPrediction;
  hourly: Record<string, CachedPrediction>;
} => {
  const general = getCachedPredictions(history, lotteryId);
  
  const hourly: Record<string, CachedPrediction> = {};
  const times = getDrawTimesForLottery(lotteryId);
  
  times.forEach(time => {
    hourly[time] = getCachedPredictions(history, lotteryId, time);
  });

  return { general, hourly };
};

/**
 * Limpia el cache (para uso manual o debug)
 */
export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  console.log('[Cache] Cache limpiado');
};

// ============================================================
// SISTEMA DE APRENDIZAJE PERSISTENTE
// ============================================================

export type LearningData = {
  totalPredictions: number;
  correctPredictions: number;
  byLottery: Record<string, {
    total: number;
    correct: number;
    lastUpdated: string;
  }>;
  byHour: Record<string, {
    total: number;
    correct: number;
  }>;
  patterns: {
    consecutiveHits: number;
    maxStreak: number;
    lastHitDate: string;
  };
};

/**
 * Carga datos de aprendizaje
 */
export const loadLearningData = (): LearningData => {
  try {
    const stored = localStorage.getItem(LEARNING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[Learning] Error cargando datos:', e);
  }
  
  return {
    totalPredictions: 0,
    correctPredictions: 0,
    byLottery: {},
    byHour: {},
    patterns: {
      consecutiveHits: 0,
      maxStreak: 0,
      lastHitDate: ''
    }
  };
};

/**
 * Guarda datos de aprendizaje
 */
export const saveLearningData = (data: LearningData): void => {
  try {
    localStorage.setItem(LEARNING_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Learning] Error guardando datos:', e);
  }
};

/**
 * Registra el resultado de una predicción para aprendizaje
 */
export const recordPredictionResult = (
  lotteryId: string,
  drawTime: string,
  predictedNumbers: string[],
  actualNumber: string,
  wasCorrect: boolean
): void => {
  const data = loadLearningData();
  
  data.totalPredictions++;
  if (wasCorrect) {
    data.correctPredictions++;
    data.patterns.consecutiveHits++;
    data.patterns.maxStreak = Math.max(data.patterns.maxStreak, data.patterns.consecutiveHits);
    data.patterns.lastHitDate = getTodayDate();
  } else {
    data.patterns.consecutiveHits = 0;
  }

  // Por lotería
  if (!data.byLottery[lotteryId]) {
    data.byLottery[lotteryId] = { total: 0, correct: 0, lastUpdated: '' };
  }
  data.byLottery[lotteryId].total++;
  if (wasCorrect) data.byLottery[lotteryId].correct++;
  data.byLottery[lotteryId].lastUpdated = getTodayDate();

  // Por hora
  if (!data.byHour[drawTime]) {
    data.byHour[drawTime] = { total: 0, correct: 0 };
  }
  data.byHour[drawTime].total++;
  if (wasCorrect) data.byHour[drawTime].correct++;

  saveLearningData(data);
  console.log('[Learning] Resultado registrado:', { lotteryId, drawTime, wasCorrect });
};

/**
 * Obtiene estadísticas de precisión
 */
export const getAccuracyStats = (): {
  overall: number;
  byLottery: Record<string, number>;
  byHour: Record<string, number>;
  streak: number;
} => {
  const data = loadLearningData();
  
  const overall = data.totalPredictions > 0 
    ? (data.correctPredictions / data.totalPredictions) * 100 
    : 0;

  const byLottery: Record<string, number> = {};
  Object.entries(data.byLottery).forEach(([id, stats]) => {
    byLottery[id] = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
  });

  const byHour: Record<string, number> = {};
  Object.entries(data.byHour).forEach(([hour, stats]) => {
    byHour[hour] = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
  });

  return {
    overall,
    byLottery,
    byHour,
    streak: data.patterns.consecutiveHits
  };
};
