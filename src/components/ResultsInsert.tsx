import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES, getDrawTimesForLottery, getAnimalFromNumber, formatResultNumber } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, Save, AlertCircle } from "lucide-react";
import { getLotteryLogo } from "./LotterySelector";

interface ResultsInsertProps {
  onInserted?: () => void;
}

export function ResultsInsert({ onInserted }: ResultsInsertProps) {
  const [lotteryType, setLotteryType] = useState<string>(LOTTERIES[0].id);
  const [resultNumber, setResultNumber] = useState("");
  const [drawTime, setDrawTime] = useState("");
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Obtener horarios según lotería seleccionada
  const availableTimes = getDrawTimesForLottery(lotteryType);
  
  // Cuando cambia la lotería, resetear el tiempo si no está disponible
  const handleLotteryChange = (newLottery: string) => {
    setLotteryType(newLottery);
    const times = getDrawTimesForLottery(newLottery);
    if (!times.includes(drawTime)) {
      setDrawTime(times[0]);
    }
  };

  const handleInsert = async () => {
    if (!resultNumber.trim()) {
      toast.error("Ingresa un número");
      return;
    }

    if (!drawTime) {
      toast.error("Selecciona una hora");
      return;
    }

    setLoading(true);
    
    // Formatear el número correctamente: "0" = Delfín, "00" = Ballena
    const formattedNumber = formatResultNumber(resultNumber);
    const animalName = getAnimalFromNumber(resultNumber, lotteryType);
    
    // Verificar si ya existe un resultado para esa lotería/fecha/hora
    const { data: existing } = await supabase
      .from('lottery_results')
      .select('id')
      .eq('lottery_type', lotteryType)
      .eq('draw_date', drawDate)
      .eq('draw_time', drawTime)
      .single();

    if (existing) {
      // Actualizar el existente
      const { error } = await supabase
        .from('lottery_results')
        .update({
          result_number: formattedNumber,
          animal_name: animalName || null,
        })
        .eq('id', existing.id);

      if (error) {
        console.error(error);
        toast.error("Error al actualizar");
      } else {
        toast.success(`Resultado actualizado: ${formattedNumber} ${animalName ? `(${animalName})` : ''}`);
        setResultNumber("");
        onInserted?.();
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase.from('lottery_results').insert({
        lottery_type: lotteryType,
        result_number: formattedNumber,
        animal_name: animalName || null,
        draw_time: drawTime,
        draw_date: drawDate,
      });

      if (error) {
        console.error(error);
        toast.error("Error al guardar");
      } else {
        toast.success(`Resultado guardado: ${formattedNumber} ${animalName ? `(${animalName})` : ''}`);
        setResultNumber("");
        onInserted?.();
      }
    }
    
    setLoading(false);
  };

  const selectedLottery = LOTTERIES.find(l => l.id === lotteryType);
  const previewAnimal = resultNumber ? getAnimalFromNumber(resultNumber, lotteryType) : '';
  const previewNumber = resultNumber ? formatResultNumber(resultNumber) : '';

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Insertar Resultado
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Los resultados se guardan automáticamente en la base de datos. Si ya existe un resultado para la misma fecha/hora, se actualizará.
        </p>
        <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded mt-2">
          💡 <strong>Importante:</strong> "0" = Delfín, "00" = Ballena. Ingrésalos exactamente como quieras guardarlos.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de Lotería con Logo */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Lotería</label>
          <Select value={lotteryType} onValueChange={handleLotteryChange}>
            <SelectTrigger className="bg-background h-12">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(lotteryType)} alt="" className="w-6 h-6" />
                  <span>{selectedLottery?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-6 h-6" />
                    <span>{l.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {l.schedule === 'half' ? '(8:30-7:30)' : '(8:00-7:00)'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <label className="text-xs font-medium text-muted-foreground">Hora del Sorteo</label>
            <Select value={drawTime} onValueChange={setDrawTime}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Seleccionar hora" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg max-h-60">
                {availableTimes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Número Ganador</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Ej: 0, 00, 15..."
              value={resultNumber}
              onChange={(e) => {
                // Permitir solo dígitos, máximo 2
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setResultNumber(val);
              }}
              className="bg-background text-center font-mono text-3xl font-bold h-16"
              maxLength={2}
            />
            {previewAnimal && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {previewAnimal}
              </div>
            )}
          </div>
        </div>

        {/* Vista previa */}
        {resultNumber && drawTime && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <AlertCircle className="w-3 h-3" />
              Vista previa del resultado a guardar:
            </div>
            <div className="flex items-center gap-3">
              <img src={getLotteryLogo(lotteryType)} alt="" className="w-8 h-8" />
              <div>
                <div className="font-bold">{selectedLottery?.name}</div>
                <div className="text-xs text-muted-foreground">{drawDate} - {drawTime}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-mono font-black text-2xl">{previewNumber}</div>
                {previewAnimal && <div className="text-xs text-muted-foreground">{previewAnimal}</div>}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleInsert} 
          disabled={loading || !resultNumber || !drawTime}
          className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold h-12"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Resultado
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}