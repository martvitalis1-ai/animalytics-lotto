import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'md' }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  const statusStyle: any = {
    'hot': 'bg-orange-500 text-white',
    'cold': 'bg-blue-500 text-white',
    'caged': 'bg-slate-800 text-white'
  };

// Dentro de RichAnimalCard.tsx
return (
  <div className="flex flex-col items-center p-0 bg-white border-none shadow-none">
    {/* IMAGEN PURA: Sin cuadros, sin sombras, fondo blanco puro */}
    <div className="w-32 h-32 flex items-center justify-center bg-white">
      <img 
        src={imageUrl} 
        className="w-full h-full object-contain" 
        alt="" 
        crossOrigin="anonymous" 
      />
    </div>
    {/* ELIMINAMOS EL TEXTO DE ABAJO PORQUE YA ESTÁ EN EL PNG */}
    {status && (
      <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${status === 'hot' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {status}
      </div>
    )}
  </div>
);
