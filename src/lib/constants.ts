// Mapeo de animales por número - CORREGIDO: 0 es Delfín, 00 es Ballena
export const ANIMAL_MAPPING: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', 
  '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', 
  '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', 
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', 
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', 
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', 
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', 
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA', '37': 'LAPA'
};

export const GUACHARO_MAPPING: Record<string, string> = { 
  '0': 'DELFÍN', '00': 'BALLENA', '75': 'GUÁCHARO' 
};

export const LOTTERIES = [
  { id: 'guacharo', name: 'Guácharo Activo', range: 75, type: 'numbers', mapping: GUACHARO_MAPPING, schedule: 'full' },
  { id: 'guacharito', name: 'Guacharito', range: 99, type: 'numbers', mapping: GUACHARO_MAPPING, schedule: 'half' },
  { id: 'lotto_activo', name: 'Lotto Activo', range: 36, type: 'animals', mapping: ANIMAL_MAPPING, schedule: 'full' },
  { id: 'granjita', name: 'La Granjita', range: 36, type: 'animals', mapping: ANIMAL_MAPPING, schedule: 'full' },
  { id: 'selva_plus', name: 'Selva Plus', range: 36, type: 'animals', mapping: ANIMAL_MAPPING, schedule: 'full' },
  { id: 'lotto_rey', name: 'Lotto Rey', range: 36, type: 'animals', mapping: ANIMAL_MAPPING, schedule: 'half' },
] as const;

// Horarios completos (8:00 AM - 7:00 PM)
export const DRAW_TIMES_FULL = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM'
];

// Horarios medios (8:30 AM - 7:30 PM)
export const DRAW_TIMES_HALF = [
  '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', 
  '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', 
  '06:30 PM', '07:30 PM'
];

// Todos los horarios (para compatibilidad)
export const DRAW_TIMES = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

// Obtener horarios según la lotería
export const getDrawTimesForLottery = (lotteryId: string): string[] => {
  const lottery = LOTTERIES.find(l => l.id === lotteryId);
  if (!lottery) return DRAW_TIMES_FULL;
  
  // Guacharito y Lotto Rey usan horarios de media hora
  if (lottery.schedule === 'half') {
    return DRAW_TIMES_HALF;
  }
  
  return DRAW_TIMES_FULL;
};

export const ADMIN_CODE = "GANADOR85";

// Obtener el animal desde el número - CORREGIDO para manejar "0" correctamente
export const getAnimalFromNumber = (num: string, lotteryId: string): string => {
  const lottery = LOTTERIES.find(l => l.id === lotteryId);
  if (!lottery) return '';
  
  // Caso especial: si es exactamente "0" o "00", mantenerlo así
  const normalizedNum = num.trim();
  
  if (lottery.type === 'animals') {
    // Si es "0" buscar como "0" (Delfín), si es "00" buscar como "00" (Ballena)
    if (normalizedNum === '0') return ANIMAL_MAPPING['0'] || '';
    if (normalizedNum === '00') return ANIMAL_MAPPING['00'] || '';
    // Para otros números, buscar sin ceros a la izquierda
    const numWithoutLeadingZeros = parseInt(normalizedNum).toString();
    return ANIMAL_MAPPING[numWithoutLeadingZeros] || '';
  }
  return lottery.mapping[normalizedNum] || '';
};

// Guardar número correctamente - NO convertir "0" a "00"
export const formatResultNumber = (num: string): string => {
  const trimmed = num.trim();
  // Si el usuario ingresa "0", guardarlo como "0" (Delfín)
  // Si ingresa "00", guardarlo como "00" (Ballena)
  if (trimmed === '0') return '0';
  if (trimmed === '00') return '00';
  // Para otros números, padStart con 2 dígitos
  return trimmed.padStart(2, '0');
};