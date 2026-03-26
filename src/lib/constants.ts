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
  const searchId = id.toLowerCase().trim();
  
  // 🛡️ REGLA DE ORO: Lotto Rey y Guacharito sortean a las :30 según tu SQL
  if (searchId === 'lotto_rey' || searchId === 'guacharito') {
    return [
      "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", 
      "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"
    ];
  }

  // Las demás loterías sortean en hora punto
  return [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", 
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];
};

export const formatResultNumber = (n: string) => {
  const t = n.trim();
  return (t === '0' || t === '00') ? t : t.padStart(2, '0');
};

export const getAnimalFromNumber = (num: string, lotteryId: string) => {
  const normalized = formatResultNumber(num);
  const mapping = lotteryId === 'guacharito' ? ANIMALS_GUACHARITO : 
                  lotteryId === 'guacharo' ? ANIMALS_GUACHARO : ANIMALS_STANDARD;
  return mapping[normalized] || "ANIMAL";
};
