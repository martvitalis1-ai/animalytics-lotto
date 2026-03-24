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
      
      // Filtro flexible para asegurar que jale data (granjita o la_granjita)
      const idsABuscar = [lotteryId, lotteryId.replace('la_', '')];

      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .in('lottery_type', idsABuscar)
        .order('draw_date', { ascending: true })
        .order('draw_time', { ascending: true })
        .limit(1000); 

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
        
        const finalMap: Record<string, string[]> = {};
        Object.keys(map).forEach(key => {
          const counts = map[key].reduce((acc: any, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});
          
          finalMap[key] = Object.entries(counts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 3) // Solo los 3 sucesores más fuertes
            .map(entry => entry[0]);
        });
        
        setSequences(finalMap);
      }
      setLoading(false);
    }
    analyzeSequences();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase italic">Sincronizando Secuencias...</div>;

  return (
    <div className="space-y-10 pb-40 animate-in fade-in duration-700">
      <h3 className="font-black text-3xl md:text-4xl uppercase italic text-center text-slate-900 border-b-4 border-slate-100 pb-6">
        Matriz de Secuencia
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
        {codes.map((code) => {
          const successors = sequences[code] || [];
          return (
            <div key={code} className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6">
              
              {/* ANIMAL PRINCIPAL (GIGANTE) - Sin etiquetas de texto extra */}
              <div className="flex flex-col items-center w-full border-b-2 border-slate-50 pb-6">
                <img 
                  src={getAnimalImageUrl(code)} 
                  className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl" 
                  alt="Principal"
                />
              </div>

              {/* ANIMALES QUE SALEN DESPUÉS */}
              <div className="w-full text-center">
                <p className="text-[12px] font-black uppercase text-emerald-600 tracking-widest mb-6 italic">
                  Sucesores Detectados:
                </p>
                
                <div className="flex justify-center gap-4 md:gap-6">
                  {successors.length > 0 ? (
                    successors.map((nextCode, index) => (
                      <div key={index} className="flex flex-col items-center group">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-emerald-500 transition-all">
                          <img 
                            src={getAnimalImageUrl(nextCode)} 
                            className="w-16 h-16 md:w-20 md:h-20 object-contain" 
                            alt="Sucesor"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] font-bold text-slate-300 uppercase italic">Esperando datos de historial...</p>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
