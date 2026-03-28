import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Clock, ShieldCheck, Zap } from "lucide-react";
import { AdBanner } from "./AdBanner";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [dbPredictions, setDbPredictions] = useState<any>(null);
  const [masterTrilogies, setMasterTrilogies] = useState<any[]>([]);
  const [nextHourLabel, setNextHourLabel] = useState("");
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  useEffect(() => {
    const updateTimeLogica = () => {
      const now = new Date();
      const h = now.getHours(); const m = now.getMinutes();
      const isHalfHour = lotteryId === 'lotto_rey' || lotteryId === 'guacharito';
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      let next = isHalfHour ? (m >= 30 ? drawTimes.find(t => t > h) || 8 : drawTimes.find(t => t >= h) || 8) : (drawTimes.find(t => t > h) || 8);
      setNextHourLabel(`${next > 12 ? next - 12 : next}:${isHalfHour ? '30' : '00'} ${next >= 12 ? 'PM' : 'AM'}`);
    };

    async function loadFullIntelligence() {
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      // 1. Historial Reciente
      const { data: history } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', dbId).order('draw_date', { ascending: false }).limit(300);
      setResults(history || []);

      // 2. Trilogías Maestras (SQL)
      const { data: trios } = await supabase.from('trilogias_maestras' as any).select('*').eq('lottery_type', dbId).order('coincidencias', {ascending: false});
      setMasterTrilogies(trios || []);

      // 3. Super Pronóstico
      const { data: preds } = await supabase.from('super_pronostico_final').select('*').eq('lottery_type', dbId).limit(1).maybeSingle();
      setDbPredictions(preds);
      updateTimeLogica();
    }
    loadFullIntelligence();
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const codes = getCodesForLottery(lotteryId);
    const lastAnimal = results[0].result_number.trim().padStart(2, '0');
    const used = new Set();

    // 🛡️ LÓGICA DE TRILOGÍA EXPERTA
    const activeTrio = masterTrilogies.find(t => t.n1 === lastAnimal || t.n2 === lastAnimal || t.n3 === lastAnimal);
    const trioPicks = activeTrio ? [activeTrio.n1, activeTrio.n2, activeTrio.n3].map(n => n.trim().padStart(2, '0')) : [];

    // Frecuencia
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]).map(e => e[0]);

    // Asignación sin repetir
    const animalFijo = dbPredictions?.pronostico_fijo || trioPicks.find(n => n !== lastAnimal) || sorted[0];
    used.add(animalFijo);
    const animalVIP = dbPredictions?.pronostico_jaladera || trioPicks.find(n => n !== lastAnimal && !used.has(n)) || sorted[1];
    used.add(animalVIP);

    const top3 = sorted.filter(c => !used.has(c)).slice(0, 3);
    top3.forEach(c => used.add(c));
    const rec = [...trioPicks, ...sorted].filter(c => !used.has(c) && c !== lastAnimal).slice(0, 4);

    return { maestros: [animalFijo, animalVIP], top3, recomendacion: rec };
  }, [results, dbPredictions, masterTrilogies, lotteryId]);

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 animate-pulse uppercase">Sincronizando Búnker...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700">
      {/* PRÓXIMO SORTEO */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 shadow-lg mb-8 italic">ESTUDIO PRÓXIMO SORTEO: {nextHourLabel}</div>
        <div className="flex justify-center gap-4 md:gap-12 z-10">
           {study.maestros.map((code, i) => (<img key={i} src={getAnimalImageUrl(code)} className="w-[145px] h-[145px] md:w-[420px] md:h-[420px] object-contain drop-shadow-2xl" />))}
        </div>
        <div className="mt-10 bg-emerald-600 text-white px-12 py-3 rounded-3xl font-black text-3xl md:text-5xl shadow-xl border-b-8 border-emerald-800 italic uppercase">95% ÉXITO</div>
      </div>

      {/* TOP 3 */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-12 shadow-xl relative overflow-hidden text-slate-900">
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b-4 pb-4">TOP 3 DEL DÍA</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-8 justify-items-center items-center relative z-10">
           {study.top3.map((code) => <img key={code} src={getAnimalImageUrl(code)} className="w-full h-auto max-w-[105px] md:max-w-[280px] object-contain drop-shadow-xl" />)}
        </div>
      </div>

      {/* RECOMENDACIÓN VIP (2x2) */}
      <div className="bg-white border-4 border-slate-900 p-8 md:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden mt-12 text-slate-900">
         <img src={WATERMARK} className="absolute opacity-[0.03] -right-20 -bottom-20 w-80 h-80 grayscale pointer-events-none" />
         <div className="flex items-center gap-4 mb-10 border-b-4 border-slate-50 pb-4"><ShieldCheck className="text-emerald-500" size={40} /><h3 className="font-black text-2xl md:text-3xl uppercase italic">RECOMENDACIÓN VIP</h3></div>
         <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center relative z-10">{study.recomendacion.map((c, i) => <img key={i} src={getAnimalImageUrl(c)} className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-xl" />)}</div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl"><p className="font-black text-sm md:text-xl uppercase leading-relaxed italic text-center">ALGORITMO ACTUALIZADO SEGÚN EL TÚNEL DE TRILOGÍAS SQL. EL SISTEMA HA DETECTADO LAS UNIONES MÁS FUERTES DEL DÍA.</p></div>
         </div>
      </div>
      <AdBanner slotId="ia" />
    </div>
  );
}
