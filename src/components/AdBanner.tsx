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
    <div className="w-full h-full overflow-hidden">
      <img 
        src={adUrl} 
        className="w-full h-full object-cover" 
        alt="Publicidad" 
      />
    </div>
  );
}
