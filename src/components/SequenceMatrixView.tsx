import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { Grid3X3, Loader2, ArrowRightCircle } from "lucide-react";

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('lottery_results')
          .select('result_number')
          .eq('lottery_type', lotteryId)
          .order('draw_date', { ascending: false })
          .order('draw_time', { ascending: false })
          .limit(600);
        setHistory(data || []);
      } catch (e) {
        console.error("Error en Matriz:", e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [lotteryId]);

  // --- ZONA SEGURA: CÁLCULO DE MATRIZ FUERA DEL JSX ---
  const matrixData = useMemo(() => {
    if (history.length < 2) return [];
    
    const counts: Record<string, Record<string, number>> = {};

    for (let i = 0; i < history.length - 1; i++) {
      const actual = history[i].result_number.trim();
      const previo = history[i + 1].result_number.trim();
      
      const currCode = (actual === '0' || actual === '00') ? actual : actual.padStart(2, '0');
      const prevCode = (previo === '0' || previo === '00') ? previo : previo.padStart(2, '0');

      if (!counts[prevCode]) counts[prevCode] = {};
      counts[prevCode][currCode] = (counts[prevCode][currCode] || 0) + 1;
    }

    return Object.entries(counts).map(([trigger, followers]) => {
      const sortedFollowers = Object.entries(followers)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3);
      
      const totalOccurrences = Object.values(followers).reduce((a: number, b: number) => a + b, 0);
      
      return { trigger, followers: sortedFollowers, totalOccurrences };
    }).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [history]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* CABECERA ESTILO BÚNKER */}
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl bunker-border">
        <div className="bg-emerald-500 p-4 rounded-3xl shadow-lg">
          <Grid3X3 size={40} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Matriz de Secuencia</h2>
          <p className="text-sm font-bold uppercase tracking-[0.2em] mt-2 text-emerald-400">Análisis Predictivo de Sucesores Directos</p>
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center gap-4 bg-white rounded-[4rem] border-2 border-slate-900">
          <Loader2 className="animate-spin text-emerald-600" size={60} />
          <p className="font-black uppercase text-lg tracking-[0.4em] text-slate-400">Escaneando Patrones...</p>
        </div>
      ) : matrixData.length === 0 ? (
        <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[4rem] italic text-slate-300 font-black uppercase text-xl">
          Esperando flujo de datos maestros...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {matrixData.map(({ trigger, followers, totalOccurrences }) => (
            <div key={trigger} className="bg-white p-10 rounded-[5rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center group hover:-translate-y-3 transition-all duration-500 relative overflow-hidden">
              
              <div className="w-full flex justify-between items-center mb-8 px-4">
                <span className="text-[12px] font-black text-slate-400 uppercase italic tracking-widest">Referencia</span>
                <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">{totalOccurrences} Casos</span>
              </div>

              {/* ANIMAL DISPARADOR (XL) */}
              <div className="relative w-56 h-56 lg:w-64 lg:h-64 mb-8 flex items-center justify-center">
                 <img src={getAnimalImageUrl(trigger)} className="w-full h-full object-contain z-10 drop-shadow-2xl" alt="" />
                 <span className="absolute inset-0 flex items-center justify-center text-[120px] lg:text-[150px] font-black text-slate-50 select-none opacity-50">#{trigger}</span>
              </div>

              <ArrowRightCircle className="text-emerald-500 mb-8 animate-pulse" size={40} />

              {/* SUCESORES PROBABLES */}
              <div className="w-full bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest mb-6 italic">Sucesores Detectados:</p>
                <div className="grid grid-cols-3 gap-6">
                  {followers.map(([fCode, count]: any) => (
                    <div key={fCode} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-md border border-slate-200 p-2">
                        <img src={getAnimalImageUrl(fCode)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <span className="mt-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black italic shadow-md">
                        {Math.round((count / totalOccurrences) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
