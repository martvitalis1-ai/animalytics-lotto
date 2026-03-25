import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function AdBanner({ slotId }: { slotId: string }) {
  const [adUrl, setAdUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase.from('ads').select('image_url').eq('id', slotId).single();
      if (data) setAdUrl(data.image_url);
    };
    fetchAd();
  }, [slotId]);

  if (!adUrl) return null;

  return (
    <div className="mt-12 mb-6 animate-in fade-in zoom-in duration-700">
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <img src={adUrl} className="w-full h-auto object-cover" alt="Publicidad" />
      </div>
    </div>
  );
}
