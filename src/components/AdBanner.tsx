import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon } from "lucide-react";

export function AdBanner({ slotId }: { slotId: string }) {
  const [adUrl, setAdUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase.from('ads').select('image_url').eq('id', slotId).maybeSingle();
      if (data) setAdUrl(data.image_url);
    };
    fetchAd();
  }, [slotId]);

  return (
    <div className="mt-10 mb-6 w-full animate-in fade-in zoom-in duration-700 px-1">
      <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden min-h-[120px] flex items-center justify-center relative shadow-inner">
        {adUrl ? (
          <img src={adUrl} className="w-full h-auto object-cover" alt="Publicidad" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <ImageIcon size={32} />
            <span className="font-black text-[9px] uppercase tracking-tighter text-center">Espacio de Publicidad<br/>Configurar en Panel Maestro</span>
          </div>
        )}
      </div>
    </div>
  );
}
