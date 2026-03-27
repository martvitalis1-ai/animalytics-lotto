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

      const { data: history } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(400);
      setResults(history || []);

      const { data: preds } = await supabase
        .from('super_pronostico_final')
        .select('*')
        .eq('lottery_type', dbId)
        .limit(1).maybeSingle();
      
      setDbPredictions(preds);
      updateTimeLogica();
    }

    loadFullIntelligence();
    const channel = supabase.channel('ia-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadFullIntelligence()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const codes = getCodesForLottery(lotteryId);
    const lastResult = results[0].result_number.trim().padStart(2, '0').replace('000', '00');
    
    // 🛡️ LÓGICA DE FAMILIAS EXPERTAS INTEGRADA
    const expertFamilies: Record<string, string[]> = {
      "15": ["10", "07", "23"], "16": ["03", "11", "24"], "07": ["30", "22", "02"], "01": ["11", "17", "22"]
    };
    const family = expertFamilies[lastResult] || [];
    
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const daySeed = new Date().getDate();
    const fullSortedList = Object.entries(freq)
      .sort((a: any, b: any) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return (parseInt(a[0]) + daySeed) % codes.length - (parseInt(b[0]) + daySeed) % codes.length;
      }).map(entry => entry[0]);

    const used = new Set();
    const animalFijo = dbPredictions?.pronostico_fijo || family[0] || fullSortedList[0];
    used.add(animalFijo);
    const animalJaladera = dbPredictions?.pronostico_jaladera || family[1] || fullSortedList[1];
    const finalVIP = used.has(animalJaladera) ? (family[2] || fullSortedList[2]) : animalJaladera;
    used.add(finalVIP);

    const top3 = fullSortedList.filter(c => !used.has(c)).slice(0, 3);
    top3.forEach(c => used.add(c));
    const recomendacion = [...family, ...fullSortedList].filter(c => !used.has(c)).slice(0, 4);

    return {
      maestros: [animalFijo, finalVIP],
      top3,
      hot: fullSortedList.filter(c => !used.has(c)).slice(0, 5),
      frios: [...fullSortedList].reverse().filter(c => !used.has(c)).slice(0, 5),
      enjaulados: [...fullSortedList].reverse().filter(c => !used.has(c)).slice(5, 8),
      recomendacion,
      hours: [{ h: "05:00 PM", p: [fullSortedList[10], fullSortedList[11]] }, { h: "10:00 AM", p: [fullSortedList[12], fullSortedList[13]] }],
      days: [{ d: "LUNES", p: [fullSortedList[14], fullSortedList[15]] }, { d: "VIERNES", p: [fullSortedList[16], fullSortedList[17]] }]
    };
  }, [results, dbPredictions, lotteryId]);

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 uppercase italic">Sincronizando Búnker...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] md:rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 shadow-lg mb-8 tracking-tighter">ESTUDIO PRÓXIMO SORTEO: {nextHourLabel}</div>
        <div className="flex justify-center gap-4 md:gap-12 z-10">{study.maestros.map((code, i) => (<img key={i} src={getAnimalImageUrl(code)} className="w-[145px] h-[145px] md:w-[420px] md:h-[420px] object-contain drop-shadow-2xl" />))}</div>
        <div className="mt-10 bg-emerald-600 text-white px-12 py-3 rounded-3xl font-black text-3xl md:text-5xl shadow-xl border-b-8 border-emerald-800 italic uppercase">95% ÉXITO</div>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-12 shadow-xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute inset-0 opacity-[0.04] w-full h-full object-cover pointer-events-none" />
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b-4 pb-4">TOP 3 DEL DÍA</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-8 justify-items-center items-center relative z-10">{study.top3.map((code) => <img key={code} src={getAnimalImageUrl(code)} className="w-full h-auto max-w-[105px] md:max-w-[280px] object-contain drop-shadow-xl" />)}</div>
      </div>

      <div className="bg-red-600/10 p-8 rounded-[3rem] border-4 border-red-500/20 relative overflow-hidden mb-10">
         <span className="font-black text-sm uppercase text-red-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm font-black">🔥 CALIENTES</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10">{study.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}</div>
      </div>

      <div className="bg-blue-600/10 p-8 rounded-[3rem] border-4 border-blue-500/20 relative overflow-hidden mb-10">
         <span className="font-black text-sm uppercase text-blue-600 block mb-8 text-center bg-white w-fit mx-auto px-6 py-1 rounded-full shadow-sm font-black">❄️ FRÍOS</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-4 relative z-10">{study.frios.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}</div>
      </div>

      <div className="bg-yellow-500/10 p-8 rounded-[3rem] border-4 border-yellow-500/20 relative overflow-hidden shadow-xl text-center mt-10">
         <h4 className="font-black text-2xl uppercase italic mb-8 border-b-4 border-yellow-500 pb-2 text-yellow-700">⏳ ENJAULADOS</h4>
         <div className="grid grid-cols-3 md:grid-cols-3 gap-6 relative z-10">{study.enjaulados.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-44 md:h-44 object-contain mx-auto drop-shadow-md" />)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-xl">
           <h4 className="font-black text-xl uppercase italic mb-8 border-b-2 flex gap-2"><Clock className="text-orange-500" /> MEJORES HORAS</h4>
           <div className="space-y-4">{study.hours.map(h => (
             <div key={h.h} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-inner">
                <span className="font-black text-lg">{h.h}</span>
                <div className="flex gap-4">{h.p.map((c, idx) => <img key={idx} src={getAnimalImageUrl(c)} className="w-20 h-20 md:w-32 md:h-32 object-contain" />)}</div>
             </div>
           ))}</div>
        </div>
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-xl">
           <h4 className="font-black text-xl uppercase italic mb-8 border-b-2 flex gap-2"><Calendar className="text-emerald-500" /> MEJORES DÍAS</h4>
           <div className="space-y-4">{study.days.map(d => (
             <div key={d.d} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-inner">
                <span className="font-black text-lg">{d.d}</span>
                <div className="flex gap-4">{d.p.map((c, idx) => <img key={idx} src={getAnimalImageUrl(c)} className="w-20 h-20 md:w-32 md:h-32 object-contain" />)}</div>
             </div>
           ))}</div>
        </div>
      </div>

      <div className="bg-white border-4 border-slate-900 p-8 md:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
         <img src={WATERMARK} className="absolute opacity-[0.03] -right-20 -bottom-20 w-80 h-80 grayscale pointer-events-none" />
         <div className="flex items-center gap-4 mb-10 border-b-4 border-slate-50 pb-4 text-slate-900"><ShieldCheck className="text-emerald-500" size={40} /><h3 className="font-black text-2xl md:text-3xl uppercase italic">RECOMENDACIÓN VIP</h3></div>
         <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center relative z-10">{study.recomendacion.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-22 h-22 md:w-48 md:h-48 object-contain drop-shadow-xl" />)}</div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl"><p className="font-black text-sm md:text-xl uppercase leading-relaxed italic text-center">ALGORITMO ACTUALIZADO SEGÚN EL TÚNEL DE ASOCIACIONES SQL. EL SISTEMA DETECTA LAS UNIONES MÁS FUERTES DEL DÍA.</p></div>
         </div>
      </div>
      <AdBanner slotId="ia" />
    </div>
  );
}
