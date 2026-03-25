import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { PlusCircle, AlertCircle, Save } from 'lucide-react';

export function ResultsInsert() {
  const [lottery, setLottery] = useState("lotto_activo");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!time || !result) return toast.error("Chamo, faltan datos");
    setLoading(true);
    const dbLotteryId = lottery === 'la_granjita' ? 'granjita' : lottery === 'el_guacharo' ? 'guacharo' : lottery;

    const { error } = await supabase.from('lottery_results').upsert({
      lottery_type: dbLotteryId,
      draw_date: date,
      draw_time: time,
      result_number: result.trim()
    }, { onConflict: 'lottery_type,draw_date,draw_time' });

    if (error) toast.error("Error al guardar");
    else {
      toast.success("RESULTADO GUARDADO");
      setResult("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 md:space-y-10 text-slate-900">
      <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
        <PlusCircle className="text-slate-900 w-8 h-8 md:w-10 md:h-10" />
        <h3 className="font-black text-xl md:text-3xl uppercase italic tracking-tighter">Insertar Resultado</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div className="space-y-2">
          <label className="font-black text-[10px] md:text-sm uppercase ml-2 text-slate-600 italic">1. Seleccionar Lotería</label>
          <Select value={lottery} onValueChange={setLottery}>
            <SelectTrigger className="border-4 border-slate-900 h-14 md:h-16 rounded-2xl font-black text-sm md:text-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-4 border-slate-900 z-[200]">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-black uppercase py-3">{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-black text-[10px] md:text-sm uppercase ml-2 text-slate-600 italic">2. Fecha</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-14 md:h-16 rounded-2xl font-black text-sm md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        </div>

        <div className="space-y-2">
          <label className="font-black text-[10px] md:text-sm uppercase ml-2 text-slate-600 italic">3. Hora</label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="border-4 border-slate-900 h-14 md:h-16 rounded-2xl font-black text-sm md:text-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SelectValue placeholder="SELECCIONAR HORA" />
            </SelectTrigger>
            <SelectContent className="bg-white border-4 border-slate-900 z-[200]">
              {getDrawTimesForLottery(lottery).map(t => (
                <SelectItem key={t} value={t} className="font-black uppercase">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-black text-[10px] md:text-sm uppercase ml-2 text-slate-600 italic">4. Número Ganador</label>
          <Input value={result} onChange={e => setResult(e.target.value)} placeholder="Ej: 09" className="border-4 border-slate-900 h-14 md:h-16 rounded-2xl font-black text-xl md:text-3xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>

      {/* 🛡️ BOTÓN CORREGIDO: Letras negras y no se sale en móvil */}
      <Button 
        onClick={handleSave} 
        disabled={loading} 
        className="w-full h-16 md:h-24 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-3xl uppercase italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-slate-900 transition-all active:translate-y-1 active:shadow-none"
      >
        {loading ? "GUARDANDO..." : "GUARDAR RESULTADO"}
      </Button>
    </div>
  );
}
