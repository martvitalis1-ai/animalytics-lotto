import React, { useMemo } from 'react';
import { getAnimalImageUrl } from '../lib/animalData';

interface RichAnimalCardProps {
  code: string;
  probability?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function RichAnimalCard({ code, probability, size = 'md', onClick }: RichAnimalCardProps) {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  return (
    <div 
      className="flex flex-col items-center justify-center p-0 bg-transparent border-none shadow-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      <div className={`relative flex items-center justify-center ${size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-48 h-48' : 'w-36 h-36'}`}>
        <img 
          src={imageUrl} 
          alt="Animal" 
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
      </div>
      {probability && (
        <span className="mt-1 text-[10px] font-black text-emerald-600 uppercase italic">
          {Math.floor(probability)}% Acierto
        </span>
      )}
    </div>
  );
}
