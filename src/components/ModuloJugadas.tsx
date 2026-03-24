import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { Calendar, Loader2, history } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 📅 SELECTOR DE FECHA (Igual al video para buscar historial)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Obtenemos los horarios (08:00 AM a 07:00 PM)
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        // 🛡️ SINCRONIZACIÓN TOTAL CON SQL
        // Usamos el ID de la lotería y la fecha elegida
        const { data, error } = await supabase
          .from('lottery_results')
          .select('*')
          .eq('lottery_type', lotteryId)
          .eq('draw_date', selectedDate)
          .order('draw_time', { ascending: true });

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Error absorbiendo historial:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* CABECERA BÚNKER CON SELECTOR DE FECHA (FOTO 3 Y 4) */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg text-slate-900">
              <history size={30} />
           </div>
           <h2 className="font-black text-3xl uppercase italic tracking-tighter">Bóveda Histórica</h2>
        </div>
        
        {/* Input de Fecha Estilo Profesional */}
        <div className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-2xl border-4 border-slate-900 shadow-lg w-full md:w-auto">
          <Calendar className="text-emerald-500" size={24} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-black uppercase text-lg border-none focus:ring-0 outline-none w-full cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-40 text-center flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={60} />
          <p className="font-black uppercase text-sm tracking-[0.3em] text-slate-400">Abriendo Bóveda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {times.map(time => {
            // Buscamos si existe resultado para esta hora
            const res = results.find(r => r.draw_time.trim() === time.trim());
            
            return (
              <div 
                key={time} 
                className={`bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative min-h-[280px] transition-all hover:scale-105 ${res ? 'opacity-100 ring-8 ring-emerald-500/5' : 'opacity-40'}`}
              >
                {/* HORA DEL SORTEO EN CAPSULA */}
                <span className="absolute top-6 bg-slate-900 text-white px-6 py-1.5 rounded-full font-mono font-black text-xs italic tracking-tighter border-2 border-emerald-500/30 shadow-md">
                  {time}
                </span>
                
                {res ? (
                  <div className="flex flex-col items-center mt-8">
                    {/* IMAGEN 3D GIGANTE */}
                    <img 
                      src={getAnimalImageUrl(res.result_number)} 
                      className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl" 
                      alt="Resultado"
                    />
                    {/* El número ya viene en la imagen, pero lo ponemos discreto abajo para confirmar */}
                    <span className="font-black text-slate-400 mt-4 text-xs uppercase tracking-widest">
                       CONFIRMADO #{res.result_number}
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4 pt-8">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center">
                       <Loader2 className="text-slate-100 animate-spin" size={30} />
                    </div>
                    <span className="text-slate-200 font-black italic uppercase text-xs text-center px-4">
                      Pendiente
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER DE ESTADO */}
      {!loading && results.length === 0 && (
        <div className="p-10 text-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem]">
           <p className="text-slate-300 font-black uppercase italic text-xl tracking-widest">No se encontraron sorteos para esta fecha</p>
        </div>
      )}
    </div>
  );
}
