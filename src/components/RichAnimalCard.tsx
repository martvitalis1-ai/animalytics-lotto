import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'md', onClick }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  // Definimos el estilo según el estado
  const statusConfig: any = {
    'HOT': { label: '🔥 CALIENTE', color: 'text-red-600 bg-red-50' },
    'COLD': { label: '❄️ FRÍO', color: 'text-blue-600 bg-blue-50' },
    'OVERDUE': { label: '⛓️ ENJAULADO', color: 'text-amber-600 bg-amber-50' },
    'NEUTRAL': { label: '⚖️ POSIBLE', color: 'text-slate-500 bg-slate-50' }
  };

  const config = statusConfig[status] || statusConfig.NEUTRAL;

  return (
    <div 
      className="relative flex flex-col items-center p-2 cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      {/* IMAGEN SIN SOMBRAS PARA MEZCLARSE CON EL FONDO */}
      <div className={`${size === 'sm' ? 'w-20 h-20' : 'w-32 h-32'} flex items-center justify-center bg-white`}>
        <img src={imageUrl} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
      </div>

      {/* ESTADO EN LUGAR DE NOMBRE/NÚMERO */}
      <div className={`mt-2 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter ${config.color}`}>
        {config.label}
      </div>

      {probability && (
        <span className="mt-1 text-[9px] font-bold text-emerald-600 italic">
          {Math.floor(probability)}% ÉXITO
        </span>
      )}
    </div>
  );
}
