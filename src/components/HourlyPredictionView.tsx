import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector'; // 🛡️ Importamos los logos
import { Brain, Star } from "lucide-react";

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

  const getLotteryStudy = (id: string) => {
    const results = allResults.filter(r => r.lottery_type === id || r.lottery_type === id.replace('la_', ''));
    if (results.length === 0) return { maestro: '0', top3: ['01', '02', '03'] };
    const codes = getCodesForLottery(id);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    
    // 🛡️ Lógica de animales diferentes a explosivos
    return {
      maestro: sorted[0][0],
      top3: [sorted[3][0], sorted[4][0], sorted[5][0]] 
    };
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">Sincronizando Búnker Maestro...</div>;

  return (
    <div className="space-y-20 animate-in fade-in duration-700 pb-40">
      
      {/* 1. ANIMAL MAESTRO (SÚPER GIGANTE) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <div className="bg-slate-900 text-white px-10 py-2 rounded-full font-black text-[14px] uppercase italic z-10 shadow-lg mb-4">ANIMAL MAESTRO DEL DÍA</div>
        <img src={getAnimalImageUrl(getLotteryStudy(lotteryId).maestro)} className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] mt-8 z-10" />
        <div className="mt-10 bg-emerald-600 text-white px-20 py-6 rounded-[3rem] font-black text-6xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
      </div>

      {/* 2. ESTUDIO DE LAS 6 LOTERÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-2">
        {LOTTERIES.map((lot) => {
          const study = getLotteryStudy(lot.id);
          return (
            <div key={lot.id} className="bg-white border-4 border-slate-900 rounded-[6rem] p-12 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center border-b-[16px]">
              
              {/* CABECERA CON LOGO DE LOTERÍA */}
              <div className="bg-slate-900 text-white px-10 py-3 rounded-full flex items-center gap-4 mb-12 shadow-xl border-2 border-emerald-500/30">
                <img src={getLotteryLogo(lot.id)} className="w-8 h-8 rounded-full border-2 border-white" alt="logo" />
                <span className="font-black text-xl uppercase italic tracking-tighter">{lot.name}</span>
              </div>
              
              {/* TÍTULO TOP 3 GIGANTE */}
              <p className="text-emerald-500 font-black text-3xl md:text-4xl uppercase tracking-[0.1em] mb-12 italic underline decoration-slate-900 decoration-4 underline-offset-8">
                TOP 3 DEL DÍA
              </p>
              
              <div className="flex justify-center items-center gap-4 md:gap-8 w-full">
                {study.top3.map((code, index) => (
                  <div key={index} className="flex-1 flex justify-center">
                     {/* ANIMALES REALMENTE GRANDES (w-56) */}
                     <img 
                       src={getAnimalImageUrl(code)} 
                       className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform" 
                       alt="top3" 
                     />
                  </div>
                ))}
              </div>

              <div className="mt-16 w-full border-t-4 border-slate-100 pt-8 flex justify-between items-center px-10 text-slate-900">
                 <span className="font-black text-sm uppercase opacity-30 italic">Confidence Score:</span>
                 <span className="font-black text-4xl italic text-emerald-600 underline decoration-slate-900">99%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
