import { useMemo, useState } from 'react';
import { getAnimalByCode, getAnimalEmoji, getAnimalImageUrl } from '@/lib/animalData';
import { Badge } from '@/components/ui/badge';
import { Flame, Snowflake, Clock, Zap, TrendingUp } from 'lucide-react';

interface RichAnimalCardProps {
  code: string;
  probability?: number;
  status?: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL' | 'CALIENTE' | 'FUERTE' | 'POSIBLE' | 'FRÍO';
  statusEmoji?: string;
  rank?: number;
  showProbability?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  reason?: string;
  lotteryName?: string;
}

export function RichAnimalCard({
  code,
  probability,
  status,
  statusEmoji,
  rank,
  showProbability = true,
  size = 'md',
  onClick,
  className = '',
  reason,
  lotteryName
}: RichAnimalCardProps) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const emoji = useMemo(() => getAnimalEmoji(code), [code]);
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);
  const [imgError, setImgError] = useState(false);
  
  // CRITICAL: Preserve "0" as "0" and "00" as "00"
  const displayCode = useMemo(() => {
    if (code === "0") return "0";
    if (code === "00") return "00";
    return code.padStart(2, '0');
  }, [code]);
  
  const normalizedStatus = useMemo(() => {
    if (!status) return 'NEUTRAL';
    if (status === 'CALIENTE' || status === 'FUERTE') return 'HOT';
    if (status === 'POSIBLE') return 'NEUTRAL';
    if (status === 'FRÍO') return 'COLD';
    return status;
  }, [status]);
  
  const statusStyles: Record<string, string> = {
    HOT: 'bg-gradient-to-br from-red-500/30 to-orange-500/20 border-red-500/60 shadow-red-500/20',
    COLD: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-500/60 shadow-blue-500/20',
    OVERDUE: 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500/60 shadow-amber-500/20',
    NEUTRAL: 'bg-card/80 border-border shadow-sm'
  };
  
  const statusIcons: Record<string, React.ReactNode> = {
    HOT: <Flame className="w-3 h-3 text-red-500" />,
    COLD: <Snowflake className="w-3 h-3 text-blue-500" />,
    OVERDUE: <Clock className="w-3 h-3 text-amber-500" />,
    NEUTRAL: <TrendingUp className="w-3 h-3 text-muted-foreground" />
  };
  
  const sizeConfig = {
    sm: { card: 'p-2 gap-1 min-w-[80px]', img: 'w-14 h-14', number: 'text-lg', name: 'text-[10px]' },
    md: { card: 'p-3 gap-2 min-w-[110px]', img: 'w-24 h-24', number: 'text-2xl', name: 'text-xs' },
    lg: { card: 'p-4 gap-3 min-w-[140px]', img: 'w-32 h-32', number: 'text-4xl', name: 'text-sm' }
  };
  
  const config = sizeConfig[size];

  return (
    <div
      className={`
        relative flex flex-col items-center rounded-2xl border-2 transition-all duration-300
        backdrop-blur-sm shadow-xl bg-white
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${statusStyles[normalizedStatus]}
        ${config.card} ${className}
      `}
      onClick={onClick}
      title={reason}
    >
      {rank && (
        <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg z-20">
          #{rank}
        </div>
      )}
      
      {/* IMAGEN 3D DESDE SUPABASE */}
      <div className={`relative flex items-center justify-center ${config.img}`}>
        {!imgError ? (
          <img 
            src={imageUrl} 
            alt={animal?.name} 
            className="w-full h-full object-contain drop-shadow-xl z-10"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl drop-shadow-md">{emoji}</span>
        )}
      </div>
      
      {/* Number and Name Labels (Opcional: Si sus imágenes ya tienen texto, puede borrar estas 2 etiquetas) */}
      <Badge variant="secondary" className={`font-mono font-black mt-2 ${config.number}`}>
        {displayCode}
      </Badge>
      
      <span className={`font-bold text-center leading-tight uppercase text-slate-700 ${config.name}`}>
        {animal?.name || 'N/A'}
      </span>
      
      {/* Status and probability row */}
      {(status || showProbability) && (
        <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
          {showProbability && probability !== undefined && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-sm">
              <Zap className="w-2.5 h-2.5 fill-white" />
              {String(Math.floor(probability))}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function RichAnimalCardCompact({
  code, status, probability, onClick
}: {
  code: string;
  status?: string;
  probability?: number;
  onClick?: () => void;
}) {
  const animal = getAnimalByCode(code);
  const imageUrl = getAnimalImageUrl(code);
  
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl border bg-white cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
      onClick={onClick}
    >
      <img src={imageUrl} className="w-10 h-10 object-contain" alt="" crossOrigin="anonymous" />
      <div className="flex flex-col">
        <span className="font-mono font-black text-sm">#{code === '0' || code === '00' ? code : code.padStart(2, '0')}</span>
        <span className="text-[10px] font-bold uppercase text-slate-400 leading-none">{animal?.name}</span>
      </div>
      {probability !== undefined && (
        <span className="ml-auto text-xs font-black text-emerald-600 italic">
          {Math.floor(probability)}%
        </span>
      )}
    </div>
  );
}
      )}
    </div>
  );
}
