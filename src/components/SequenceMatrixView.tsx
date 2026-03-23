import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [sequences, setSequences] = useState<any>({});
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function analyze() {
      const dbId = lotteryId === 'granjita' ? 'la_granjita' : lotteryId === 'lotto_rey' ? 'lotto_rey' : lotteryId;
      const { data } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', dbId).order('created_at', { ascending: true }).limit(400);
      if (data) {
        const map: any = {};
        data.forEach((res, i) => {
          if (data[i+1]) {
            const cur = res.result_number;
            const nxt = data[i+1].result_number;
            if (!map[cur]) map[cur] = [];
            map[cur].push(nxt);
          }
        });
        setSequences(map);
      }
    }
    analyze();
  }, [lotteryId]);

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-6 md:p-12 shadow-2xl mt-10">
      <h3 className="font-black text-3xl uppercase italic mb-10 text-slate-800 border-b-4 border-slate-100 pb-4 text-center">Matriz de Secuencia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {codes.slice(0, 16).map(code => (
          <div key={code} className="bg-slate-50 border-4 border-slate-900 p-6 rounded-[3rem] flex flex-col items-center gap-6 hover:border-emerald-500 transition-all shadow-lg">
            <div className="flex items-center gap-4 w-full justify-center border-b-2 pb-4">
                <img src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                <span className="font-black text-4xl italic text-slate-900">#{code}</span>
            </div>
            <div className="w-full text-center">
              <p className="text-[11px] font-black uppercase text-emerald-600 tracking-widest mb-4 italic">Animales que salen después:</p>
              <div className="flex justify-center gap-4">
                {Array.from(new Set(sequences[code] || [])).slice(0, 3).map((nxt:any) => (
                  <div key={nxt} className="bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
                    <img src={getAnimalImageUrl(nxt)} className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                    <p className="font-black text-xs text-center mt-1">#{nxt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
