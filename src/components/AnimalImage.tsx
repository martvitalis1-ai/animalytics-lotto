import { useMemo } from 'react';
import { getAnimalByCode, SPRITE_POSITIONS } from '@/lib/animalData';
import animalSprite from '@/assets/animals-sprite-main.png';

interface AnimalImageProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBallenaStyle?: boolean;
}

// Sprite sheet dimensions (based on uploaded image)
const SPRITE_COLS = 5;
const SPRITE_CELL_WIDTH = 200;  // Approximate cell width in pixels
const SPRITE_CELL_HEIGHT = 180; // Approximate cell height in pixels

export function AnimalImage({ 
  code, 
  size = 'md', 
  className = '',
  showBallenaStyle = false
}: AnimalImageProps) {
  const animal = useMemo(() => getAnimalByCode(code), [code]);
  const position = SPRITE_POSITIONS[code] || SPRITE_POSITIONS["0"];
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizePx = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  // For "00" (Ballena), apply special styling to differentiate from "0" (Delfín)
  const isBallena = code === "00";
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${sizeClasses[size]} ${className} ${
        isBallena && showBallenaStyle ? 'ring-2 ring-red-500' : ''
      }`}
      style={{
        backgroundImage: `url(${animalSprite})`,
        backgroundPosition: `-${position.col * sizePx[size] * (SPRITE_CELL_WIDTH / sizePx[size])}px -${position.row * sizePx[size] * (SPRITE_CELL_HEIGHT / sizePx[size])}px`,
        backgroundSize: `${SPRITE_COLS * sizePx[size] * (SPRITE_CELL_WIDTH / sizePx[size])}px auto`,
        imageRendering: 'auto',
        filter: isBallena && showBallenaStyle ? 'hue-rotate(180deg)' : 'none'
      }}
      title={animal?.name || code}
    />
  );
}

// Fallback component with emoji for when sprite isn't available
export function AnimalEmoji({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' | 'lg' }) {
  const animal = getAnimalByCode(code);
  
  const emojiMap: Record<string, string> = {
    '0': '🐬', '00': '🐋', '1': '🐏', '2': '🐂', '3': '🐛',
    '4': '🦂', '5': '🦁', '6': '🐸', '7': '🦜', '8': '🐭',
    '9': '🦅', '10': '🐯', '11': '🐱', '12': '🐴', '13': '🐵',
    '14': '🕊️', '15': '🦊', '16': '🐻', '17': '🦃', '18': '🫏',
    '19': '🐐', '20': '🐷', '21': '🐓', '22': '🐪', '23': '🦓',
    '24': '🦎', '25': '🐔', '26': '🐄', '27': '🐕', '28': '🦅',
    '29': '🐘', '30': '🐊', '31': '🦫', '32': '🐿️', '33': '🐟',
    '34': '🦌', '35': '🦒', '36': '🐍'
  };
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  
  return (
    <span 
      className={`${sizeClasses[size]} leading-none`}
      title={animal?.name || code}
    >
      {emojiMap[code] || '🎯'}
    </span>
  );
}
