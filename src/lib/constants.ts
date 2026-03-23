// src/lib/constants.ts
import { ANIMALS_STANDARD, ANIMALS_GUACHARO, ANIMALS_GUACHARITO } from './animalData';

export const LOTTERIES = [
  { id: 'la_granjita', name: 'La Granjita' },
  { id: 'lotto_activo', name: 'Lotto Activo' },
  { id: 'guacharo', name: 'El Guácharo' },
  { id: 'guacharito', name: 'Guacharito' },
  { id: 'selva_plus', name: 'Selva Plus' },
  { id: 'lotto_rey', name: 'Lotto Rey' }
];

export const getDrawTimesForLottery = (id: string) => {
  return ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
};

// 🛡️ FUNCIONES REQUERIDAS POR RESULTSINSERT.TSX
export const formatResultNumber = (num: string): string => {
  const trimmed = num.trim();
  if (trimmed === '0' || trimmed === '00') return trimmed;
  return trimmed.padStart(2, '0');
};

export const getAnimalFromNumber = (num: string, lotteryId: string): string => {
  const normalized = formatResultNumber(num);
  const mapping = lotteryId === 'guacharito' ? ANIMALS_GUACHARITO : 
                  lotteryId === 'guacharo' ? ANIMALS_GUACHARO : ANIMALS_STANDARD;
  return mapping[normalized] || "ANIMAL";
};
