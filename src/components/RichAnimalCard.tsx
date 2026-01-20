import { useMemo } from 'react';
import { getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
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
  
  // CRITICAL: Preserve "0" as "0" and "00" as "00"
  const displayCode = useMemo(() => {
    if (code === "0") return "0";
    if (code === "00") return "00";
    return code.padStart(2, '0');
  }, [code]);
  
  const normalizedStatus = useMemo(() => {
    if (!status) return 'NEUTRAL';
    // Map Spanish status to internal status
    if (status === 'CALIENTE') return 'HOT';
    if (status === 'FUERTE') return 'HOT';
    if (status === 'POSIBLE') return 'NEUTRAL';
    if (status === 'FRÍO') return 'COLD';
    return status;
  }, [status]);
  
  const statusStyles: Record<string, string> = {
    HOT: 'bg-gradient-to-br from-red-500/30 to-orange-500/20 border-red-500/60 shadow-red-500/20',
    COLD: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-500/60 shadow-blue-500/20',
    OVERDUE: 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500/60 shadow-amber-500/20',
    NEUTRAL: 'bg-card/80 border-border'
  };
  
  const statusIcons: Record<string, React.ReactNode> = {
    HOT: <Flame className="w-3 h-3 text-red-500" />,
    COLD: <Snowflake className="w-3 h-3 text-blue-500" />,
    OVERDUE: <Clock className="w-3 h-3 text-amber-500" />,
    NEUTRAL: <TrendingUp className="w-3 h-3 text-muted-foreground" />
  };
  
  const sizeConfig = {
    sm: {
      card: 'p-2 gap-1 min-w-[80px]',
      emoji: 'text-2xl',
      number: 'text-lg',
      name: 'text-[10px]',
      badge: 'text-[9px] px-1 py-0'
    },
    md: {
      card: 'p-3 gap-2 min-w-[100px]',
      emoji: 'text-4xl',
      number: 'text-2xl',
      name: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    lg: {
      card: 'p-4 gap-3 min-w-[140px]',
      emoji: 'text-6xl',
      number: 'text-4xl',
      name: 'text-sm',
      badge: 'text-sm px-2 py-1'
    }
  };
  
  const config = sizeConfig[size];
  const isBallena = code === '00';
  
  return (
    <div
      className={`
        relative flex flex-col items-center rounded-xl border-2 transition-all duration-200
        backdrop-blur-sm shadow-lg
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${statusStyles[normalizedStatus]}
        ${config.card}
        ${className}
      `}
      onClick={onClick}
      title={reason}
    >
      {/* Lottery name header */}
      {lotteryName && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full whitespace-nowrap">
          {lotteryName}
        </div>
      )}
      
      {/* Rank badge */}
      {rank !== undefined && rank <= 3 && (
        <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${
          rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950' :
          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
          'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
        }`}>
          #{rank}
        </div>
      )}
      
      {/* Animal emoji with special styling for Ballena */}
      <div className={`
        relative flex items-center justify-center
        ${isBallena ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-background rounded-full p-1' : ''}
      `}>
        <span className={`${config.emoji} drop-shadow-lg`} role="img" aria-label={animal?.name || 'animal'}>
          {emoji}
        </span>
      </div>
      
      {/* Number badge with high contrast */}
      <Badge 
        variant="secondary" 
        className={`
          font-mono font-black shadow-md
          ${config.number}
          ${normalizedStatus === 'HOT' ? 'bg-red-600 text-white' :
            normalizedStatus === 'COLD' ? 'bg-blue-600 text-white' :
            normalizedStatus === 'OVERDUE' ? 'bg-amber-600 text-white' :
            'bg-primary text-primary-foreground'}
        `}
      >
        {displayCode}
      </Badge>
      
      {/* Animal name */}
      <span className={`font-bold text-center leading-tight ${config.name} ${
        animal?.name && animal.name.length > 12 ? 'text-[9px]' : ''
      }`}>
        {animal?.name || 'N/A'}
      </span>
      
      {/* Status and probability row */}
      {(status || showProbability) && (
        <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
          {status && normalizedStatus !== 'NEUTRAL' && (
            <span className={`flex items-center gap-0.5 ${config.badge} rounded-full border font-medium
              ${normalizedStatus === 'HOT' ? 'bg-red-500/20 border-red-500/50 text-red-600' :
                normalizedStatus === 'COLD' ? 'bg-blue-500/20 border-blue-500/50 text-blue-600' :
                'bg-amber-500/20 border-amber-500/50 text-amber-600'}
            `}>
              {statusEmoji || statusIcons[normalizedStatus]}
              <span className="hidden sm:inline ml-0.5">{status}</span>
            </span>
          )}
          {showProbability && probability !== undefined && (
            <span className={`flex items-center gap-0.5 ${config.badge} rounded-full bg-primary/20 text-primary font-bold`}>
              <Zap className="w-3 h-3" />
              {String(Math.floor(probability)).padStart(2, '0')}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for lists and grids
export function RichAnimalCardCompact({
  code,
  status,
  probability,
  onClick
}: {
  code: string;
  status?: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL' | 'CALIENTE' | 'FUERTE' | 'POSIBLE' | 'FRÍO';
  probability?: number;
  onClick?: () => void;
}) {
  const animal = getAnimalByCode(code);
  const emoji = getAnimalEmoji(code);
  
  // CRITICAL: Preserve "0" and "00"
  const displayCode = code === "0" ? "0" : code === "00" ? "00" : code.padStart(2, '0');
  
  const normalizedStatus = useMemo(() => {
    if (!status) return 'NEUTRAL';
    if (status === 'CALIENTE' || status === 'FUERTE') return 'HOT';
    if (status === 'FRÍO') return 'COLD';
    return status;
  }, [status]);
  
  const statusColors: Record<string, string> = {
    HOT: 'border-red-500 bg-red-500/10',
    COLD: 'border-blue-500 bg-blue-500/10',
    OVERDUE: 'border-amber-500 bg-amber-500/10',
    NEUTRAL: 'border-border bg-muted/50'
  };
  
  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer
        transition-all hover:scale-105 active:scale-95
        ${statusColors[normalizedStatus]}
      `}
      onClick={onClick}
    >
      <span className="text-xl">{emoji}</span>
      <div className="flex flex-col min-w-0">
        <span className="font-mono font-bold text-sm">{displayCode}</span>
        <span className="text-[10px] text-muted-foreground truncate">{animal?.name}</span>
      </div>
      {probability !== undefined && (
        <span className="ml-auto text-xs font-bold text-primary whitespace-nowrap">
          {String(Math.floor(probability)).padStart(2, '0')}%
        </span>
      )}
    </div>
  );
}
