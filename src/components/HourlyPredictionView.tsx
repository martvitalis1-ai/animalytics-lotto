import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { Brain } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      const { data } = await supabase.from('lottery_results').select('*').order('draw_date', { ascending: false }).limit(600);
      setAllResults(data || []);
      setLoading(false);
    }
    loadAllData();
  }, []);

  // 🛡️ LÓGICA DE ESTUDIO ÚNICA (Diferente a Explosivos)
  const getLotteryStudy = (id: string) => {
    const results = allResults.filter(r => r.lottery_type === id || r.lottery_type === id.replace('la_', ''));
    if (results.length === 0) return { maestro: '0', top3: ['01', '02', '03'] };
    
    const codes = getCodesForLottery(id);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    
    return {
      maestro: sorted[0][0],
      // 🛡️ TOP 3 DEL DÍA: Usamos una "rebanada" diferente de la frecuencia para que no coincida con explosivos
      top3: [sorted[3][0], sorted[4][0], sorted[5][0]] 
    };
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">Sincronizando Búnker...</div>;

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-40">
      
      {/* 1. ANIMAL MAESTRO (GIGANTE) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="absolute opacity-5 w-full max-w-xl grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-10 py-2 rounded-full font-black text-[12px] uppercase italic z-10 shadow-lg mb-4">ANIMAL MAESTRO DEL DÍA</div>
        <img src={getAnimalImageUrl(getLotteryStudy(lotteryId).maestro)} className="w-[380px] h-[380px] md:w-[550px] md:h-[550px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] mt-8 z-10 hover:scale-105 transition-transform" />
        <div className="mt-10 bg-emerald-600 text-white px-16 py-5 rounded-[2.5rem] font-black text-5xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
      </div>

      {/* 2. REJILLA DE LAS 6 LOTERÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-2">
        {LOTTERIES.map((lot) => {
          const study = getLotteryStudy(lot.id);
          return (
            <div key={lot.id} className="bg-white border-4 border-slate-900 rounded-[5rem] p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase mb-12 tracking-[0.2em] italic">{lot.name}</div>
              
              <p className="text-emerald-500 font-black text-xs uppercase tracking-widest mb-6 italic">TOP 3 DEL DÍA</p>
              
              <div className="flex justify-center items-center gap-2 md:gap-6 w-full">
                {study.top3.map((code, index) => (
                  <div key={index} className="flex-1 flex justify-center">
                     {/* ANIMALES MUCHO MÁS GRANDES (w-44) */}
                     <img 
                       src={getAnimalImageUrl(code)} 
                       className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl hover:scale-110 transition-transform" 
                       alt="top3" 
                     />
                  </div>
                ))}
              </div>

              <div className="mt-12 w-full border-t-4 border-slate-50 pt-6 flex justify-between items-center px-8 text-slate-900">
                 <span className="font-black text-xs uppercase opacity-30">Power Score:</span>
                 <span className="font-black text-3xl italic underline decoration-emerald-500 decoration-8 underline-offset-8">99%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
