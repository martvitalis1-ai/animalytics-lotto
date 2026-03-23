// src/lib/animalData.ts
export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '01': 'CARNERO', '02': 'TORO', '03': 'CIEMPIÉS',
  '04': 'ALACRÁN', '05': 'LEÓN', '06': 'RANA', '07': 'PERICO', '08': 'RATÓN',
  '09': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO',
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO',
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA',
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO',
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO',
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA'
};

export const getCodesForLottery = (lotteryId: string): string[] => {
  let max = 36;
  if (lotteryId === 'guacharo') max = 75;
  if (lotteryId === 'guacharito') max = 99;
  const codes = ['0', '00'];
  for (let i = 1; i <= max; i++) {
    codes.push(i.toString().padStart(2, '0'));
  }
  return codes;
};

export const getAnimalImageUrl = (code: string | number): string => {
  const str = String(code).trim();
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return `${SUPA_STORAGE_URL}${normalized}.png`;
};

export const getAnimalName = (code: string | number): string => {
  return ANIMALS_STANDARD[String(code).trim().padStart(2, '0')] || "ANIMAL";
};

export const getAnimalEmoji = (code: string | number): string => "🎯";
