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
    <div className="mt-12 mb-8 w-full max-w-5xl mx-auto px-2">
      <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden min-h-[140px] flex items-center justify-center relative shadow-inner transition-all hover:border-emerald-200">
        {adUrl ? (
          <img src={adUrl} className="w-full h-auto object-cover animate-in fade-in zoom-in duration-500" alt="Publicidad" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30 text-slate-400">
            <ImageIcon size={40} />
            <span className="font-black text-[10px] uppercase tracking-widest text-center">
              Espacio Publicitario {slotId.toUpperCase()}<br/>Configurar en Panel Maestro
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
