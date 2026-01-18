import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, Clock, Calendar, Info, TrendingUp, AlertTriangle, Flame, Snowflake, Target } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { calculateProbabilities, getHourlyAnalysis, AnalysisResult } from '@/lib/probabilityEngine';

export function HourlyMatrix() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [results, setResults] = useState<Record<string, any>>({});
  const [overdueNumbers, setOverdueNumbers] = useState<AnalysisResult[]>([]);
  const [hotNumbers, setHotNumbers] = useState<AnalysisResult[]>([]);
  const [coldNumbers, setColdNumbers] = useState<AnalysisResult[]>([]);
  const [hourlyAnalysis, setHourlyAnalysis] = useState<Record<string, { hot: AnalysisResult[], cold: AnalysisResult[], overdue: AnalysisResult[] }>>({});
  const [history, setHistory] = useState<any[]>([]);

  const availableTimes = getDrawTimesForLottery(selectedLottery);
  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  // Cargar historial y calcular análisis
  const loadAnalysis = async () => {
    const { data: historyData } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('lottery_type', selectedLottery)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!historyData) return;
    setHistory(historyData);

    // Análisis general
    const allPredictions = calculateProbabilities(historyData, selectedLottery);
    
    // Números vencidos (no han salido en 7+ días y tienen frecuencia > 0)
    const overdue = allPredictions.filter(p => p.daysSince >= 7 && p.frequency > 0)
      .sort((a, b) => b.daysSince - a.daysSince)
      .slice(0, 10);
    setOverdueNumbers(overdue);

    // Números calientes
    const hot = allPredictions.filter(p => p.status === 'HOT').slice(0, 10);
    setHotNumbers(hot);

    // Números fríos
    const cold = allPredictions.filter(p => p.status === 'COLD').slice(0, 10);
    setColdNumbers(cold);

    // Análisis por hora
    const hourlyData: Record<string, { hot: AnalysisResult[], cold: AnalysisResult[], overdue: AnalysisResult[] }> = {};
    availableTimes.forEach(time => {
      const analysis = getHourlyAnalysis(historyData, selectedLottery, time);
      hourlyData[time] = {
        hot: analysis.hot.slice(0, 3),
        cold: analysis.cold.slice(0, 3),
        overdue: analysis.overdue.slice(0, 3)
      };
    });
    setHourlyAnalysis(hourlyData);
  };

  useEffect(() => {
    const fetchResults = async () => {
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
    
    fetchResults();
    loadAnalysis();
  }, [selectedDate, selectedLottery]);

  const filledCount = Object.keys(results).length;
  const totalSlots = availableTimes.length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Matriz Avanzada por Hora
        </CardTitle>
        {/* Instrucciones claras */}
        <div className="mt-3 p-3 bg-muted/50 rounded-lg border text-xs space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">¿Cómo usar la Matriz Avanzada?</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Selecciona fecha y lotería</strong> para ver resultados del día y análisis.</li>
                <li>• <strong>🔥 Números Calientes:</strong> Han salido frecuentemente, tendencia activa.</li>
                <li>• <strong>❄️ Números Fríos:</strong> Baja frecuencia histórica, podrían "despertar".</li>
                <li>• <strong>⚠️ Números Vencidos:</strong> NO han salido en 7+ días, alta probabilidad de aparecer.</li>
                <li>• <strong>Análisis por Hora:</strong> Cada hora tiene sus propios patrones y tendencias.</li>
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
        </div>

        {/* Tabs de Análisis */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="general" className="text-xs py-2 active:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-3 h-3 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="hot" className="text-xs py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Flame className="w-3 h-3 mr-1" />
              Calientes
            </TabsTrigger>
            <TabsTrigger value="cold" className="text-xs py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Snowflake className="w-3 h-3 mr-1" />
              Fríos
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Vencidos
            </TabsTrigger>
          </TabsList>

          {/* General - Grid de resultados */}
          <TabsContent value="general" className="mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableTimes.map((time) => {
                const result = results[time];
                const hasResult = !!result;
                const hourData = hourlyAnalysis[time];
                
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
                      <>
                        <p className="font-mono text-2xl text-muted-foreground/30">--</p>
                        {hourData && hourData.hot.length > 0 && (
                          <p className="text-[9px] text-red-500 truncate">
                            🔥 {hourData.hot[0]?.number}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Números Calientes */}
          <TabsContent value="hot" className="mt-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-700 dark:text-red-400">
                  Números Calientes (Alta Frecuencia)
                </span>
              </div>
              {hotNumbers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {hotNumbers.map((n) => (
                    <div 
                      key={n.number} 
                      className="p-2 bg-red-500/20 border border-red-500/40 rounded-lg text-center"
                    >
                      <span className="font-mono font-black text-2xl text-red-700 dark:text-red-300">
                        {n.number.padStart(2, '0')}
                      </span>
                      {lottery?.type === 'animals' && (
                        <p className="text-[10px] text-red-600 dark:text-red-400 truncate">
                          {n.animal}
                        </p>
                      )}
                      <p className="text-[9px] text-red-500 mt-1">
                        {n.frequency}x en historial
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay números calientes detectados.</p>
              )}
            </div>
          </TabsContent>

          {/* Números Fríos */}
          <TabsContent value="cold" className="mt-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Snowflake className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  Números Fríos (Baja Frecuencia)
                </span>
              </div>
              {coldNumbers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {coldNumbers.map((n) => (
                    <div 
                      key={n.number} 
                      className="p-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-center"
                    >
                      <span className="font-mono font-black text-2xl text-blue-700 dark:text-blue-300">
                        {n.number.padStart(2, '0')}
                      </span>
                      {lottery?.type === 'animals' && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate">
                          {n.animal}
                        </p>
                      )}
                      <p className="text-[9px] text-blue-500 mt-1">
                        {n.frequency === 0 ? 'Nunca salió' : `Solo ${n.frequency}x`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay números fríos detectados.</p>
              )}
            </div>
          </TabsContent>

          {/* Números Vencidos */}
          <TabsContent value="overdue" className="mt-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  Números Vencidos (No han salido en 7+ días)
                </span>
              </div>
              {overdueNumbers.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {overdueNumbers.map((n) => (
                      <div 
                        key={n.number} 
                        className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-center"
                      >
                        <span className="font-mono font-black text-2xl text-amber-700 dark:text-amber-300">
                          {n.number.padStart(2, '0')}
                        </span>
                        {lottery?.type === 'animals' && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
                            {n.animal}
                          </p>
                        )}
                        <p className="text-[9px] text-amber-500 mt-1">
                          {n.daysSince} días sin salir
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3">
                    💡 Estos números tienen alta probabilidad estadística de salir pronto según la ley de los grandes números.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay números vencidos. Todos los números han salido recientemente.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Análisis por Hora Específica */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Análisis Detallado por Hora
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {availableTimes.map((time) => {
              const hourData = hourlyAnalysis[time];
              if (!hourData) return null;
              
              return (
                <div key={time} className="p-2 bg-muted/30 rounded-lg border">
                  <div className="font-bold text-xs mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {time}
                  </div>
                  <div className="space-y-1">
                    {hourData.hot.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Flame className="w-3 h-3 text-red-500" />
                        {hourData.hot.map(n => (
                          <span key={n.number} className="px-1.5 py-0.5 bg-red-500/20 text-red-600 rounded text-[10px] font-mono font-bold">
                            {n.number.padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    )}
                    {hourData.overdue.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        {hourData.overdue.map(n => (
                          <span key={n.number} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-600 rounded text-[10px] font-mono font-bold">
                            {n.number.padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    )}
                    {hourData.cold.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Snowflake className="w-3 h-3 text-blue-500" />
                        {hourData.cold.map(n => (
                          <span key={n.number} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-600 rounded text-[10px] font-mono font-bold">
                            {n.number.padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50"></div>
            <span>Con resultado</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-500" />
            <span>Caliente</span>
          </div>
          <div className="flex items-center gap-1">
            <Snowflake className="w-3 h-3 text-blue-500" />
            <span>Frío</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Vencido</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}