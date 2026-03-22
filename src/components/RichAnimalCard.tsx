import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function RichAnimalCard({ code, status, probability, size = 'md', onClick }: any) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  const statusConfig: any = {
    'HOT': { label: '🔥 CALIENTE', color: 'text-red-600 bg-red-50' },
    'COLD': { label: '❄️ FRÍO', color: 'text-blue-600 bg-blue-50' },
    'OVERDUE': { label: '⛓️ ENJAULADO', color: 'text-slate-800 bg-slate-100' },
    'NEUTRAL': { label: '⚖️ POSIBLE', color: 'text-slate-500 bg-slate-50' }
  };

  const config = statusConfig[status] || statusConfig.NEUTRAL;

  return (
    <div className="relative flex flex-col items-center p-0 cursor-pointer transition-transform hover:scale-110 active:scale-95" onClick={onClick}>
      <div className={`${size === 'sm' ? 'w-24 h-24' : 'w-36 h-36'} flex items-center justify-center bg-white`}>
        <img src={imageUrl} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" onError={(e) => (e.currentTarget.style.opacity = '0')} />
      </div>
      <div className={`mt-1 px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-tighter ${config.color}`}>
        {config.label}
      </div>
    </div>
  );
}
