import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [sequences, setSequences] = useState<any>({});
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function analyze() {
      const { data } = await supabase.from('lottery_results')
        .select('result_number').eq('lottery_type', lotteryId).order('created_at', { ascending: true });
      
      if (data) {
        const seq: any = {};
        data.forEach((res, i) => {
          if (data[i+1]) {
            const current = res.result_number;
            const next = data[i+1].result_number;
            if (!seq[current]) seq[current] = [];
            seq[current].push(next);
          }
        });
        setSequences(seq);
      }
    }
    analyze();
  }, [lotteryId]);

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl mt-12">
      <h3 className="font-black text-2xl uppercase italic mb-8 text-slate-800">Matriz de Secuencia (Sucesores)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.slice(0, 20).map(code => (
          <div key={code} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl flex items-center gap-4 hover:border-emerald-500 transition-all">
            <img src={getAnimalImageUrl(code)} className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Si sale #{code}, sigue:</p>
              <div className="flex gap-2 mt-2">
                {Array.from(new Set(sequences[code] || [])).slice(0, 3).map((next: any) => (
                  <img key={next} src={getAnimalImageUrl(next)} className="w-10 h-10 object-contain drop-shadow-md" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
