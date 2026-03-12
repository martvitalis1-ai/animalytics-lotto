import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Map as MapIcon } from "lucide-react";

interface DataMapDisplayProps {
  customMap?: string; // Recibe el mapa personalizado de la agencia
}

export function DataMapDisplay({ customMap }: DataMapDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadImage = async () => {
    // Si el Dashboard nos pasó un mapa personalizado de la agencia, lo usamos de una vez
    if (customMap) {
      setImageUrl(customMap);
      setLoading(false);
      return;
    }

    try {
      // Si no hay mapa personalizado, buscamos el mapa maestro en el bucket
      const { data } = await supabase
        .storage
        .from('roulette-maps')
        .list('', { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

      if (data && data.length > 0) {
        const { data: urlData } = supabase
          .storage
          .from('roulette-maps')
          .getPublicUrl(data[0].name);
        
        setImageUrl(urlData.publicUrl);
      } else {
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Error loading map image:', error);
      setImageUrl(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImage();
    
    // Solo hacemos polling si NO tenemos un mapa personalizado (para ahorrar recursos)
    if (!customMap) {
      const interval = setInterval(loadImage, 30000);
      return () => clearInterval(interval);
    }
  }, [customMap]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!imageUrl) {
    return null; 
  }

  return (
    <div className="mt-8 rounded-[3rem] overflow-hidden border-4 border-emerald-500/20 shadow-2xl bg-card relative">
      <div className="text-center py-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-center gap-2">
        <MapIcon className="w-5 h-5 text-emerald-600" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 italic">
          Mapa de Inteligencia Operativa
        </span>
      </div>
      <div className="p-2 bg-white">
        <img 
          src={imageUrl} 
          alt="Mapa de Datos de Ruleta" 
          className="w-full h-auto object-contain rounded-[2rem]"
          style={{ maxHeight: '85vh' }}
          crossOrigin="anonymous"
        />
      </div>
      {/* Marca de agua de protección */}
      <div className="absolute bottom-6 right-8 opacity-20 pointer-events-none">
        <p className="font-black text-2xl italic uppercase text-slate-900 tracking-tighter">Animalytics Pro</p>
      </div>
    </div>
  );
}
