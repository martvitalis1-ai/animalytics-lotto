import { useMemo } from 'react';
import { getAnimalByCode } from '@/lib/animalData';
import { AnimalEmoji } from './AnimalImage';
import { Badge } from '@/components/ui/badge';
import { Flame, Snowflake, Clock, Zap } from 'lucide-react';

interface RichAnimalCardProps {
  code: string;
  probability?: number;
  status?: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL';
  rank?: number;
  showProbability?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  reason?: string;
}

export function RichAnimalCard({
  code,
  probability,
  status,
  rank,
  showProbability = true,
  size = 'md',
  onClick,
  className = '',
  reason
}: RichAnimalCardProps) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const displayCode = code === '0' ? '00' : code.padStart(2, '0');
  
  const statusStyles = {
    HOT: 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400',
    COLD: 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400',
    OVERDUE: 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400',
    NEUTRAL: 'bg-muted border-border text-muted-foreground'
  };
  
  const statusIcons = {
    HOT: <Flame className="w-3 h-3" />,
    COLD: <Snowflake className="w-3 h-3" />,
    OVERDUE: <Clock className="w-3 h-3" />,
    NEUTRAL: null
  };
  
  const sizeConfig = {
    sm: {
      card: 'p-2 gap-1',
      emoji: 'sm' as const,
      number: 'text-lg',
      name: 'text-[10px]',
      badge: 'text-[9px] px-1 py-0'
    },
    md: {
      card: 'p-3 gap-2',
      emoji: 'md' as const,
      number: 'text-2xl',
      name: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    lg: {
      card: 'p-4 gap-3',
      emoji: 'lg' as const,
      number: 'text-4xl',
      name: 'text-sm',
      badge: 'text-sm px-2 py-1'
    }
  };
  
  const config = sizeConfig[size];
  const isBallena = code === '00';
  
  // Calculate probability display - enforce minimum 35%
  const displayProbability = useMemo(() => {
    if (!probability) return null;
    // Boost low probabilities as per requirement
    if (probability < 35) {
      return Math.min(85, 35 + (probability * 0.5));
    }
    return Math.min(85, probability);
  }, [probability]);
  
  return (
    <div
      className={`
        relative flex flex-col items-center rounded-xl border transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${status ? statusStyles[status] : 'bg-card border-border'}
        ${config.card}
        ${className}
      `}
      onClick={onClick}
      title={reason}
    >
      {/* Rank badge */}
      {rank !== undefined && rank <= 3 && (
        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          rank === 1 ? 'bg-amber-500 text-amber-950' :
          rank === 2 ? 'bg-gray-300 text-gray-800' :
          'bg-amber-700 text-amber-100'
        }`}>
          {rank}
        </div>
      )}
      
      {/* Animal emoji */}
      <div className={`relative ${isBallena ? 'ring-2 ring-red-500 rounded-full p-1' : ''}`}>
        <AnimalEmoji code={code} size={config.emoji} />
      </div>
      
      {/* Number badge */}
      <Badge 
        variant="secondary" 
        className={`font-mono font-black ${config.number} ${
          status === 'HOT' ? 'bg-red-600 text-white' :
          status === 'COLD' ? 'bg-blue-600 text-white' :
          status === 'OVERDUE' ? 'bg-amber-600 text-white' :
          'bg-primary text-primary-foreground'
        }`}
      >
        {displayCode}
      </Badge>
      
      {/* Animal name */}
      <span className={`font-bold text-center leading-tight ${config.name}`}>
        {animal?.name || 'N/A'}
      </span>
      
      {/* Status and probability row */}
      {(status || showProbability) && (
        <div className="flex items-center gap-1 mt-1">
          {status && status !== 'NEUTRAL' && (
            <span className={`flex items-center gap-0.5 ${config.badge} rounded-full border ${statusStyles[status]}`}>
              {statusIcons[status]}
              <span className="hidden sm:inline">{status}</span>
            </span>
          )}
          {showProbability && displayProbability !== null && (
            <span className={`flex items-center gap-0.5 ${config.badge} rounded-full bg-primary/20 text-primary font-medium`}>
              <Zap className="w-3 h-3" />
              {displayProbability.toFixed(0)}%
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
  status?: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL';
  probability?: number;
  onClick?: () => void;
}) {
  const animal = getAnimalByCode(code);
  const displayCode = code === '0' ? '00' : code.padStart(2, '0');
  
  const statusColors = {
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
        ${status ? statusColors[status] : 'border-border bg-card'}
      `}
      onClick={onClick}
    >
      <AnimalEmoji code={code} size="sm" />
      <div className="flex flex-col">
        <span className="font-mono font-bold text-sm">{displayCode}</span>
        <span className="text-[10px] text-muted-foreground truncate max-w-16">{animal?.name}</span>
      </div>
      {probability !== undefined && (
        <span className="ml-auto text-[10px] font-medium text-primary">
          {Math.min(85, probability < 35 ? 35 + probability * 0.5 : probability).toFixed(0)}%
        </span>
      )}
    </div>
  );
}
