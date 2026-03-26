import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LayoutGrid, ArrowDownCircle } from "lucide-react";

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  const [sequences, setSequences] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function analyzeSequences() {
      setLoading(true);
      // Mapeo idéntico al historial para no fallar en Guacharito y Rey
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: true })
        .order('draw_time', { ascending: true })
        .limit(1200); 

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
            .slice(0, 3) 
            .map(entry => entry[0]);
        });
        setSequences(finalMap);
      }
      setLoading(false);
    }
    analyzeSequences();
  }, [lotteryId]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase italic text-xs">Escaneando Sucesores...</p>
    </div>
  );

  return (
    /* 🛡️ CUADRO PRINCIPAL "ENCERRADO" ESTILO APP VIEJA */
    <div className="bg-white border-4 border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-700">
      
      {/* HEADER FIJO DEL CUADRO */}
      <div className="bg-slate-900 p-6 flex justify-between items-center border-b-4 border-slate-900">
        <div className="flex items-center gap-3">
          <LayoutGrid className="text-emerald-400" size={24} />
          <h3 className="font-black text-xl md:text-2xl uppercase italic text-white tracking-tighter">
            Matriz de Secuencia
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500 text-slate-900 px-4 py-1 rounded-full font-black text-[10px] uppercase">
          <ArrowDownCircle size={14} className="animate-bounce" /> Deslizar
        </div>
      </div>

      {/* 🛡️ AREA DE SCROLL INTERNO (Altura Fija para que no sea infinita) */}
      <div className="max-h-[600px] md:max-h-[800px] overflow-y-auto p-4 md:p-8 bg-slate-50/50 space-y-6 custom-scrollbar">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codes.map((code) => {
            const successors = sequences[code] || [];
            return (
              <div key={code} className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-lg flex flex-col items-center gap-4 hover:border-emerald-500 transition-colors group">
                
                {/* ANIMAL DISPARADOR (Más compacto pero aún grande) */}
                <div className="flex flex-col items-center w-full border-b-2 border-slate-100 pb-4">
                  <img 
                    src={getAnimalImageUrl(code)} 
                    className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-xl group-hover:scale-105 transition-transform" 
                    alt="Principal"
                  />
                </div>

                {/* SUCESORES DETECTADOS */}
                <div className="w-full text-center">
                  <p className="text-[11px] font-black uppercase text-emerald-600 tracking-tighter mb-4 italic">
                    Sucesores Probables:
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    {successors.length > 0 ? (
                      successors.map((nextCode, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:border-emerald-200 transition-all">
                            <img 
                              src={getAnimalImageUrl(nextCode)} 
                              className="w-12 h-12 md:w-20 md:h-20 object-contain" 
                              alt="Sucesor"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] font-bold text-slate-300 uppercase italic py-4">Sin datos suficientes</p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER DEL CUADRO */}
      <div className="bg-slate-100 p-3 text-center border-t-2 border-slate-200">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base de datos sincronizada • 100% histórico</p>
      </div>
    </div>
  );
}
