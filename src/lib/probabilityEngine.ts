import { LOTTERIES, ANIMAL_MAPPING } from './constants';

export type AnalysisResult = {
  number: string;
  animal: string;
  probability: number;
  status: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL';
  frequency: number;
  daysSince: number;
  lastDrawTime?: string;
  reason?: string; // Explicación de por qué se predice
};

export type HourlyAnalysis = {
  time: string;
  predictions: AnalysisResult[];
  overdue: AnalysisResult[];
  hot: AnalysisResult[];
  cold: AnalysisResult[];
};

// Algoritmo avanzado de probabilidades con variación temporal
export const calculateProbabilities = (history: any[], lotteryId: string, drawTime?: string): AnalysisResult[] => {
  const config = LOTTERIES.find(l => l.id === lotteryId);
  let specificHistory = history.filter(h => h.lottery_type === lotteryId);
  
  // Si se especifica hora, filtrar también por hora
  if (drawTime) {
    specificHistory = specificHistory.filter(h => h.draw_time === drawTime);
  }
  
  const frequencyMap = new Map<string, number>();
  const lastSeenMap = new Map<string, { date: Date; time: string }>();
  const hourlyPatterns = new Map<string, Map<string, number>>();
  const weekdayPatterns = new Map<number, Map<string, number>>();
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Calcular patrones temporales
  specificHistory.forEach((draw) => {
    let num = draw.result_number?.toString().trim();
    if (!num) return;
    
    // Normalizar número: mantener "0" como "0" y "00" como "00"
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

  const results: AnalysisResult[] = [];
  let universe: string[] = [];

  if (config?.type === 'animals') {
    // Incluir tanto "0" como "00" para loterías de animales
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
  
  // Agregar factor de aleatoriedad basado en tiempo actual
  const timeSeed = Date.now() + (drawTime ? drawTime.charCodeAt(0) * 1000 : 0);

  universe.forEach((numStr, idx) => {
    const freq = frequencyMap.get(numStr) || 0;
    const lastSeen = lastSeenMap.get(numStr);
    let daysSince = lastSeen 
      ? Math.ceil(Math.abs(now.getTime() - lastSeen.date.getTime()) / (1000 * 60 * 60 * 24)) 
      : 30;

    // Algoritmo de probabilidad mejorado con múltiples factores
    const frequencyScore = (freq / totalDraws) * 40;
    const overdueBonus = Math.min(daysSince * 3, 60);
    const recentPenalty = daysSince < 1 ? -30 : daysSince < 2 ? -15 : 0;
    
    // Bonus por patrones horarios
    let hourlyBonus = 0;
    if (drawTime && hourlyPatterns.has(drawTime)) {
      const hourMap = hourlyPatterns.get(drawTime)!;
      const hourFreq = hourMap.get(numStr) || 0;
      const hourTotal = Array.from(hourMap.values()).reduce((a, b) => a + b, 0) || 1;
      hourlyBonus = (hourFreq / hourTotal) * 30;
    }

    // Bonus por día de semana
    let weekdayBonus = 0;
    if (weekdayPatterns.has(currentDay)) {
      const dayMap = weekdayPatterns.get(currentDay)!;
      const dayFreq = dayMap.get(numStr) || 0;
      const dayTotal = Array.from(dayMap.values()).reduce((a, b) => a + b, 0) || 1;
      weekdayBonus = (dayFreq / dayTotal) * 20;
    }

    // Factor de variación para evitar predicciones iguales
    const variationFactor = Math.sin((timeSeed + idx * 12345) / 10000) * 10;
    
    let score = frequencyScore + overdueBonus + recentPenalty + hourlyBonus + weekdayBonus + variationFactor;

    // Determinar estado
    let status: AnalysisResult['status'] = 'NEUTRAL';
    let reason = '';
    
    if (daysSince > 7 && freq > 0) {
      status = 'OVERDUE';
      reason = `No sale desde hace ${daysSince} días, probabilidad de aparición alta`;
    } else if (freq > avgFreq * 1.5) {
      status = 'HOT';
      reason = `Frecuencia alta (${freq} veces), tendencia caliente`;
    } else if (freq === 0 || freq < avgFreq * 0.3) {
      status = 'COLD';
      reason = `Baja frecuencia histórica, número frío`;
    } else {
      reason = `Comportamiento normal, frecuencia ${freq} veces`;
    }

    if (hourlyBonus > 10) {
      reason += `. Patrón fuerte a esta hora`;
    }
    if (weekdayBonus > 8) {
      reason += `. Favorable este día de semana`;
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

  return results.sort((a, b) => b.probability - a.probability);
};

// Predicciones horarias específicas
export const generateHourlyPredictions = (history: any[], lotteryId: string, drawTime: string): AnalysisResult[] => {
  return calculateProbabilities(history, lotteryId, drawTime).slice(0, 5);
};

// Análisis completo por hora
export const getHourlyAnalysis = (history: any[], lotteryId: string, drawTime: string): HourlyAnalysis => {
  const predictions = calculateProbabilities(history, lotteryId, drawTime);
  
  return {
    time: drawTime,
    predictions: predictions.slice(0, 5),
    overdue: predictions.filter(p => p.status === 'OVERDUE').slice(0, 5),
    hot: predictions.filter(p => p.status === 'HOT').slice(0, 5),
    cold: predictions.filter(p => p.status === 'COLD').slice(0, 5)
  };
};

// Obtener números vencidos (no han salido en X días)
export const getOverdueNumbers = (history: any[], lotteryId: string, daysThreshold: number = 7): AnalysisResult[] => {
  const predictions = calculateProbabilities(history, lotteryId);
  return predictions.filter(p => p.daysSince >= daysThreshold && p.frequency > 0)
    .sort((a, b) => b.daysSince - a.daysSince);
};

// Fórmulas matemáticas cruzadas para predicción
export const calculateCrossFormulas = (lastResults: string[]): { number: string; formula: string }[] => {
  const results: { number: string; formula: string }[] = [];
  
  if (lastResults.length < 2) return results;

  // Reducción digital de cada número
  const digitalRoots = lastResults.map(n => {
    const num = parseInt(n);
    let root = num;
    while (root > 36) {
      root = root.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return root;
  });

  // Suma de dígitos individuales
  lastResults.forEach((n, i) => {
    const digits = n.split('').map(d => parseInt(d));
    const sum = digits.reduce((a, b) => a + b, 0);
    if (sum <= 36) {
      results.push({ number: sum.toString(), formula: `Suma dígitos de ${n}: ${digits.join('+')}=${sum}` });
    }
  });

  // Suma cruzada entre números
  for (let i = 0; i < lastResults.length - 1; i++) {
    const a = parseInt(lastResults[i]);
    const b = parseInt(lastResults[i + 1]);
    
    // Suma de raíces digitales
    const rootSum = (digitalRoots[i] + digitalRoots[i + 1]) % 37;
    results.push({ 
      number: rootSum.toString(), 
      formula: `Raíz(${lastResults[i]})+Raíz(${lastResults[i+1]})=${digitalRoots[i]}+${digitalRoots[i+1]}=${rootSum}` 
    });

    // Resta
    const diff = Math.abs(a - b);
    if (diff <= 36) {
      results.push({ number: diff.toString(), formula: `|${a}-${b}|=${diff}` });
    }

    // Suma módulo 37
    const sumMod = (a + b) % 37;
    results.push({ number: sumMod.toString(), formula: `(${a}+${b}) mod 37=${sumMod}` });
  }

  // Suma de todos
  const totalSum = lastResults.reduce((a, b) => a + parseInt(b), 0);
  const totalMod = totalSum % 37;
  results.push({ number: totalMod.toString(), formula: `Suma total mod 37: ${totalSum}%37=${totalMod}` });

  // Promedio
  const avg = Math.round(totalSum / lastResults.length);
  if (avg <= 36) {
    results.push({ number: avg.toString(), formula: `Promedio: ${totalSum}/${lastResults.length}≈${avg}` });
  }

  // Eliminar duplicados
  const unique = new Map<string, { number: string; formula: string }>();
  results.forEach(r => {
    if (!unique.has(r.number)) {
      unique.set(r.number, r);
    }
  });

  return Array.from(unique.values());
};