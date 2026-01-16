import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, DRAW_TIMES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

export function DatoRicardo() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
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
      .order('draw_time', { ascending: true })
      .limit(50);
    
    setPredictions(data || []);
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const handleSubmit = async () => {
    if (!numbers.trim()) {
      toast.error("Ingresa los números predichos");
      return;
    }
    
    setLoading(true);
    
    const numbersArray = numbers.split(',').map(n => n.trim()).filter(n => n);
    const lottery = LOTTERIES.find(l => l.id === lotteryType);
    const animalsArray = lottery?.type === 'animals' 
      ? numbersArray.map(n => ANIMAL_MAPPING[n] || null).filter(Boolean)
      : null;
    
    const { error } = await supabase.from('dato_ricardo_predictions').insert({
      lottery_type: lotteryType,
      prediction_date: predictionDate,
      draw_time: drawTime,
      predicted_numbers: numbersArray,
      predicted_animals: animalsArray,
      notes: notes || null
    });
    
    if (error) {
      console.error(error);
      toast.error("Error al guardar");
    } else {
      toast.success("Pronóstico guardado");
      setNumbers("");
      setNotes("");
      loadPredictions();
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este pronóstico?")) return;
    
    await supabase.from('dato_ricardo_predictions').delete().eq('id', id);
    toast.success("Eliminado");
    loadPredictions();
  };

  // Agrupar por fecha
  const groupedPredictions = predictions.reduce((acc, p) => {
    const date = p.prediction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-accent" />
            Dato Ricardo - Nuevo Pronóstico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Lotería</label>
              <Select value={lotteryType} onValueChange={setLotteryType}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg">
                  {LOTTERIES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <Input 
                type="date" 
                value={predictionDate}
                onChange={(e) => setPredictionDate(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hora</label>
              <Select value={drawTime} onValueChange={setDrawTime}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg max-h-60">
                  {DRAW_TIMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Números (separados por coma)</label>
              <Input
                placeholder="05, 12, 23"
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                className="bg-background font-mono"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notas (opcional)</label>
            <Textarea
              placeholder="Observaciones o análisis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background resize-none"
              rows={2}
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Guardar Pronóstico
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Pronósticos de Dato Ricardo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedPredictions).map(([date, items]) => (
              <div key={date} className="space-y-2">
                <h4 className="font-bold text-sm sticky top-0 bg-card py-1 border-b">
                  📅 {new Date(date + 'T12:00:00').toLocaleDateString('es-VE', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </h4>
                
                <div className="grid gap-2">
                  {(items as any[]).map((p) => {
                    const lottery = LOTTERIES.find(l => l.id === p.lottery_type);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img src={getLotteryLogo(p.lottery_type)} alt="" className="w-8 h-8" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{lottery?.name}</span>
                              <span className="text-xs text-muted-foreground">{p.draw_time}</span>
                            </div>
                            <div className="flex gap-1 mt-1">
                              {p.predicted_numbers?.map((n: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-accent/20 text-accent-foreground rounded text-xs font-mono font-bold">
                                  {n.padStart(2, '0')}
                                </span>
                              ))}
                            </div>
                            {p.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {p.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {predictions.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No hay pronósticos guardados
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
