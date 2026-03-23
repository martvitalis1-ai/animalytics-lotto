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
          .limit(600); // Analizamos 600 sorteos para mayor precisión
        setHistory(data || []);
      } catch (e) {
        console.error("Error en Matriz:", e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [lotteryId]);

  // --- CÁLCULO DE SECUENCIAS (FUERA DEL JSX PARA EVITAR ERRORES) ---
  const matrixData = useMemo(() => {
    if (history.length < 2) return [];
    
    const counts: Record<string, Record<string, number>> = {};

    // Recorremos el historial: history[i] es el sorteo, history[i+1] es el anterior
    for (let i = 0; i < history.length - 1; i++) {
      const actual = history[i].result_number.trim();
      const previo = history[i + 1].result_number.trim();
      
      const currCode = (actual === '0' || actual === '00') ? actual : actual.padStart(2, '0');
      const prevCode = (previo === '0' || previo === '00') ? previo : previo.padStart(2, '0');

      if (!counts[prevCode]) counts[prevCode] = {};
      counts[prevCode][currCode] = (counts[prevCode][currCode] || 0) + 1;
    }

    // Convertimos a array y ordenamos los animales que más "atraen" a otros
    return Object.entries(counts).map(([trigger, followers]) => {
      const sortedFollowers = Object.entries(followers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Top 3 sucesores
      
      const totalOccurrences = Object.values(followers).reduce((a, b) => a + b, 0);
      
      return { trigger, followers: sortedFollowers, totalOccurrences };
    }).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* CABECERA ESTILO BÚNKER */}
      <div className="flex items-center gap-4 bg-slate-900 text-white p-6 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
          <Grid3X3 size={32} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic leading-none tracking-tighter">Matriz de Secuencia</h2>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-emerald-400">¿Qué animal sale después de cada uno? — Sucesores</p>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-slate-900 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={50} />
          <p className="font-black uppercase text-sm tracking-[0.3em] text-slate-400">Escaneando Patrones...</p>
        </div>
      ) : matrixData.length === 0 ? (
        <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[3rem] italic text-slate-300 font-black uppercase">
          Esperando flujo de datos...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matrixData.map(({ trigger, followers, totalOccurrences }) => (
            <div key={trigger} className="bg-white p-8 rounded-[4rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center group hover:-translate-y-2 transition-all duration-300">
              
              <div className="w-full flex justify-between items-center mb-6 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase italic">Referencia</span>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">{totalOccurrences} Casos</span>
              </div>

              {/* ANIMAL DISPARADOR (Trigger) */}
              <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
                 <img src={getAnimalImageUrl(trigger)} className="w-full h-full object-contain z-10 drop-shadow-2xl" alt="" />
                 <span className="absolute inset-0 flex items-center justify-center text-[100px] font-black text-slate-50 select-none">#{trigger}</span>
              </div>

              <ArrowRightCircle className="text-emerald-500 mb-6 animate-pulse" size={30} />

              {/* SUCESORES PROBABLES */}
              <div className="w-full bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <p className="text-[9px] font-black text-center text-slate-400 uppercase tracking-widest mb-4 italic">Sucesores con mayor frecuencia:</p>
                <div className="grid grid-cols-3 gap-4">
                  {followers.map(([fCode, count]) => (
                    <div key={fCode} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                        <img src={getAnimalImageUrl(fCode)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <span className="mt-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black italic">
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
