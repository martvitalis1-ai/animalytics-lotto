import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'md' }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  const statusStyle: any = {
    'hot': 'bg-orange-500 text-white',
    'cold': 'bg-blue-500 text-white',
    'caged': 'bg-slate-800 text-white'
  };

  return (
    <div className="flex flex-col items-center p-0 bg-white border-none shadow-none">
      {/* IMAGEN PURA: Sin fondos, sin sombras, sin cuadros */}
      <div className={`${size === 'sm' ? 'w-20 h-20' : 'w-32 h-32'} flex items-center justify-center bg-white`}>
        <img 
          src={imageUrl} 
          className="w-full h-full object-contain" 
          alt="" 
          crossOrigin="anonymous" 
        />
      </div>

      {/* Solo mostramos la etiqueta de estado si existe */}
      {status && (
        <div className={`mt-1 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyle[status] || 'bg-slate-100 text-slate-400'}`}>
          {status === 'hot' ? 'Caliente' : status === 'cold' ? 'Frío' : 'Enjaulado'}
        </div>
      )}

      {probability && (
        <div className="mt-1 text-[10px] font-black text-emerald-600 italic">
          {Math.floor(probability)}% ACIERTO
        </div>
      )}
    </div>
  );
}
