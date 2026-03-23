import { useState, useEffect, useMemo } from 'react';
import { supabase } from "../integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { History, Loader2, Clock } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Obtenemos los horarios oficiales del archivo de constantes
  const drawTimes = useMemo(() => getDrawTimesForLottery(lotteryId), [lotteryId]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lottery_results')
          .select('*')
          .eq('draw_date', selectedDate)
          .eq('lottery_type', lotteryId);
        
        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Error boveda:", err);
      }
      setLoading(false);
    };
    fetchResults();
  }, [selectedDate, lotteryId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* CABECERA ESTILO BÚNKER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-[2.5rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="flex items-center gap-3">
          <History className="text-emerald-400" size={24} />
          <h3 className="font-black uppercase italic text-xl tracking-tighter">Bóveda Histórica</h3>
        </div>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          className="bg-white text-slate-900 border-none rounded-xl px-4 py-2 font-black text-sm shadow-inner" 
        />
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="font-black uppercase text-xs tracking-widest text-slate-400">Abriendo Bóveda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drawTimes.map((time) => {
            const res = results.find(r => r.draw_time === time);
            return (
              <div 
                key={time} 
                className={`relative p-4 md:p-6 rounded-[3.5rem] border-2 border-slate-900 bg-white flex flex-col items-center justify-center min-h-[250px] md:min-h-[320px] transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${res ? 'opacity-100 ring-4 ring-emerald-500/10' : 'opacity-30 grayscale'}`}
              >
                {/* HORA DEL SORTEO */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-[10px] md:text-xs italic tracking-tighter border border-emerald-500/30">
                  {time}
                </div>

                {/* IMAGEN 3D GIGANTE */}
                {res ? (
                  <img 
                    src={getAnimalImageUrl(res.result_number)} 
                    className="w-32 h-32 md:w-52 md:h-52 object-contain mt-4 drop-shadow-2xl" 
                    alt="Animal"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center border-4 border-dashed border-slate-100 rounded-full italic text-slate-200 font-black uppercase text-[8px] text-center px-2">
                    Esperando Resultado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
