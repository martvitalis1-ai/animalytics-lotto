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
    
    const dbLotteryId = lottery === 'la_granjita' ? 'granjita' : 
                       lottery === 'el_guacharo' ? 'guacharo' : lottery;

    const { error } = await supabase.from('lottery_results').upsert({
      lottery_type: dbLotteryId,
      draw_date: date,
      draw_time: time,
      result_number: result.trim()
    }, { onConflict: 'lottery_type,draw_date,draw_time' });

    if (error) {
      console.error(error);
      toast.error("Error al guardar en la bóveda");
    } else {
      toast.success("RESULTADO GUARDADO EXITOSAMENTE");
      setResult("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 text-slate-900">
      {/* HEADER ESTILO BUNKER */}
      <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-6">
        <PlusCircle size={40} className="text-slate-900" />
        <h3 className="font-black text-3xl uppercase italic tracking-tighter">Insertar Resultado</h3>
      </div>

      {/* NOTA DE IMPORTANCIA */}
      <div className="bg-amber-400 border-4 border-slate-900 p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
        <AlertCircle size={24} className="text-slate-900 shrink-0" />
        <p className="font-black text-sm uppercase leading-tight">
          Importante: "0" = Delfín, "00" = Ballena. Ingrésalos exactamente como quieras guardarlos en el historial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* SELECTOR DE LOTERIA - SIN LOGO Y CON FONDO BLANCO SOLIDO */}
        <div className="space-y-3">
          <label className="font-black text-sm uppercase ml-2 text-slate-600 italic">1. Seleccionar Lotería</label>
          <Select value={lottery} onValueChange={setLottery}>
            <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-4 border-slate-900 z-[200] shadow-2xl">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-black uppercase py-4 text-slate-900 focus:bg-slate-100 cursor-pointer border-b-2 border-slate-50 last:border-0">
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* FECHA */}
        <div className="space-y-3">
          <label className="font-black text-sm uppercase ml-2 text-slate-600 italic">2. Fecha del Sorteo</label>
          <Input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" 
          />
        </div>

        {/* HORA */}
        <div className="space-y-3">
          <label className="font-black text-sm uppercase ml-2 text-slate-600 italic">3. Hora del Sorteo</label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <SelectValue placeholder="SELECCIONAR HORA" />
            </SelectTrigger>
            <SelectContent className="bg-white border-4 border-slate-900 z-[200] shadow-2xl">
              {getDrawTimesForLottery(lottery).map(t => (
                <SelectItem key={t} value={t} className="font-black uppercase py-4 text-slate-900 focus:bg-slate-100 cursor-pointer border-b-2 border-slate-50 last:border-0">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* NUMERO GANADOR */}
        <div className="space-y-3">
          <label className="font-black text-sm uppercase ml-2 text-slate-600 italic">4. Número Ganador</label>
          <Input 
            value={result} 
            onChange={e => setResult(e.target.value)} 
            placeholder="Ej: 09, 25, 0..." 
            className="border-4 border-slate-900 h-16 rounded-2xl font-black text-3xl text-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] placeholder:text-slate-200" 
          />
        </div>
      </div>

      {/* BOTON DE GUARDADO IMPACTANTE */}
      <Button 
        onClick={handleSave} 
        disabled={loading} 
        className="w-full h-24 bg-emerald-500 hover:bg-emerald-400 border-4 border-slate-900 rounded-[2.5rem] font-black text-3xl uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white transition-all active:translate-y-2 active:shadow-none"
      >
        {loading ? (
          <span className="flex items-center gap-3">GUARDANDO...</span>
        ) : (
          <span className="flex items-center gap-3"><Save size={32} /> GUARDAR RESULTADO</span>
        )}
      </Button>
    </div>
  );
}
