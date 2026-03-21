import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'md', onClick }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  // Configuración de etiquetas de estado profesional
  const statusConfig: any = {
    'HOT': { label: 'CALIENTE', color: 'bg-red-600' },
    'COLD': { label: 'FRÍO', color: 'bg-blue-500' },
    'OVERDUE': { label: 'ENJAULADO', color: 'bg-slate-800' }
  };

  const config = statusConfig[status];

  return (
    <div 
      className="relative flex flex-col items-center p-2 cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      {/* IMAGEN 3D LIMPIA (Sin sombras de cuadro para que se pierda con el fondo) */}
      <div className={`${size === 'sm' ? 'w-24 h-24' : 'w-36 h-36'} flex items-center justify-center bg-white`}>
        <img src={imageUrl} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
      </div>

      {/* ESTADO DINÁMICO (SOLO SI TIENE ESTADO) */}
      {config && (
        <div className={`mt-1 px-3 py-0.5 ${config.color} text-white text-[10px] font-black rounded-full shadow-lg`}>
          {config.label}
        </div>
      )}

      {/* PROBABILIDAD MINIMALISTA */}
      {probability && (
        <span className="mt-1 text-[11px] font-black text-emerald-600 italic">
          {Math.floor(probability)}% ÉXITO
        </span>
      )}
    </div>
  );
}
