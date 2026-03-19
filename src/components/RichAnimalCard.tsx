import { useMemo } from 'react';
import { getAnimalByCode, getAnimalEmoji, getAnimalImageUrl } from '@/lib/animalData';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

export function RichAnimalCard({
  code,
  probability,
  status,
  rank,
  showProbability = true,
  size = 'md',
  onClick,
  className = ''
}: any) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);
  const emoji = useMemo(() => getAnimalEmoji(code), [code]);

  const sizeConfig = {
    sm: { card: 'p-2 min-w-[90px]', img: 'w-16 h-16', num: 'text-sm' },
    md: { card: 'p-4 min-w-[120px]', img: 'w-28 h-28', num: 'text-xl' },
    lg: { card: 'p-6 min-w-[180px]', img: 'w-44 h-44', num: 'text-3xl' }
  };

  const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.md;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-[3rem] border-2 transition-all duration-300 bg-white shadow-2xl hover:scale-105 active:scale-95",
        config.card, className
      )}
      onClick={onClick}
    >
      {rank && (
        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg z-20">
          #{rank}
        </div>
      )}

      <div className={cn(config.img, "relative flex items-center justify-center mb-2")}>
        <img 
          src={imageUrl} 
          alt={animal?.name} 
          className="w-full h-full object-contain z-10 drop-shadow-xl"
          crossOrigin="anonymous"
          onError={(e) => { 
            // Si falla, mostramos el emoji pero el link ya está probado
            e.currentTarget.style.display = 'none'; 
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-10 grayscale">{emoji}</span>
      </div>

      <Badge variant="secondary" className={cn("font-mono font-black mb-1", config.num)}>
        {code === '0' || code === '00' ? code : String(code).padStart(2, '0')}
      </Badge>
      
      <span className="font-black uppercase tracking-tighter text-slate-800 text-center">
        {animal?.name || 'N/A'}
      </span>

      {showProbability && probability !== undefined && (
        <div className="mt-2 flex items-center gap-1 bg-emerald-500 px-3 py-1 rounded-full shadow-md">
          <Zap className="w-3 h-3 text-white fill-white" />
          <span className="text-[10px] font-black text-white">{Math.floor(probability)}%</span>
        </div>
      )}
    </div>
  );
}
