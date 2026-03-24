import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      
      // 1. Limpiamos el ID para que coincida con tu SQL
      let cleanId = lotteryId.toLowerCase().trim();
      if (cleanId === 'la_granjita') cleanId = 'granjita';
      if (cleanId === 'el_guacharo') cleanId = 'guacharo';

      // 2. Buscamos directamente en la tabla
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', cleanId)
        .eq('draw_date', selectedDate)
        .order('draw_time', { ascending: true });

      if (error) {
        console.error("Error de Supabase:", error);
      }

      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 pb-40 px-2">
      {/* HEADER DE LA BÓVEDA */}
      <div className="bg-slate-900 text-white p-6 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
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
      ) : results.length > 0 ? (
        // 3. Mostramos TODOS los resultados que existan en la DB
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {results.map((res, index) => (
            <div key={index} className="bg-white border-4 border-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative min-h-[180px]">
              <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[10px]">
                {res.draw_time}
              </span>
              <img 
                src={getAnimalImageUrl(res.result_number)} 
                className="w-32 h-32 md:w-44 md:h-44 mt-4 object-contain" 
                alt="Resultado"
              />
            </div>
          ))}
        </div>
      ) : (
        // 4. Mensaje si realmente no hay nada
        <div className="p-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
          <p className="font-black text-slate-400 uppercase">No hay resultados cargados para esta fecha.</p>
        </div>
      )}
    </div>
  );
}
