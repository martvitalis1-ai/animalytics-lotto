export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const getCodesForLottery = (id: string): string[] => {
  let max = 36;
  if (id === 'guacharo') max = 75;
  if (id === 'guacharito') max = 99;
  const codes = ['0', '00'];
  for (let i = 1; i <= max; i++) codes.push(i.toString().padStart(2, '0'));
  return codes;
};

export const getAnimalImageUrl = (code: string | number): string => {
  const normalized = String(code).trim().padStart(2, '0').replace('000', '00');
  return `${SUPA_STORAGE_URL}${normalized}.png`;
};

export const getAnimalName = (code: string | number): string => {
  const normalized = String(code).trim().padStart(2, '0').replace('000', '00');
  return "ANIMAL " + normalized; // El nombre ya viene en su imagen 3D
};
