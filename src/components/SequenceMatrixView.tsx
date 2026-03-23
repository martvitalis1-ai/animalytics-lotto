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
          .limit(800); // Analizamos los últimos 800 para máxima precisión
        
        if (error) throw error;
        setHistory(data || []);
      } catch (e) {
        console.error("Error en Matriz de Secuencia:", e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [lotteryId]);

  // --- CÁLCULO DE LA MATRIZ (ESTO ES EL CEREBRO DEL COMPONENTE) ---
  const matrixData = useMemo((): SuccessorData[] => {
    if (history.length < 2) return [];
    
    const counts: Record<string, Record<string, number>> = {};

    for (let i = 0; i < history.length - 1; i++) {
      const actualRaw = history[i].result_number.trim();
      const previoRaw = history[i + 1].result_number.trim();
      
      // Blindaje de identidad para 0 y 00
      const currCode = (actualRaw === '0' || actualRaw === '00') ? actualRaw : actualRaw.padStart(2, '0');
      const prevCode = (previoRaw === '0' || previoRaw === '00') ? previoRaw : previoRaw.padStart(2, '0');

      if (!counts[prevCode]) counts[prevCode] = {};
      counts[prevCode][currCode] = (counts[prevCode][currCode] || 0) + 1;
    }

    return Object.entries(counts).map(([trigger, followers]) => {
      const sortedFollowers = Object.entries(followers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Los 3 que más salen después de este
      
      const totalOccurrences = Object.values(followers).reduce((a, b) => a + b, 0);
      
      return { trigger, followers: sortedFollowers as [string, number][], totalOccurrences };
    }).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [history]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* HEADER TIPO BÚNKER ANALÍTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-[3.5rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            <Grid3X3 size={40} className="text-slate-900" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Matriz de Secuencia</h2>
            <p className="text-sm font-bold uppercase tracking-[0.2em] mt-2 text-emerald-400 opacity-80">
              Sucesores Históricos Directos — Animalytics Engine
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10">
           <Database size={16} className="text-emerald-400" />
           <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Database Live Sync</span>
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center gap-6 bg-white rounded-[4rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <Loader2 className="animate-spin text-emerald-600" size={80} />
          <p className="font-black uppercase text-lg tracking-[0.5em] text-slate-400">Analizando Tendencias...</p>
        </div>
      ) : matrixData.length === 0 ? (
        <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[4rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <p className="italic text-slate-300 font-black uppercase text-2xl">Sincronizando flujo de datos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {matrixData.map(({ trigger, followers, totalOccurrences }) => (
            <div key={trigger} className="bg-white p-10 rounded-[5rem] border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center group hover:-translate-y-4 transition-all duration-500 relative">
              
              <div className="w-full flex justify-between items-center mb-10 px-2">
                <span className="text-[11px] font-black text-slate-400 uppercase italic">Si sale el:</span>
                <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[11px] font-black uppercase shadow-lg">
                  {totalOccurrences} Casos
                </span>
              </div>

              {/* ANIMAL DISPARADOR (Trigger) */}
              <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                 <img 
                   src={getAnimalImageUrl(trigger)} 
                   className="w-full h-full object-contain z-10 drop-shadow-2xl" 
                   alt="" 
                   crossOrigin="anonymous" 
                 />
                 <span className="absolute inset-0 flex items-center justify-center text-[150px] font-black text-slate-50 select-none opacity-40">#{trigger}</span>
              </div>

              <ArrowRightCircle className="text-emerald-500 mb-10 animate-bounce" size={50} />

              {/* SUCESORES PROBABLES EN BLOQUE */}
              <div className="w-full bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest mb-8 italic border-b border-slate-200 pb-4">Atrae con mayor fuerza a:</p>
                <div className="grid grid-cols-3 gap-6">
                  {followers.map(([fCode, count]: any) => (
                    <div key={fCode} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-md border-2 border-slate-200 p-2 group-hover:border-emerald-400 transition-all">
                        <img 
                          src={getAnimalImageUrl(fCode)} 
                          className="w-full h-full object-contain" 
                          alt="" 
                          crossOrigin="anonymous" 
                        />
                      </div>
                      <span className="mt-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[12px] font-black italic shadow-lg">
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
