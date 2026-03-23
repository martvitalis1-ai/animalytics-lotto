// src/components/ResultsPanel.tsx
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { Calendar, Loader2 } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lottery_results')
          .select('*')
          .eq('lottery_type', lotteryId)
          .eq('draw_date', selectedDate)
          .order('draw_time', { ascending: true });

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Error Bóveda:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* CABECERA BÚNKER CON SELECTOR DE FECHA */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-3xl uppercase italic tracking-tighter">Bóveda Histórica</h2>
        
        <div className="flex items-center gap-3 bg-white text-slate-900 px-6 py-2 rounded-2xl border-4 border-slate-900 shadow-lg">
          <Calendar className="text-emerald-500" size={20} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-black uppercase text-sm border-none focus:ring-0 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-40 text-center flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="font-black uppercase text-xs tracking-widest text-slate-400">Abriendo Bóveda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {times.map(time => {
            const res = results.find(r => r.draw_time === time);
            return (
              <div 
                key={time} 
                className={`bg-white border-4 border-slate-900 rounded-[3rem] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative min-h-[250px] transition-all ${res ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className="absolute top-4 bg-slate-900 text-white px-5 py-1 rounded-full font-mono font-black text-[10px] italic">
                  {time}
                </span>
                
                {res ? (
                  <div className="flex flex-col items-center mt-6">
                    <img 
                      src={getAnimalImageUrl(res.result_number)} 
                      className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl" 
                      alt="Animal"
                    />
                    <span className="font-black text-slate-900 mt-2 text-lg italic uppercase">
                      #{res.result_number}
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-200 font-black italic uppercase text-center px-4 text-[10px]">
                    Pendiente
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
