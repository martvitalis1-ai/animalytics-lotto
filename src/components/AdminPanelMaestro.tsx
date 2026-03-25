import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { Save, PlusCircle, AlertCircle } from 'lucide-react';

export function ResultsInsert() {
  const [lottery, setLottery] = useState("lotto_activo");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!time || !result) return toast.error("Faltan datos");
    setLoading(true);
    const { error } = await supabase.from('lottery_results').upsert({
      lottery_type: lottery === 'la_granjita' ? 'granjita' : lottery,
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
    <div className="space-y-8 text-slate-900">
      <div className="flex items-center gap-3 border-b-4 border-slate-100 pb-4">
        <PlusCircle size={32} className="text-slate-900" />
        <h3 className="font-black text-2xl uppercase italic tracking-tighter">Insertar Resultado</h3>
      </div>

      <div className="bg-amber-50 border-4 border-slate-900 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="text-amber-600 shrink-0" />
        <p className="font-bold text-xs uppercase text-amber-800">
          Importante: "0" = Delfín, "00" = Ballena. Ingrésalos exactamente como quieras guardarlos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SELECTOR DE LOTERIA - CORREGIDO LOGO Y FONDO */}
        <div className="space-y-2">
          <label className="font-black text-xs uppercase ml-2 text-slate-500">Lotería</label>
          <Select value={lottery} onValueChange={setLottery}>
            <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-4 border-slate-900 z-[200]">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-black uppercase py-3">
                  <div className="flex items-center gap-3">
                    <img src={getLotteryLogo(l.id)} className="w-6 h-6 object-contain" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-black text-xs uppercase ml-2 text-slate-500">Fecha del Sorteo</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        </div>

        <div className="space-y-2">
          <label className="font-black text-xs uppercase ml-2 text-slate-500">Hora del Sorteo</label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
          <label className="font-black text-xs uppercase ml-2 text-slate-500">Número Ganador</label>
          <Input value={result} onChange={e => setResult(e.target.value)} placeholder="Ej: 0, 00, 15..." className="border-4 border-slate-900 h-16 rounded-2xl font-black text-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-3xl font-black text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white transition-all active:translate-y-1 active:shadow-none">
        {loading ? "GUARDANDO..." : "GUARDAR RESULTADO"}
      </Button>
    </div>
  );
}
