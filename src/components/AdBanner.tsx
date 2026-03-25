import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function AdBanner({ slotId }: { slotId: string }) {
  const [adUrl, setAdUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase.from('ads').select('image_url').eq('id', slotId).maybeSingle();
      if (data) setAdUrl(data.image_url);
    };
    fetchAd();
  }, [slotId]);

  if (!adUrl) return null;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <img 
        src={adUrl} 
        className="max-w-full max-h-full object-contain select-none shadow-2xl" 
        alt="Publicidad" 
      />
    </div>
  );
}
