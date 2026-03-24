// src/lib/animalData.ts
export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const getCodesForLottery = (id: string): string[] => {
  let max = 36;
  if (id === 'guacharo') max = 75;
  if (id === 'guacharito') max = 99;
  
  // El orden correcto: 0, 00, luego del 01 al máximo
  const codes = ['0', '00'];
  for (let i = 1; i <= max; i++) {
    codes.push(i.toString().padStart(2, '0'));
  }
  return codes;
};

export const getAnimalImageUrl = (code: string | number): string => {
  const str = String(code).trim();
  // 🛡️ CORRECCIÓN CRÍTICA: Si es 0 o 00, no le agregamos pads para que no se dupliquen
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return `${SUPA_STORAGE_URL}${normalized}.png`;
};

export const getAnimalName = (code: string | number, lotteryId?: string): string => {
  return "ANIMAL " + code;
};

export const getAnimalEmoji = (code: string | number): string => "🎯";
