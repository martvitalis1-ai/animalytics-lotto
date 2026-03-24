export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const getCodesForLottery = (id: string): string[] => {
  let max = 36;
  // Corregimos los IDs para que coincidan con la DB y habiliten todos los animales
  if (id === 'el_guacharo' || id === 'guacharo') max = 75;
  if (id === 'guacharito') max = 99;
  if (id === 'lotto_rey') max = 36; // Aseguramos que Lotto Rey use el rango estándar
  
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
