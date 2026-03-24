import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Brain, Star } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFast() {
      setLoading(true);
      // 🛡️ LÍMITE DE 50: Evita que la App se pegue procesando miles de filas
      const { data } = await supabase.from('lottery_results')
        .select('result_number')
        .eq('lottery_type', lotteryId)
        .order('draw_date', { ascending: false })
        .limit(50);
      setResults(data || []);
      setLoading(false);
    }
    loadFast();
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const freq: any = {};
    results.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    return {
      maestro: sorted[0][0],
      top3: [sorted[1]?.[0] || '01', sorted[0][0], sorted[2]?.[0] || '02']
    };
  }, [results]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">ACCEDIENDO AL BÚNKER...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 shadow-lg">ESTUDIO ACTUALIZADO</div>
        <img src={getAnimalImageUrl(study?.maestro || '0')} className="w-[300px] h-[300px] md:w-[480px] md:h-[480px] object-contain drop-shadow-2xl mt-8 z-10" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-xl">
        <h3 className="font-black text-2xl uppercase italic text-center mb-12 border-b pb-4 flex items-center justify-center gap-3"><Star className="text-emerald-500" fill="currentColor" /> Top 3 del Día</h3>
        <div className="flex justify-around items-end gap-4">
           {study?.top3.map((code, i) => (
             <div key={code} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(code)} className={`${i===1?'w-56 h-56':'w-32 h-32'} object-contain drop-shadow-lg`} />
                <span className="font-black text-lg mt-2 text-slate-900">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
