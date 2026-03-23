import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { Grid3X3, Loader2, ArrowRightCircle, Database } from "lucide-react";

interface SuccessorData {
  trigger: string;
  followers: [string, number][];
  totalOccurrences: number;
}

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lottery_results')
          .select('result_number')
          .eq('lottery_type', lotteryId)
          .order('draw_date', { ascending: false })
          .order('draw_time', { ascending: false })
          .limit(600);
        
        if (error) throw error;
        setHistory(data || []);
      } catch (e) {
        console.error("Error en Matriz de Secuencia:", e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [lotteryId]);

  // --- PROCESAMIENTO DE DATOS (FUERA DEL JSX PARA EVITAR ERRORES DE BUILD) ---
  const matrixData = useMemo((): SuccessorData[] => {
    if (history.length < 2) return [];
    
    const counts: Record<string, Record<string, number>> = {};

    // Recorremos el historial para identificar sucesores directos
    for (let i = 0; i < history.length - 1; i++) {
      const actualRaw = history[i].result_number.trim();
      const previoRaw = history[i + 1].result_number.trim();
      
      const currCode = (actualRaw === '0' || actualRaw === '00') ? actualRaw : actualRaw.padStart(2, '0');
      const prevCode = (previoRaw === '0' || previoRaw === '00') ? previoRaw : previoRaw.padStart(2, '0');

      if (!counts[prevCode]) counts[prevCode] = {};
      counts[prevCode][currCode] = (counts[prevCode][currCode] || 0) + 1;
    }

    // Convertimos el objeto en un array estructurado y ordenado por importancia
    return Object.entries(counts).map(([trigger, followers]) => {
      const sortedFollowers = Object.entries(followers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const totalOccurrences = Object.values(followers).reduce((a, b) => a + b, 0);
      
      return { trigger, followers: sortedFollowers as [string, number][], totalOccurrences };
    }).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [history]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER DE ALTO IMPACTO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-[3.5rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Grid3X3 size={36} className="text-slate-900" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Matriz de Secuencia</h2>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 text-emerald-400 opacity-80">Patrones de Atracción — Basado en {history.length} sorteos</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/10">
           <Database size={14} className="text-emerald-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motor de Sucesión v2.1</span>
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center gap-4 bg-white rounded-[4rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <Loader2 className="animate-spin text-emerald-600" size={64} />
          <p className="font-black uppercase text-sm tracking-[0.4em] text-slate-400">Escaneando Algoritmos...</p>
        </div>
      ) : matrixData.length === 0 ? (
        <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[4rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <p className="italic text-slate-300 font-black uppercase text-xl">Sin datos para la lotería seleccionada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {matrixData.map(({ trigger, followers, totalOccurrences }) => (
            <div key={trigger} className="bg-white p-10 rounded-[5rem] border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center group hover:-translate-y-3 transition-all duration-500 relative overflow-hidden">
              
              <div className="w-full flex justify-between items-center mb-8 px-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase italic tracking-tighter">Si sale el:</span>
                </div>
                <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg border border-slate-700">
                  {totalOccurrences} Salidas
                </span>
              </div>

              {/* ANIMAL DISPARADOR (Trigger) */}
              <div className="relative w-56 h-56 lg:w-64 lg:h-64 mb-8 flex items-center justify-center">
                 <img src={getAnimalImageUrl(trigger)} className="w-full h-full object-contain z-10 drop-shadow-2xl" alt="" crossOrigin="anonymous" />
                 <span className="absolute inset-0 flex items-center justify-center text-[120px] lg:text-[150px] font-black text-slate-50 select-none opacity-40">#{trigger}</span>
              </div>

              <ArrowRightCircle className="text-emerald-500 mb-8 animate-pulse" size={45} />

              {/* SUCESORES PROBABLES */}
              <div className="w-full bg-slate-50 p-8 rounded-[3.5rem] border-2 border-slate-100 shadow-inner">
                <p className="text-[9px] font-black text-center text-slate-400 uppercase tracking-widest mb-6 italic border-b border-slate-200 pb-4">Probabilidad de Atracción:</p>
                <div className="grid grid-cols-3 gap-4">
                  {followers.map(([fCode, count]) => (
                    <div key={fCode} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border-2 border-slate-200 p-1 group-hover:border-emerald-500 transition-colors">
                        <img src={getAnimalImageUrl(fCode)} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
                      </div>
                      <span className="mt-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] font-black italic shadow-lg">
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
