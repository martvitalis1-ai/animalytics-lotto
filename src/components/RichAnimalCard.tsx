import { useMemo } from 'react';
import { getAnimalImageUrl } from '../lib/animalData';

interface RichAnimalCardProps {
  code: string;
  probability?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export function RichAnimalCard({ code, probability, size = 'xl', onClick }: RichAnimalCardProps) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  // Aumentamos los tamaños para móvil
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
    xl: 'w-52 h-52 lg:w-60 lg:h-60' // Tamaño masivo para impacto visual
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-0 bg-transparent border-none shadow-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        <img 
          src={imageUrl} 
          alt="" 
          className="w-full h-full object-contain drop-shadow-md"
          crossOrigin="anonymous"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
      </div>
      
      {/* Solo mostramos la probabilidad de forma elegante si existe */}
      {probability && (
        <div className="mt-[-10px] z-20 px-4 py-1 bg-emerald-600 text-white rounded-full text-[12px] font-black shadow-lg animate-pulse">
          ⚡ {Math.floor(probability)}%
        </div>
      )}
    </div>
  );
}
