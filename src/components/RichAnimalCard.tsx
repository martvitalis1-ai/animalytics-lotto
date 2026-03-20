import { useMemo, useState } from 'react';
import { getAnimalByCode } from '@/lib/animalData';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

export function RichAnimalCard({ code, probability, rank, size = 'md', onClick, className = '' }: any) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const [imgError, setImgError] = useState(false);

  // CONSTRUCCIÓN DEL LINK DIRECTO
  const imageUrl = useMemo(() => {
    const str = String(code).trim();
    const final = (str === '0' || str === '00') ? str : str.padStart(2, '0');
    return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${final}.png`;
  }, [code]);

  const sizeConfig = {
    sm: { card: 'p-2 min-w-[90px]', img: 'w-16 h-16', num: 'text-sm' },
    md: { card: 'p-4 min-w-[120px]', img: 'w-24 h-24', num: 'text-xl' },
    lg: { card: 'p-6 min-w-[160px]', img: 'w-44 h-44', num: 'text-3xl' }
  };
  const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.md;

  return (
    <div className={cn("relative flex flex-col items-center rounded-[3rem] border-2 transition-all duration-300 bg-white shadow-2xl hover:scale-105 active:scale-95 border-slate-100", config.card, className)} onClick={onClick}>
      {rank && rank <= 3 && <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black z-20 shadow-lg">#{rank}</div>}
      <div className={cn(config.img, "relative flex items-center justify-center mb-2")}>
        {!imgError ? (
          <img src={imageUrl} alt="" className="w-full h-full object-contain z-10 drop-shadow-xl" crossOrigin="anonymous" onError={() => setImgError(true)} />
        ) : (
          <span className="text-4xl">🎲</span>
        )}
      </div>
      <Badge variant="secondary" className={cn("font-mono font-black mb-1", config.num)}>
        {code === '0' || code === '00' ? code : String(code).padStart(2, '0')}
      </Badge>
      <span className="font-black uppercase tracking-tighter text-slate-800 text-center text-[10px] lg:text-xs">
        {animal?.name || 'N/A'}
      </span>
      {probability && (
        <div className="mt-2 px-3 py-1 bg-emerald-500 text-white rounded-full flex items-center gap-1 shadow-md">
          <Zap className="w-3 h-3 fill-white" />
          <span className="text-[10px] font-black uppercase">{Math.floor(probability)}%</span>
        </div>
      )}
    </div>
  );
}
