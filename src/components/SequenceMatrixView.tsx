import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [sequences, setSequences] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Obtenemos los códigos válidos (0-36, 75 o 99)
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function analyzeSequences() {
      setLoading(true);
      
      // Filtro para Granjita (la_granjita o granjita)
      const idsABuscar = [lotteryId, lotteryId.replace('la_',-center">
            
            {/* ANIMAL ACTUAL (GIGANTE) */}
            <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
               <img 
                 src={getAnimalImageUrl(code)} 
                 className="w-full h-full object-contain drop-shadow-2xl" 
                 alt="Actual"
               />
            </div>

            {/* SECCIÓN SUCESORES */}
            <div className="w-full mt-6 border-t-2 border-slate-50 pt-6">
              <p className="text-[12px] font-black uppercase text-emerald-600 tracking-widest text-center mb-6 italic">
                Animales que salen después:
              </p>
              
              <div className="flex justify-center gap-4 md:gap-6">
                {sequences[code] && sequences[code].length > 0 ? (
                  sequences[code].map((nextCode, index) => (
                    <div key={index} className="flex flex-col items-center group">
                      <div className="w-20 h-20 md '')];

      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .in('lottery_type', idsABuscar)
        .order('draw_date', { ascending: true })
        .order('draw_time', { ascending: true })
        .limit(1000); // Analizamos historial pesado para precisión

      if (data && data.length > 1) {
        const map: Record<string, string[]> = {};
        
        for (let i = 0; i < data.length - 1; i++) {
          const current = data[i].result_number?.trim();
          const next = data[i + 1].result_number?.trim();
          
          if (current && next) {
            if (!map[current]) map[current] = [];
            map[current].push(next);
          }
        }
        
        // Procesamos para dejar solo los 3 sucesores más frecuentes
        const finalMap: Record<string, string[]> = {};
        Object.keys(map).forEach(key => {
          const counts = map[key].reduce:w-24 md:h-24 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-emerald-500 transition-all">
                        <img 
                          src={getAnimalImageUrl(nextCode)} 
                          className="w-16 h-16 md:w-20 md:h-20 object-contain" 
                          alt="Sucesor"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Sin datos de secuencia aún</p>
                )}
              </div>
            </div>
          ((acc: any, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});
          
          finalMap[key] = Object.entries(counts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        });
        
        setSequences(finalMap);
      }
      setLoading(false);
    }
    analyzeSequences();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase italic">Analizando Secuencias Maest</div>
        ))}
      </div>
    </div>
  );
}
