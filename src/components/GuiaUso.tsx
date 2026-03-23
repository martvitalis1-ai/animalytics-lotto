import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlayCircle, BookOpen, ShieldCheck, Zap } from "lucide-react";

export function GuiaUso() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: res } = await supabase.from('manual_guia').select('*').maybeSingle();
        if (res) setData(res);
      } catch (e) { 
        console.error("Error en Guia:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-40 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="font-black uppercase text-xs tracking-widest text-slate-400">Cargando Manual de Operaciones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
      
      {/* CABECERA DE LA GUÍA */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <BookOpen size={32} className="text-slate-900" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              {data?.titulo || "Centro de Capacitación"}
            </h2>
            <p className="text-sm text-emerald-400 font-bold uppercase tracking-widest mt-2">
              Protocolos de Análisis y Operación del Búnker
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL - ESTILO BÚNKER (BORDE NEGRO Y SOMBRA) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* SECCIÓN DE VIDEO */}
        <div className="bg-black aspect-video relative group border-b-4 border-slate-900">
          {data?.video_url ? (
            <video 
              controls 
              className="w-full h-full object-contain"
              poster="/logo-animalytics.png"
            >
              <source src={data.video_url} type="video/mp4" />
              Tu navegador no soporta video.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
               <Zap size={48} className="text-orange-500 animate-pulse" />
               <p className="text-white font-black uppercase text-xs tracking-[0.3em]">Enlace de video no detectado</p>
            </div>
          )}
          
          {/* Badge de "En Vivo" o "HD" */}
          <div className="absolute top-6 right-6 bg-red-600 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg">
            Video Tutorial HD
          </div>
        </div>

        {/* SECCIÓN DE TEXTO E INSTRUCCIONES */}
        <div className="p-10 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg">
              <PlayCircle size={20} />
            </div>
            <h3 className="font-black text-xl uppercase italic text-slate-800 tracking-tighter">
              Instrucciones de Uso Profesional
            </h3>
          </div>

          <div className="relative">
            {/* Adorno lateral naranja */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-full"></div>
            
            <p className="text-base md:text-lg font-bold leading-relaxed text-slate-600 pl-6 whitespace-pre-wrap italic">
              {data?.explicacion || "Configure el manual de instrucciones desde su panel de Supabase para guiar a los usuarios en el manejo de las probabilidades."}
            </p>
          </div>

          {/* Footer del Manual */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
            <span className="bg-slate-900 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-emerald-500/30">
              Protocolo Animalytics Pro
            </span>
            <span className="bg-slate-100 text-slate-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
              V2.1 Encrypted Data
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
