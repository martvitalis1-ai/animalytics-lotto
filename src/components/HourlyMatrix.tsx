import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Grid3X3, Clock, Calendar, AlertCircle, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

export function HourlyMatrix() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [results, setResults] = useState<Record<string, any>>({});
  const [overdueNumbers, setOverdueNumbers] = useState<string[]>([]);

  const availableTimes = getDrawTimesForLottery(selectedLottery);
  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  // Calcular números vencidos (no han salido en los últimos X días)
  const calculateOverdueNumbers = async () => {
    const { data: history } = await supabase
      .from('lottery_results')
      .select('result_number, draw_date')
      .eq('lottery_type', selectedLottery)
      .order('draw_date', { ascending: false })
      .limit(500);

    if (!history || history.length === 0) return;

    // Obtener últimos 7 días de resultados
    const last7Days = new Set(
      history
        .slice(0, 100)
        .map(r => r.result_number)
    );

    // Generar todos los números posibles según el rango de la lotería
    const range = lottery?.range || 36;
    const allNumbers: string[] = [];
    for (let i = 0; i <= range; i++) {
      allNumbers.push(i.toString().padStart(2, '0'));
    }

    // Números que no han salido recientemente
    const overdue = allNumbers.filter(n => !last7Days.has(n));
    setOverdueNumbers(overdue.slice(0, 10)); // Top 10 vencidos
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', selectedDate)
        .eq('lottery_type', selectedLottery)
        .order('draw_time', { ascending: true });
      
      if (data) {
        const mapped = data.reduce((acc, r) => {
          acc[r.draw_time] = r;
          return acc;
        }, {} as Record<string, any>);
        setResults(mapped);
      }
    };
    
    fetchData();
    calculateOverdueNumbers();
  }, [selectedDate, selectedLottery]);

  const filledCount = Object.keys(results).length;
  const totalSlots = availableTimes.length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Matriz por Hora
        </CardTitle>
        {/* Instrucciones claras */}
        <div className="mt-3 p-3 bg-muted/50 rounded-lg border text-xs space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">¿Cómo usar la Matriz?</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Selecciona una <strong>fecha</strong> y una <strong>lotería</strong> para ver los resultados del día.</li>
                <li>• Cada casilla muestra el resultado de esa hora. Las casillas vacías (--) son sorteos sin resultado.</li>
                <li>• Los <strong>números vencidos</strong> son números que NO han salido recientemente y podrían estar "calientes".</li>
              </ul>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fecha</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 bg-background"
              />
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1 max-w-xs">
            <label className="text-xs font-medium text-muted-foreground">Lotería</label>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(selectedLottery)} alt="" className="w-5 h-5" />
                    <span>{lottery?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
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
        </div>

        {/* Header de lotería */}
        <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg border">
          <img src={getLotteryLogo(selectedLottery)} alt="" className="w-10 h-10" />
          <div className="flex-1">
            <p className="font-bold">{lottery?.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedDate} · {filledCount}/{totalSlots} sorteos registrados
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Horario</div>
            <div className="text-sm font-medium">
              {lottery?.schedule === 'half' ? '8:30 AM - 7:30 PM' : '8:00 AM - 7:00 PM'}
            </div>
          </div>
        </div>

        {/* Números Vencidos */}
        {overdueNumbers.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Números Vencidos (No han salido recientemente)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {overdueNumbers.map((n) => (
                <div 
                  key={n} 
                  className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-center"
                >
                  <span className="font-mono font-black text-lg text-amber-700 dark:text-amber-300">
                    {n}
                  </span>
                  {lottery?.type === 'animals' && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 truncate">
                      {ANIMAL_MAPPING[n] || ANIMAL_MAPPING[parseInt(n).toString()]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
              💡 Estos números tienen mayor probabilidad estadística de salir pronto.
            </p>
          </div>
        )}

        {/* Grid de resultados */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableTimes.map((time) => {
            const result = results[time];
            const hasResult = !!result;
            
            return (
              <div 
                key={time}
                className={`p-3 rounded-lg border text-center transition-all ${
                  hasResult 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  {time}
                </div>
                
                {hasResult ? (
                  <>
                    <p className="font-mono font-black text-2xl text-foreground">
                      {result.result_number}
                    </p>
                    {lottery?.type === 'animals' && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.animal_name || ANIMAL_MAPPING[result.result_number] || ''}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-mono text-2xl text-muted-foreground/30">--</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50"></div>
            <span>Con resultado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted border border-border"></div>
            <span>Sin resultado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50"></div>
            <span>Número vencido</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
