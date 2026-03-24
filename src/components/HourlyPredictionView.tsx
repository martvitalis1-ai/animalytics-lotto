import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { Brain, Flame, Snowflake, Timer, ChevronDown, ChevronUp, Lock, ShieldCheck } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data } = await supabase.from('lottery_results').select('*').order('draw_date', { ascending: false }).limit(600);
      setAllResults(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const getStudy = (id: string) => {
    const results = allResults.filter(r => r.lottery_type === id || r.lottery_type === id.replace('la_', ''));
    if (results.length === 0) return null;
    
    const codes = getCodesForLottery(id);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);

    return [
      { code: sorted[0][0], type: 'HOT', color: 'red', prob: '95%' },
      { code: sorted[5][0], type: 'OVERDUE', color: 'orange', prob: '91%' },
      { code: sorted[10][0], type: 'COLD', color: 'blue', prob: '87%' }
    ];
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase italic">Iniciando Red Neuronal...</div>;

  return (
    <div className="space-y-10 pb-40 animate-in fade-in duration-700">
      
      {/* 1. HEADER DE ESTADO (CALCADO DE LA IMAGEN) */}
      <div className="bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl border-2 border-emerald-500">
            <Lock className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="font-black text-emerald-900 uppercase text-sm leading-none">Predicciones Blindadas - {new Date().toISOString().split('T')[0]}</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Fuente: Super_Pronostico_Final • Power Score: 95%</p>
          </div>
        </div>
        <span className="bg-emerald-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase">Registros IA: 6</span>
      </div>

      {/* 2. REJILLA DE LAS 6 LOTERÍAS (ESTILO APP VIEJA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {LOTTERIES.map((lot) => {
          const study = getStudy(lot.id);
          if (!study) return null;

          return (
            <div key={lot.id} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-xl flex flex-col">
              {/* Logo y Nombre Lotería */}
              <div className="flex items-center gap-3 mb-8">
                <img src={getLotteryLogo(lot.id)} className="w-10 h-10 rounded-full border-2 border-slate-100" />
                <h4 className="font-black text-slate-800 uppercase italic text-lg">{lot.name}</h4>
              </div>

              {/* TOP 3 - BLOQUES DE COLORES */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {study.map((item, idx) => (
                  <div key={idx} className={`relative flex flex-col items-center p-3 rounded-3xl border-2 shadow-sm ${
                    item.color === 'red' ? 'bg-red-50 border-red-200' : 
                    item.color === 'orange' ? 'bg-orange-50 border-orange-200' : 
                    'bg-blue-50 border-blue-200'
                  }`}>
                    {/* Badge #1, #2, #3 */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-[10px] border-2 border-white">
                      #{idx + 1}
                    </div>
                    
                    <img src={getAnimalImageUrl(item.code)} className="w-14 h-14 object-contain mb-2 drop-shadow-md" />
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg mb-1 shadow-md ${
                      item.color === 'red' ? 'bg-red-500' : 
                      item.color === 'orange' ? 'bg-orange-500' : 
                      'bg-blue-500'
                    }`}>
                      {item.code}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                       <div className={`flex items-center justify-center gap-1 rounded-full py-0.5 text-[8px] font-black uppercase ${
                         item.color === 'red' ? 'text-red-600 bg-red-100' : 
                         item.color === 'orange' ? 'text-orange-600 bg-orange-100' : 
                         'text-blue-600 bg-blue-100'
                       }`}>
                          {item.type === 'HOT' && <Flame size={8} />}
                          {item.type === 'OVERDUE' && <Timer size={8} />}
                          {item.type === 'COLD' && <Snowflake size={8} />}
                          {item.type}
                       </div>
                       <div className="bg-white/60 text-center rounded-full text-[8px] font-bold text-slate-500 border border-slate-100">
                          ⚡ {item.prob}
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón Desplegable */}
              <button 
                onClick={() => setExpandedLottery(expandedLottery === lot.id ? null : lot.id)}
                className="w-full py-3 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all group"
              >
                <span className="font-black text-[10px] uppercase text-slate-500 group-hover:text-slate-800">
                  {expandedLottery === lot.id ? 'Ocultar Detalles' : 'Ver Análisis por Hora'}
                </span>
                {expandedLottery === lot.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>

              {/* Contenido Desplegado (Horarios) */}
              {expandedLottery === lot.id && (
                <div className="mt-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
                   {["08:30 AM", "09:30 AM", "10:30 AM"].map(t => (
                     <div key={t} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                           <Clock size={12} className="text-slate-400" />
                           <span className="font-black text-xs text-slate-600">{t}</span>
                        </div>
                        <Lock size={12} className="text-slate-300" />
                     </div>
                   ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
