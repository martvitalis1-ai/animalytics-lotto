import { useMemo } from 'react';
import { getAnimalImageUrl } from '../lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'xl', onClick }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  const sizeMap: any = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
    xl: 'w-56 h-56 lg:w-64 lg:h-64'
  };

  const statusColor: any = {
    'hot': 'bg-red-600',
    'cold': 'bg-blue-500',
    'caged': 'bg-slate-900'
  };

  return (
    <div className="flex flex-col items-center justify-center p-0 bg-transparent border-none shadow-none cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={onClick}>
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        <img src={imageUrl} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" onError={(e) => (e.currentTarget.style.opacity = '0')} />
      </div>
      {status && (
        <div className={`mt-2 px-4 py-1 ${statusColor[status] || 'bg-slate-400'} text-white text-[10px] font-black rounded-full uppercase italic shadow-lg`}>
          {status === 'caged' ? '⛓️ Enjaulado' : status === 'hot' ? '🔥 Caliente' : '❄️ Frío'}
        </div>
      )}
      {probability && (
        <span className="mt-1 text-[11px] font-black text-emerald-600 italic tracking-tighter">
          {Math.floor(probability)}% ACIERTO
        </span>
      )}
    </div>
  );
}
