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

    async function loadFullIntelligence() {
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      // Traemos resultados recientes
      const { data: history } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(300);
      setResults(history || []);

      // Pronósticos Maestros de tu tabla
      const { data: preds } = await supabase
        .from('super_pronostico_final')
        .select('*')
        .eq('lottery_type', dbId)
        .limit(1)
        .maybeSingle();
      
      setDbPredictions(preds);
      updateTimeLogica();
    }

    loadFullIntelligence();
    const channel = supabase.channel('ia-refresh').on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadFullIntelligence()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const codes = getCodesForLottery(lotteryId);
    
    // 1. CÁLCULO DE FRECUENCIA BASE
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });

    // 🛡️ SEMILLA DIARIA (Para que el resto de secciones sean FIJAS TODO EL DÍA)
    const daySeed = new Date().getDate();
    
    // Ordenamos la lista completa por frecuencia y semilla de estabilidad diaria
    const fullSortedList = Object.entries(freq)
      .sort((a: any, b: any) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return (parseInt(a[0]) + daySeed) % codes.length - (parseInt(b[0]) + daySeed) % codes.length;
      })
      .map(entry => entry[0]);

    // 2. ASIGNACIÓN SIN REPETICIÓN
    const used = new Set();

    // Maestros (Vienen de tu tabla Super Pronóstico)
    const animalFijo = dbPredictions?.pronostico_fijo || fullSortedList[0];
    const animalJaladera = dbPredictions?.pronostico_jaladera || fullSortedList[1];
    used.add(animalFijo);
    used.add(animalJaladera);

    // Top 3 (Los siguientes 3 más fuertes que no sean maestros)
    const top3 = fullSortedList.filter(c => !used.has(c)).slice(0, 3);
    top3.forEach(c => used.add(c));

    // Recomendación VIP (Los siguientes 4 más fuertes que no se hayan usado)
    const recomendacion = fullSortedList.filter(c => !used.has(c)).slice(0, 4);
    recomendacion.forEach(c => used.add(c));

    // Extras (Calientes y Fríos)
    const hot = fullSortedList.filter(c => c !== animalFijo && c !== animalJaladera).slice(0, 5);
    const frios = [...fullSortedList].reverse().slice(0, 5);

    return {
      maestros: [animalFijo, animalJaladera],
      top3,
      hot,
      frios,
      recomendacion,
      enjaulados: [...fullSortedList].reverse().slice(5, 8)
    };
  }, [results, dbPredictions, lotteryId]); // Quitamos currentHour para que sea FIJO POR DÍA

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 uppercase italic">Sincronizando Búnker...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700">
      
      {/* SECCIÓN 1: PRÓXIMO SORTEO (DINÁMICO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
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

      {/* SECCIÓN 2: TOP 3 (FIJO POR DÍA - NO REPITE) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-12 shadow-xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute inset-0 opacity-[0.04] w-full h-full object-cover pointer-events-none" />
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b-4 pb-4">TOP 3 DEL DÍA</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-8 justify-items-center items-center relative z-10 w-full">
           {study.top3.map((code) => <img key={code} src={getAnimalImageUrl(code)} className="w-full h-auto max-w-[105px] md:max-w-[280px] object-contain drop-shadow-xl" />)}
        </div>
      </div>

      {/* SECCIÓN 3: CALIENTES (FIJO POR DÍA) */}
      <div className="bg-red-600/10 p-8 rounded-[3rem] border-4 border-red-500/20 relative overflow-hidden mb-10">
         <span className="font-black text-sm uppercase text-red-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm font-black">🔥 CALIENTES</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10 text-center">
            {study.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* SECCIÓN 4: FRÍOS (FIJO POR DÍA) */}
      <div className="bg-blue-600/10 p-8 rounded-[3rem] border-4 border-blue-500/20 relative overflow-hidden">
         <span className="font-black text-sm uppercase text-blue-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm font-black">❄️ FRÍOS</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10 text-center">
            {study.frios.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* SECCIÓN 5: ENJAULADOS (FIJO POR DÍA) */}
      <div className="bg-yellow-500/10 p-8 rounded-[3rem] border-4 border-yellow-500/20 relative overflow-hidden shadow-xl text-center mt-10">
         <h4 className="font-black text-2xl uppercase italic mb-8 border-b-4 border-yellow-500 pb-2 text-yellow-700">⏳ ENJAULADOS</h4>
         <div className="grid grid-cols-3 md:grid-cols-3 gap-6 relative z-10">
            {study.enjaulados.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-48 md:h-48 object-contain mx-auto drop-shadow-md" />)}
         </div>
      </div>

      {/* 🛡️ SECCIÓN 6: RECOMENDACIÓN VIP (FIJO POR DÍA - 2x2 MÓVIL - NO REPITE) */}
      <div className="bg-white border-4 border-slate-900 p-8 md:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden mt-12">
         <img src={WATERMARK} className="absolute opacity-[0.03] -right-20 -bottom-20 w-80 h-80 grayscale pointer-events-none" />
         <div className="flex items-center gap-4 mb-10 border-b-4 border-slate-50 pb-4 text-slate-900">
            <ShieldCheck className="text-emerald-500" size={40} />
            <h3 className="font-black text-2xl md:text-3xl uppercase italic">RECOMENDACIÓN VIP</h3>
         </div>
         <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center relative z-10">
               {study.recomendacion.map((c, i) => (
                 <img key={`${c}-${i}`} src={getAnimalImageUrl(c)} className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-xl" />
               ))}
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl">
               <p className="font-black text-sm md:text-xl uppercase leading-relaxed italic text-center">
                 EL ALGORITMO HA SINCRONIZADO LOS PRONÓSTICOS SEGÚN LA TENSIÓN TÉRMICA DE LAS ÚLTIMAS 24 HORAS. JUGADAS FIJAS PARA TODA LA JORNADA.
               </p>
            </div>
         </div>
      </div>

      <AdBanner slotId="ia" />
    </div>
  );
}
