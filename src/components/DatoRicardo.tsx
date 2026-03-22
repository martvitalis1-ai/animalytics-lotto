import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Plus, Trash2, Pencil, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, DRAW_TIMES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

// Aceptamos el ID de la agencia si estamos en modo franquicia
interface DatoRicardoProps {
  agencyContextId?: string | null; 
}

export function DatoRicardo({ agencyContextId }: DatoRicardoProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumbers, setEditNumbers] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  const [lotteryType, setLotteryType] = useState<string>(LOTTERIES[0].id);
  const [predictionDate, setPredictionDate] = useState(new Date().toISOString().split('T')[0]);
  const [drawTime, setDrawTime] = useState(DRAW_TIMES[0]);
  const [numbers, setNumbers] = useState("");
  const [notes, setNotes] = useState("");

  const loadPredictions = async () => {
    let query = supabase
      .from('dato_ricardo_predictions')
      .select('*');

    // FILTRO CRÍTICO: Si es agencia, solo ve sus datos. Si es Admin, ve lo que no tiene agencia (Dato Maestro)
    if (agencyContextId) {
      query = query.eq('agencia_id', agencyContextId);
    } else {
      query = query.is('agencia_id', null);
    }

    const { data } = await query.order('prediction_date', { ascending: false }).order('draw_time', { ascending: true });
    setPredictions(data || []);
  };

  useEffect(() => { loadPredictions(); }, [agencyContextId]);

  const handleSubmit = async () => {
    if (!numbers.trim()) return toast.error("Ingresa los números");
    setLoading(true);
    const numbersArray = numbers.split(',').map(n => n.trim()).filter(n => n);
    
    const { error } = await supabase.from('dato_ricardo_predictions').insert({
      lottery_type: lotteryType,
      prediction_date: predictionDate,
      draw_time: drawTime,
      predicted_numbers: numbersArray,
      notes: notes || null,
      agencia_id: agencyContextId || null // Guardamos el dueño del dato
    });

    if (!error) { 
      toast.success("Pronóstico publicado"); 
      setNumbers(""); 
      setNotes(""); 
      loadPredictions(); 
    } else {
      toast.error("Error al publicar");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este pronóstico?")) return;
    const { error } = await supabase.from('dato_ricardo_predictions').delete().eq('id', id);
    if (!error) { toast.success("Eliminado"); loadPredictions(); }
  };

  const groupedPredictions = predictions.reduce((acc, p) => {
    const date = p.prediction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4 text-slate-900">
      <Card className="glass-card border-2 border-emerald-500/20">
        <CardHeader><CardTitle className="text-base font-black flex items-center gap-2 uppercase italic text-emerald-700">
          <Plus className="w-5 h-5" /> {agencyContextId ? 'Publicar Mi Dato VIP' : 'Nuevo Pronóstico Maestro'}
        </CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={lotteryType} onValueChange={setLotteryType}><SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger><SelectContent>{LOTTERIES.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}</SelectContent></Select>
            <Input type="date" value={predictionDate} onChange={(e) => setPredictionDate(e.target.value)} className="h-12 font-bold" />
            <Select value={drawTime} onValueChange={setDrawTime}><SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger><SelectContent>{DRAW_TIMES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Ejem: 01,25,00" value={numbers} onChange={(e) => setNumbers(e.target.value)} className="font-mono h-12 font-black text-center" />
          </div>
          <Textarea placeholder="Mensaje para tus clientes (Opcional)..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="font-medium" />
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-lg rounded-2xl shadow-lg transition-all">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "PUBLICAR AHORA"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Historial de Mis Publicaciones</CardTitle></CardHeader>
        <CardContent className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
          {Object.entries(groupedPredictions).map(([date, items]) => (
            <div key={date} className="space-y-2 text-center">
              <h4 className="font-black text-[10px] uppercase bg-slate-100 text-slate-500 py-1 rounded-full tracking-widest inline-block px-4">📅 {date}</h4>
              {(items as any[]).map((p) => (
                <div key={p.id} className="p-3 bg-white border-2 rounded-2xl flex items-center justify-between shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={getLotteryLogo(p.lottery_type)} className="w-10 h-10 rounded-full shadow-inner" />
                    <div className="text-left">
                      <p className="text-[10px] font-black text-emerald-600 uppercase">{p.draw_time}</p>
                      <div className="flex gap-1 mt-1">
                        {p.predicted_numbers?.map((n:any, i:any) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 text-white font-black rounded-lg text-[12px]">{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={20}/></Button>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
