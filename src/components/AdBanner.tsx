import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function AdBanner({ slotId }: { slotId: string }) {
  const [adUrl, setAdUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data } = await supabase.from('ads').select('image_url').eq('id', slotId).maybeSingle();
        if (data) setAdUrl(data.image_url);
      } catch (e) {
        console.error("Error cargando publicidad:", e);
      }
    };
    fetchAd();
  }, [slotId]);

  if (!adUrl) return null;

  return (
    <img 
      src={adUrl} 
      className="w-full h-auto block select-none" 
      alt="Publicidad" 
    />
  );
}
