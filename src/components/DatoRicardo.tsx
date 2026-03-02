import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Plus, Trash2, Pencil, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, DRAW_TIMES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

export function DatoRicardo() {
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
    const { data } = await supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .order('prediction_date', { ascending: false })
      .order('draw_time', { ascending: true });
    setPredictions(data || []);
  };

  useEffect(() => { loadPredictions(); }, []);

  const handleSubmit = async () => {
    if (!numbers.trim()) return toast.error("Ingresa los números");
    setLoading(true);
    const numbersArray = numbers.split(',').map(n => n.trim()).filter(n => n);
    const { error } = await supabase.from('dato_ricardo_predictions').insert({
      lottery_type: lotteryType,
      prediction_date: predictionDate,
      draw_time: drawTime,
      predicted_numbers: numbersArray,
      notes: notes || null
    });
    if (!error) { toast.success("Pronóstico guardado"); setNumbers(""); setNotes(""); loadPredictions(); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este pronóstico definitivamente?")) return;
    const { error } = await supabase.from('dato_ricardo_predictions').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else { toast.success("Eliminado del búnker"); loadPredictions(); }
  };

  const handleSaveEdit = async (id: number) => {
    const numbersArray = editNumbers.split(',').map(n => n.trim()).filter(n => n);
    const { error } = await supabase
      .from('dato_ricardo_predictions')
      .update({ predicted_numbers: numbersArray, notes: editNotes || null })
      .eq('id', id);

    if (error) toast.error("Error al actualizar");
    else { toast.success("Pronóstico actualizado"); setEditingId(null); loadPredictions(); }
  };

  const groupedPredictions = predictions.reduce((acc, p) => {
    const date = p.prediction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><UserCircle className="w-5 h-5 text-accent" /> Nuevo Pronóstico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={lotteryType} onValueChange={setLotteryType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOTTERIES.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}</SelectContent></Select>
            <Input type="date" value={predictionDate} onChange={(e) => setPredictionDate(e.target.value)} />
            <Select value={drawTime} onValueChange={setDrawTime}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DRAW_TIMES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Números (coma)" value={numbers} onChange={(e) => setNumbers(e.target.value)} className="font-mono" />
          </div>
          <Textarea placeholder="Notas..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-foreground text-background">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Pronóstico"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base font-bold text-primary">Historial de Pronósticos</CardTitle></CardHeader>
        <CardContent className="space-y-6 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedPredictions).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <h4 className="font-black text-xs uppercase bg-muted p-1 rounded tracking-tighter">📅 {date}</h4>
              {(items as any[]).map((p) => (
                <div key={p.id} className="p-3 bg-card border rounded-lg flex items-center justify-between shadow-sm">
                  {editingId === p.id ? (
                    <div className="flex-1 space-y-2">
                      <Input value={editNumbers} onChange={(e) => setEditNumbers(e.target.value)} className="font-mono text-xs" />
                      <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="text-xs" />
                      <div className="flex gap-2"><Button size="sm" onClick={() => handleSaveEdit(p.id)}>OK</Button><Button size="sm" variant="outline" onClick={() => setEditingId(null)}>X</Button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <img src={getLotteryLogo(p.lottery_type)} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-xs font-bold">{p.draw_time}</p>
                          <div className="flex gap-1">{p.predicted_numbers?.map((n:any, i:any) => (<span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary font-black rounded text-[10px]">{n}</span>))}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {setEditingId(p.id); setEditNumbers(p.predicted_numbers.join(',')); setEditNotes(p.notes || '');}}><Pencil className="w-4 h-4 text-primary" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
