import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES, DRAW_TIMES, getAnimalFromNumber } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

interface ResultsInsertProps {
  onInserted?: () => void;
}

export function ResultsInsert({ onInserted }: ResultsInsertProps) {
  const [lotteryType, setLotteryType] = useState<string>(LOTTERIES[0].id);
  const [resultNumber, setResultNumber] = useState("");
  const [drawTime, setDrawTime] = useState(DRAW_TIMES[0]);
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleInsert = async () => {
    if (!resultNumber.trim()) {
      toast.error("Ingresa un número");
      return;
    }

    setLoading(true);
    
    const animalName = getAnimalFromNumber(resultNumber, lotteryType);
    
    const { error } = await supabase.from('lottery_results').insert({
      lottery_type: lotteryType,
      result_number: resultNumber.padStart(2, '0'),
      animal_name: animalName || null,
      draw_time: drawTime,
      draw_date: drawDate,
    });

    if (error) {
      console.error(error);
      toast.error("Error al guardar");
    } else {
      toast.success(`Resultado guardado: ${resultNumber} ${animalName ? `(${animalName})` : ''}`);
      setResultNumber("");
      onInserted?.();
    }
    
    setLoading(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Insertar Resultado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
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
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fecha</label>
            <Input 
              type="date" 
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Número</label>
            <Input
              type="text"
              placeholder="00"
              value={resultNumber}
              onChange={(e) => setResultNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="bg-background text-center font-mono text-xl font-bold"
              maxLength={2}
            />
          </div>
        </div>

        <Button 
          onClick={handleInsert} 
          disabled={loading || !resultNumber}
          className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Resultado"}
        </Button>
      </CardContent>
    </Card>
  );
}
