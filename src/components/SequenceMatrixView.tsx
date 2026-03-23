import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { Grid3X3, Loader2, ArrowRight } from "lucide-react";

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', lotteryId)
        .order('draw_date', { ascending: false })
        .order('draw_time', { ascending: false })
        .limit(500);
      setHistory(data || []);
      setLoading(false);
    };
    fetchHistory();
  }, [lotteryId]);

  // --- LÓGICA DE CÁLCULO DE SECUENCIAS (MATRIZ) ---
  const matrix = useMemo(() => {
    if (history.length < 2) return {};
    const counts: Record<string, Record<string, number>> = {};

    // Recorremos el historial para ver quién salió después de quién
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i].result_number.trim().padStart(2, '0').replace('000', '00');
      const previous = history[i + 1].result_number.trim().padStart(2, '0').replace('000', '00');

      if (!counts[previous]) counts[previous] = {};
      counts[previous][current] = (counts[previous][current] || 0) + 1;
    }
    return counts;
  }, [history]);

  // Obtenemos los animales que tienen datos de sucesores
  const animalsWithData = Object.keys(matrix).sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-6 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="bg-emerald-500 p-3 rounded-2xl">
          <Grid3X3 size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic leading-none">Matriz de Secuencia</h2>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-emerald-400">¿Qué animal atrae a cuál? - Análisis 500 sorteos</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white rounded-[3rem] border-2 border-slate-900">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
          <p className="font-black uppercase text-sm tracking-widest">Escaneando Sucesores...</p>
        </div>
      ) : animalsWithData.length === 0 ? (
        <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[3rem] italic text-slate-400 font-black uppercase">
          Esperando datos de {lotteryId.replace('_',' ')}...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animalsWithData.map((code) => {
            // Obtenemos los 3 sucesores que más veces han salido después de este animal
            const successors = Object.entries(matrix[code])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            return (
              <div key={code} className="bg-white p-8 rounded-[4rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-all">
                {/* Animal de Referencia */}
                <div className="flex flex-col items-center mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Si sale el:</span>
                  <div className="w-40 h-40 flex items-center justify-center">
                    <img src={getAnimalImageUrl(code)} className="w-full h-full object-contain" alt="" />
                  </div>
                </div>

                <ArrowRight className="text-emerald-500 mb-4 animate-bounce" size={24} />

                {/* Lista de Sucesores Probables */}
                <div className="w-full bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[9px] font-black text-center text-slate-400 uppercase tracking-widest mb-4 italic">Sucesores con mayor frecuencia:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {successors.map(([sCode, count]) => (
                      <div key={sCode} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm p-1 border border-slate-100">
                          <img src={getAnimalImageUrl(sCode)} className="w-full h-full object-contain" alt="" />
                        </div>
                        <span className="mt-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black italic">
                          {Math.round((count / history.length) * 100 * 10)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
