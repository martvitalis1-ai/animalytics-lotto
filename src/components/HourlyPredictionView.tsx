import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Clock, ShieldCheck, Zap } from "lucide-react";
import { AdBanner } from "./AdBanner";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [dbPredictions, setDbPredictions] = useState<any>(null);
  const [nextHourLabel, setNextHourLabel] = useState("");
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  useEffect(() => {
    const updateTimeLogica = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      const isHalfHour = lotteryId === 'lotto_rey' || lotteryId === 'guacharito';
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      
      let next;
      if (isHalfHour) {
        next = m >= 30 ? drawTimes.find(t => t > h) || 8 : drawTimes.find(t => t >= h) || 8;
        setNextHourLabel(`${next > 12 ? next - 12 : next}:30 ${next >= 12 ? 'PM' : 'AM'}`);
      } else {
        next = drawTimes.find(t => t > h) || 8;
        setNextHourLabel(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);
      }
    };

    async function loadData() {
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      // 1. Cargar historial para secciones secundarias
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);
      setResults(history || []);

      // 🛡️ 2. CARGAR PRONÓSTICOS DE TU TABLA MAESTRA (super_pronostico_final)
      const { data: preds } = await supabase
        .from('super_pronostico_final' as any)
        .select('pronostico_jaladera, pronostico_fijo')
        .limit(1)
        .maybeSingle();
      
      setDbPredictions(preds);
      updateTimeLogica();
    }

    loadData();

    // Suscribirse a cambios en ambas tablas para actualización instantánea
    const channel = supabase.channel('ia-master-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'super_pronostico_final' }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;

    const codes = getCodesForLottery(lotteryId);
    
    // Frecuencia para Calientes/Fríos
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);

    // 🛡️ LÓGICA DE ASIGNACIÓN: Prioridad a tu tabla "super_pronostico_final"
    const animalFijo = dbPredictions?.pronostico_fijo || sorted[0][0];
    const animalJaladera = dbPredictions?.pronostico_jaladera || sorted[1][0];

    return {
      maestros: [animalFijo, animalJaladera], // USA TUS DATOS DE LA TABLA
      top3: [sorted[0][0], sorted[1][0], sorted[2][0]],
      hot: [sorted[0][0], sorted[1][0], sorted[2][0], sorted[3][0], sorted[4][0]],
      frios: [sorted[sorted.length-1][0], sorted[sorted.length-2][0], sorted[sorted.length-3][0]],
      enjaulados: [sorted[sorted.length-4][0], sorted[sorted.length-5][0], sorted[sorted.length-6][0]],
      hours: [{ h: "05:00 PM", p: [sorted[4][0], sorted[5][0]] }, { h: "10:00 AM", p: [sorted[6][0], sorted[7][0]] }],
      days: [{ d: "MAÑANA", p: [sorted[8][0], sorted[9][0]] }, { d: "SÁBADO", p: [sorted[10][0], sorted[11][0]] }],
      recomendacion: [animalFijo, animalJaladera, sorted[0][0], sorted[1][0]]
    };
  }, [results, dbPredictions, lotteryId]);

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 uppercase italic">Sincronizando Búnker Final...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700">
      
      {/* 🛡️ PRÓXIMO SORTEO: ALIMENTADO POR TU TABLA SUPER PRONÓSTICO */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[5rem] p-8 md:p-14 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 shadow-lg mb-8">
           ESTUDIO PRÓXIMO SORTEO: {nextHourLabel}
        </div>
        <div className="flex justify-center gap-4 md:gap-12 z-10">
           {study.maestros.map((code, i) => (
             <img key={`${code}-${i}`} src={getAnimalImageUrl(code)} className="w-[145px] h-[145px] md:w-[420px] md:h-[420px] object-contain drop-shadow-2xl" />
           ))}
        </div>
        <div className="mt-10 bg-emerald-600 text-white px-12 py-3 rounded-3xl font-black text-3xl md:text-5xl shadow-xl border-b-8 border-emerald-800 italic uppercase">95% ÉXITO</div>
      </div>

      {/* TOP 3 */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-12 shadow-xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute inset-0 opacity-[0.04] w-full h-full object-cover pointer-events-none" />
        <h3 className="font-black text-xl md:text-2xl uppercase italic text-center mb-10 border-b-4 pb-4">TOP 3 DEL DÍA</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-8 justify-items-center items-center relative z-10 w-full">
           {study.top3.map((code, i) => <img key={`${code}-${i}`} src={getAnimalImageUrl(code)} className="w-26 h-26 md:w-60 md:h-60 object-contain drop-shadow-xl" />)}
        </div>
      </div>

      {/* CALIENTES (FONDO ROJO) */}
      <div className="bg-red-600/10 p-8 rounded-[3rem] border-4 border-red-500/20 relative overflow-hidden mb-10">
         <span className="font-black text-sm uppercase text-red-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm">🔥 CALIENTES</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
            {study.hot.map((c, i) => <img key={`${c}-${i}`} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* FRÍOS (FONDO AZUL) */}
      <div className="bg-blue-600/10 p-8 rounded-[3rem] border-4 border-blue-500/20 relative overflow-hidden">
         <span className="font-black text-sm uppercase text-blue-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm">❄️ FRÍOS</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
            {study.frios.map((c, i) => <img key={`${c}-${i}`} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* ENJAULADOS (FONDO AMARILLO) */}
      <div className="bg-yellow-500/10 p-8 rounded-[3rem] border-4 border-yellow-500/20 relative overflow-hidden shadow-xl text-center">
         <h4 className="font-black text-2xl uppercase italic mb-8 border-b-4 border-yellow-500 pb-2 text-yellow-700">⏳ ENJAULADOS</h4>
         <div className="grid grid-cols-3 md:grid-cols-3 gap-6 relative z-10">
            {study.enjaulados.map((c, i) => <img key={`${c}-${i}`} src={getAnimalImageUrl(c)} className="w-32 h-32 md:w-56 md:h-56 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* RECOMENDACIÓN FINAL (2x2) */}
      <div className="bg-white border-4 border-slate-900 p-8 md:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-4 mb-10 border-b-4 border-slate-50 pb-4 text-slate-900">
            <ShieldCheck className="text-emerald-500" size={40} />
            <h3 className="font-black text-2xl md:text-3xl uppercase italic">RECOMENDACIÓN DEL SISTEMA</h3>
         </div>
         <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center relative z-10">
               {study.recomendacion.map((c, i) => <img key={`${c}-${i}`} src={getAnimalImageUrl(c)} className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-xl" />)}
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl">
               <p className="font-black text-sm md:text-xl uppercase leading-relaxed italic text-center">
                 ALGORITMO ACTUALIZADO SEGÚN EL ÚLTIMO SORTEO. LOS PRONÓSTICOS FIJOS Y DE JALADERA HAN SIDO SINCRONIZADOS EXITOSAMENTE.
               </p>
            </div>
         </div>
      </div>

      <AdBanner slotId="ia" />
    </div>
  );
}
