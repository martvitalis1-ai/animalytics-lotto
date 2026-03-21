import { useMemo, useState } from 'react';
import { getAnimalByCode, getAnimalImageUrl } from '@/lib/animalData';
import { cn } from "@/lib/utils";

export function RichAnimalCard({ code, probability, status, rank, size = 'md', onClick, className = '', showProbability = false }: any) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);
  const [imgError, setImgError] = useState(false);

  const sizeConfig = {
    sm: { card: 'p-2 min-w-[80px]', img: 'w-14 h-14', label: 'text-[9px]' },
    md: { card: 'p-3 min-w-[100px]', img: 'w-20 h-20', label: 'text-[10px]' },
    lg: { card: 'p-4 min-w-[140px]', img: 'w-32 h-32', label: 'text-xs' }
  };
  const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.md;

  const statusLabel = () => {
    if (status === 'HOT') return { text: '🔥 CALIENTE', color: 'bg-orange-500 text-white' };
    if (status === 'COLD') return { text: '❄️ FRÍO', color: 'bg-blue-500 text-white' };
    if (status === 'OVERDUE') return { text: '🔒 ENJAULADO', color: 'bg-slate-700 text-white' };
    return null;
  };

  const sl = statusLabel();

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-2xl bg-white border border-slate-50 transition-all",
        config.card,
        className
      )}
      onClick={onClick}
    >
      {rank && rank <= 3 && (
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black z-20">
          #{rank}
        </div>
      )}

      <div className={cn(config.img, "relative flex items-center justify-center")}>
        {!imgError ? (
          <img
            src={imageUrl}
            alt={animal?.name}
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl">🎲</span>
        )}
      </div>

      {/* Status badge instead of repeating name/number */}
      {sl && (
        <div className={cn("mt-1 px-2 py-0.5 rounded-full font-black", config.label, sl.color)}>
          {sl.text}
        </div>
      )}

      {showProbability && probability && (
        <span className={cn("mt-1 font-black text-emerald-600", config.label)}>
          {Math.floor(probability)}%
        </span>
      )}
    </div>
  );
}

export function RichAnimalCardCompact({ code, probability, status, className = '' }: any) {
  return <RichAnimalCard code={code} probability={probability} status={status} size="sm" className={className} />;
}
