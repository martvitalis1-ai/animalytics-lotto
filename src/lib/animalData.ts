export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const getCodesForLottery = (id: string): string[] => {
  const searchId = id.toLowerCase().trim();
  let max = 36;
  
  // 🛡️ CORRECCIÓN DE RANGOS PARA LA MATRIZ
  if (searchId === 'guacharo' || searchId === 'el_guacharo') max = 75;
  if (searchId === 'guacharito') max = 99;
  
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

// Necesario para que el Bot no falle en el Build
export const getAnimalName = (code: string | number, lotteryId?: string): string => "ANIMAL";
export const getAnimalEmoji = (code: string | number): string => "🎯";
