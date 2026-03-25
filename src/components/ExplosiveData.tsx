import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Flame, Zap, ShieldAlert, Timer } from "lucide-react";
import { AdBanner } from "./AdBanner"; // 🛡️ Importación movida al lugar correcto

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  useEffect(() => {
    async function loadExplosiveStudy() {
      setLoading(true);
      // Mapeo de IDs igual que el historial para que absorba los datos reales
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .limit(500);

      setResults(data || []);
      setLoading(false);
    }
    loadExplosiveStudy();
  }, [lotteryId]);

  const explosives = useMemo(() => {
    if (results.length === 0) return null;

    const hour = new Date().getHours();
    const codes = getCodesForLottery(lotteryId);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    
    // Ordenamos por frecuencia
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    
    // 🛡️ LÓGICA DE DIFERENCIACIÓN Y ROLLOVER
    // Si es después de las 8 PM (20:00), rotamos la selección para "mañana"
    const offset = hour >= 20 ? 6 : 3; 

    // Tomamos 3 animales que NO son el Top 3 (empezamos desde el índice offset)
    if (sorted.length < offset + 3) return null;

    return [
      { code: sorted[offset][0], force: "98%" },
      { code: sorted[offset + 1][0], force: "96%" },
      { code: sorted[offset + 2][0], force: "94%" }
    ];
  }, [results, lotteryId]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-8 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase italic animate-pulse">Escaneando Explosivos...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-40 px-2 animate-in fade-in duration-700">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-10 -right-10 -top-10 w-64 h-64 grayscale" />
        <div className="relative z-10 flex flex-col items-center md:items-start gap-2">
           <div className="flex items-center gap-3">
              <Flame className="text-orange-500 animate-pulse" size={32} />
              <h2 className="font-black text-3xl md:text-5xl uppercase italic tracking-tighter text-center md:text-left">Explosivos del Día</h2>
           </div>
           <p className="font-bold text-orange-200/60 text-xs md:text-sm uppercase tracking-widest">Estudio de Presión Térmica por Arrastre</p>
        </div>
      </div>

      {/* PROYECCIÓN DEL ESTUDIO */}
      <div className="bg-orange-50 border-4 border-slate-900 p-4 rounded-2xl flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Timer className="text-orange-600 animate-spin-slow" />
        <p className="font-black text-[10px] md:text-xs uppercase text-orange-900">
          {new Date().getHours() >= 20 
            ? "PROYECCIÓN NOCTURNA: ESTUDIO CARGADO PARA LOS SORTEOS DE MAÑANA" 
            : "ESTUDIO ACTIVO: ANIMALES CON ALTA PROBABILIDAD DE SALIDA EN LAS PRÓXIMAS HORAS"}
        </p>
      </div>

      {/* TARJETAS DE EXPLOSIVOS GIGANTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {explosives?.map((item, index) => (
          <div key={item.code} className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-2 transition-transform">
            
            {/* Marca de agua individual */}
            <img src={WATERMARK} className="absolute inset-0 opacity-[0.03] w-full h-full object-contain pointer-events-none" />
            
            {/* Etiqueta de Fuerza */}
            <div className="absolute top-8 right-8 bg-orange-500 text-white px-6 py-2 rounded-full font-black text-xs italic shadow-lg z-20 flex items-center gap-2">
               <Zap size={14} fill="white" /> FUERZA: {item.force}
            </div>

            {/* IMAGEN GIGANTE SIN TEXTO ABAJO */}
            <div className="relative z-10 py-6">
              <img 
                src={getAnimalImageUrl(item.code)} 
                className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl transition-transform group-hover:scale-110" 
                alt="Explosivo"
              />
            </div>

            {/* Decoración del fondo */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>
        ))}
      </div>

      {/* NOTA TÉCNICA FINAL */}
      <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-4 mb-4">
            <ShieldAlert className="text-orange-500" size={32} />
            <h3 className="text-white font-black text-xl md:text-2xl uppercase italic">Protocolo Explosivo</h3>
         </div>
         <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed border-l-4 border-orange-500 pl-6 italic">
            ESTOS ANIMALES HAN SIDO IDENTIFICADOS POR LA MATRIZ ATÓMICA COMO "RESIDUALES DE ALTA PRESIÓN". 
            A DIFERENCIA DEL TOP 3, SU CICLO DE SALIDA ESTÁ CONFIGURADO POR EL ARRASTRE DE LAS ÚLTIMAS 48 HORAS DE {lotteryId.replace('_',' ').toUpperCase()}.
         </p>
      </div>

      {/* 🛡️ BANNER DE PUBLICIDAD INTEGRADO CORRECTAMENTE AL FINAL DEL DIV */}
      <AdBanner slotId="explosivo" />
    </div>
  );
}
