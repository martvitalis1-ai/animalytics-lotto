import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, Flame, Snowflake, Lock, Calendar, ShieldCheck, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';

export function HourlyPredictionView({ lotteryId, onLotteryChange }: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: '' });

  const analyze = async () => {
    setLoading(true);
    try {
      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', lotteryId)
        .order('draw_date', { ascending: false })
        .limit(200);

      // ... Lógica de procesamiento de frecuencias (Hot, Cold, Caged) ...
      // Para efectos de diseño, simulamos el resultado del proceso:
      setData({
        hot: results?.slice(0, 4) || [],
        cold: results?.slice(10, 14) || [],
        caged: results?.slice(20, 24) || [],
        hours: ["10:00 AM", "04:00 PM", "07:00 PM"],
        days: ["Viernes", "Lunes"],
        rec: "La IA detecta un ciclo de repetición en el grupo de los felinos para las próximas 4 horas."
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { analyze(); }, [lotteryId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER: SELECTOR GLOBAL */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
        <span className="font-black text-xs uppercase text-slate-400 ml-4">Lotería Activa</span>
        <Select value={lotteryId} onValueChange={onLotteryChange}>
          <SelectTrigger className="w-[220px] border-none bg-transparent font-black uppercase text-sm shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOTTERIES.map(l => (
              <SelectItem key={l.id} value={l.id} className="font-bold">
                <div className="flex items-center gap-2">
                   <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RECOMENDACIÓN MAESTRA */}
      <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white relative overflow-hidden shadow-xl">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-40 opacity-10" />
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="fill-yellow-300 text-yellow-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sugerencia Animalytics</span>
        </div>
        <p className="text-xl font-black italic uppercase leading-tight">{data.rec}</p>
      </div>

      {/* GRID DE ANALÍTICA: CALIENTES, FRÍOS, ENJAULADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <p className="text-center font-black text-[10px] uppercase text-orange-500 bg-orange-50 py-2 rounded-full">🔥 Calientes (Alta Frecuencia)</p>
          <div className="grid grid-cols-2 gap-4">
            {data.hot.map((a: any) => <RichAnimalCard key={a.id} code={a.result_number} status="hot" />)}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-center font-black text-[10px] uppercase text-blue-500 bg-blue-50 py-2 rounded-full">❄️ Fríos (Baja Frecuencia)</p>
          <div className="grid grid-cols-2 gap-4">
            {data.cold.map((a: any) => <RichAnimalCard key={a.id} code={a.result_number} status="cold" />)}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-center font-black text-[10px] uppercase text-slate-700 bg-slate-100 py-2 rounded-full">⛓️ Enjaulados (Días sin salir)</p>
          <div className="grid grid-cols-2 gap-4">
            {data.caged.map((a: any) => <RichAnimalCard key={a.id} code={a.result_number} status="caged" />)}
          </div>
        </div>
      </div>

      {/* MEJORES HORAS Y DÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
          <h4 className="font-black text-xs uppercase text-emerald-400 mb-6 flex items-center gap-2 italic">
            <Clock size={16} /> Horarios con mayor acierto
          </h4>
          <div className="space-y-4">
            {data.hours.map((h: string) => (
              <div key={h} className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-xl font-bold">{h}</span>
                <span className="text-emerald-400 font-black text-xs">ALTA PROBABILIDAD</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100">
          <h4 className="font-black text-xs uppercase text-slate-400 mb-6 flex items-center gap-2 italic">
            <Calendar size={16} /> Tendencia Semanal
          </h4>
          <div className="space-y-4">
            {data.days.map((d: string) => (
              <div key={d} className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-black text-slate-700 uppercase">{d}</span>
                <div className="h-2 w-20 bg-emerald-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
