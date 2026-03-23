// src/lib/constants.ts
import { ANIMALS_STANDARD, ANIMALS_GUACHARO, ANIMALS_GUACHARITO } from './animalData';

export const LOTTERIES = [
  { id: 'lotto_activo', name: 'Lotto Activo' },
  { id: 'la_granjita', name: 'La Granjita' },
  { id: 'guacharo', name: 'El Guácharo' },
  { id: 'guacharito', name: 'Guacharito' },
  { id: 'selva_plus', name: 'Selva Plus' }
];

export const getDrawTimesForLottery = (lotteryId: string): string[] => {
  return ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
};
