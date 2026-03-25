import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Obtenemos los horarios ordenados según la lotería
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      
      // Mapeo de ID para la base de datos
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', dbId)
        .eq('draw_date', selectedDate);

      if (error) console.error("Error cargando búnker:", error);

      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-500">
      {/* HEADER DE BÓVEDA */}
      <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] md:rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-xl md:text-2xl uppercase italic text-emerald-400">
          Bóveda: {lotteryId.replace('_', ' ')}
        </h2>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-sm border-4 border-slate-900 w-full md:w-auto text-center"
        />
      </div>

      {loading ? (
        <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase">Abriendo Búnker...</div>
      ) : (
        /* 🛡️ RENDERIZADO CRONOLÓGICO: Mapeamos la lista de TIEMPOS, no los resultados */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {times.map((time) => {
            // Buscamos si existe un resultado que coincida exactamente con esta hora de la lista
            const res = results.find(r => 
              r.draw_time.trim().toUpperCase() === time.trim().toUpperCase()
            );

            return (
              <div 
                key={time} 
                className={`bg-white border-4 border-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative min-h-[180px] transition-all ${res ? 'opacity-100 scale-100' : 'opacity-10 scale-95'}`}
              >
                {/* La hora siempre sale en orden porque viene de la constante */}
                <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[10px] tracking-tighter">
                  {time}
                </span>
                
                {res && (
                  <img 
                    src={getAnimalImageUrl(res.result_number)} 
                    className="w-32 h-32 md:w-44 md:h-44 mt-4 object-contain animate-in zoom-in duration-300" 
                    alt="Animal"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mensaje si la fecha está totalmente vacía */}
      {!loading && results.length === 0 && (
        <div className="p-10 text-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem]">
           <p className="font-black text-slate-300 uppercase text-xs">Sin registros para esta fecha</p>
        </div>
      )}
    </div>
  );
}
