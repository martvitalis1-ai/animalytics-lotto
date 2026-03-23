// src/lib/constants.ts
export const LOTTERIES = [
  { id: 'la_granjita', name: 'La Granjita' }, // ID corregido
  { id: 'lotto_activo', name: 'Lotto Activo' },
  { id: 'guacharo', name: 'El Guácharo' },
  { id: 'guacharito', name: 'Guacharito' },
  { id: 'selva_plus', name: 'Selva Plus' },
  { id: 'lotto_rey', name: 'Lotto Rey' } // ID corregido
];

export const getDrawTimesForLottery = (id: string) => {
  // Lotto Rey y Guacharito suelen tener sorteos cada hora o en horarios específicos
  if (id === 'guacharito' || id === 'lotto_rey') {
    return ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
  }
  return ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
};
