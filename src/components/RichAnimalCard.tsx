import { useMemo } from 'react';
import { getAnimalImageUrl } from '../lib/animalData';

// DEFINIMOS LA INTERFAZ PARA EVITAR ERRORES DE TYPESCRIPT
interface RichAnimalCardProps {
  code: string;
  status?: string;
  probability?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

// USAMOS EXPORT CONST PARA ASEGURAR QUE SEA UNA EXPORTACIÓN NOMBRADA
export const RichAnimalCard = ({ code, status, probability, size = 'xl', onClick, className = '' }: RichAnimalCardProps) => {
  const imageUrl = useMemo(() => getAnimalImageUrl(code), [code]);

  const sizeMap: any = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    xl: 'w-56 h-56 lg:w-72 lg:h-72'
  };

  const statusColor: any = {
    'hot': 'bg-red-600',
    'cold': 'bg-blue-500',
    'caged': 'bg-slate-900'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-0 bg-transparent border-none shadow-none cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`} 
      onClick={onClick}
    >
      <div className={`relative flex items-center justify-center ${sizeMap[size] || sizeMap.xl}`}>
        <img 
          src={imageUrl} 
          className="w-full h-full object-contain" 
          alt="Animal" 
          crossOrigin="anonymous" 
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }} 
        />
      </div>
      {status && (
        <div className={`mt-2 px-4 py-1 ${statusColor[status] || 'bg-slate-400'} text-white text-[10px] font-black rounded-full uppercase italic shadow-lg`}>
          {status === 'caged' ? '⛓️ Enjaulado' : status === 'hot' ? '🔥 Caliente' : '❄️ Frío'}
        </div>
      )}
    </div>
  );
};

// TAMBIÉN EXPORTAMOS POR DEFECTO PARA QUE CUALQUIER TIPO DE IMPORTACIÓN FUNCIONE
export default RichAnimalCard;
