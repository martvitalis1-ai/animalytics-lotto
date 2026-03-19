import { useMemo } from 'react';
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
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);
  const emoji = useMemo(() => getAnimalEmoji(code), [code]);

  const displayCode = useMemo(() => {
    if (code === "0" || code === "00") return code;
    return code.toString().padStart(2, '0');
  }, [code]);

  const normalizedStatus = useMemo(() => {
    if (!status) return 'NEUTRAL';
    if (status === 'CALIENTE' || status === 'FUERTE') return 'HOT';
    if (status === 'FRÍO') return 'COLD';
    return status as any;
  }, [status]);

  const statusStyles: Record<string, string> = {
    HOT: 'bg-gradient-to-br from-red-500/30 to-orange-500/20 border-red-500/60 shadow-red-500/20',
    COLD: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-500/60 shadow-blue-500/20',
    OVERDUE: 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500/60 shadow-amber-500/20',
    NEUTRAL: 'bg-white border-slate-200'
  };

  const statusIcons: Record<string, React.ReactNode> = {
    HOT: <Flame className="w-3 h-3 text-red-500" />,
    COLD: <Snowflake className="w-3 h-3 text-blue-500" />,
    OVERDUE: <Clock className="w-3 h-3 text-amber-500" />,
    NEUTRAL: <TrendingUp className="w-3 h-3 text-muted-foreground" />
  };

  const sizeConfig = {
    sm: { card: 'p-2 min-w-[90px]', img: 'w-14 h-14', num: 'text-sm', name: 'text-[9px]' },
    md: { card: 'p-4 min-w-[120px]', img: 'w-24 h-24', num: 'text-xl', name: 'text-xs' },
    lg: { card: 'p-6 min-w-[160px]', img: 'w-36 h-36', num: 'text-3xl', name: 'text-sm' }
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`
        relative flex flex-col items-center rounded-[3rem] border-2 transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${statusStyles[normalizedStatus]}
        ${config.card} ${className} shadow-2xl
      `}
      onClick={onClick}
      title={reason}
    >
      {rank && (
        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg z-20">
          #{rank}
        </div>
      )}

      {/* CONTENEDOR DE ARTE 3D CON FALLBACK */}
      <div className={`${config.img} relative flex items-center justify-center mb-2`}>
        <img 
          src={imageUrl} 
          alt={animal?.name} 
          className="w-full h-full object-contain z-10 drop-shadow-xl"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-10 grayscale">{emoji}</span>
      </div>

      <Badge variant="secondary" className={`font-mono font-black mb-1 ${config.num}`}>
        {displayCode}
      </Badge>
      
      <span className={`font-black uppercase tracking-tighter text-slate-800 ${config.name}`}>
        {animal?.name || 'N/A'}
      </span>

      {showProbability && probability !== undefined && (
        <div className="mt-2 flex items-center gap-1 bg-emerald-500 px-3 py-1 rounded-full shadow-md animate-pulse">
          <Zap className="w-3 h-3 text-white fill-white" />
          <span className="text-[10px] font-black text-white">{Math.floor(probability)}%</span>
        </div>
      )}
    </div>
  );
}
