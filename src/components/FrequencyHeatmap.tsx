// src/components/SequenceMatrixView.tsx
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [sequences, setSequences] = useState<any>({});
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function load() {
      // Pedimos 1000 resultados para tener una secuencia real y potente
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('created_at', {ascending: true}).limit(1000);
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
    load();
  }, [lotteryId]);

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
      <h3 className="font-black text-2xl uppercase italic mb-8 border-b-4 border-slate-50 pb-4">Matriz de Secuencia (Sucesores)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.slice(0, 20).map(code => (
          <div key={code} className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 flex items-center gap-4">
            <img src={getAnimalImageUrl(code)} className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Si sale #{code}, sigue:</p>
              <div className="flex gap-2 mt-2">
                {Array.from(new Set(sequences[code] || [])).slice(0, 3).map((nxt:any) => (
                  <img key={nxt} src={getAnimalImageUrl(nxt)} className="w-10 h-10" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
