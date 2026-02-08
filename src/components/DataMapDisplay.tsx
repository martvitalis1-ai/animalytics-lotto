import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function DataMapDisplay() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImage();
    
    // Poll for changes every 30 seconds
    const interval = setInterval(loadImage, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadImage = async () => {
    try {
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!imageUrl) {
    return null; // Don't show anything if no image
  }

  return (
    <div className="mt-6 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg bg-card">
      <div className="text-center py-2 bg-primary/10 border-b border-primary/20">
        <span className="text-sm font-semibold text-primary">📊 Mapa de Datos</span>
      </div>
      <img 
        src={imageUrl} 
        alt="Mapa de Datos de Ruleta" 
        className="w-full h-auto object-contain"
        style={{ maxHeight: '80vh' }}
      />
    </div>
  );
}
