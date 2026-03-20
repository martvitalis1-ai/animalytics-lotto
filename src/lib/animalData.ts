export const getAnimalName = (code: string | number): string => {
  // PASO 1: Lo volvemos texto y limpiamos espacios
  const strCode = String(code).trim();
  
  // PASO 2: NO usamos parseInt (eso es lo que daña el 00)
  const names: Record<string, string> = {
    '0': 'DELFÍN',
    '00': 'BALLENA',
    '01': 'CARNERO',
    '02': 'TORO',
    // ... así con todos hasta el 99
    '99': 'GUACHARITO'
  };

  return names[strCode] || `Animal ${strCode}`;
};

export const getAnimalImageUrl = (code: string | number): string => {
  const strCode = String(code).trim();
  // Blindaje de ceros para el link de la foto PNG
  const normalized = (strCode === '0' || strCode === '00') ? strCode : strCode.padStart(2, '0');
  return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${normalized}.png`;
};
