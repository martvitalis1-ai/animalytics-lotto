import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Calendar, TrendingUp, FileSpreadsheet, Info, Loader2 } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { calculateProbabilities } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";

export function Verification() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [results, setResults] = useState<any[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const availableTimes = getDrawTimesForLottery(selectedLottery);
  const selectedLotteryData = LOTTERIES.find(l => l.id === selectedLottery);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Obtener todo el historial para calcular predicciones
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      setAllHistory(history || []);

      // Obtener resultados del día seleccionado para la lotería seleccionada
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', selectedDate)
        .eq('lottery_type', selectedLottery)
        .order('draw_time', { ascending: true });
      
      if (data && history) {
        // Calcular predicciones para cada resultado
        const verified = data.map(item => {
          // Historial previo al sorteo
          const priorHistory = history.filter(h => 
            new Date(h.created_at) < new Date(item.created_at)
          );
          
          const predictions = calculateProbabilities(priorHistory, item.lottery_type);
          const top5 = predictions.slice(0, 5).map(p => p.number);
          const isHit = top5.includes(item.result_number) || 
                        top5.includes(parseInt(item.result_number).toString());
          
          return { ...item, isHit, top5, predictions: predictions.slice(0, 3) };
        });
        
        setResults(verified);
        setStats({
          hits: verified.filter(v => v.isHit).length,
          total: verified.length
        });
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [selectedDate, selectedLottery]);

  // Crear mapa de resultados por hora
  const resultsByTime = results.reduce((acc, r) => {
    acc[r.draw_time] = r;
    return acc;
  }, {} as Record<string, any>);

  const hitRate = stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(1) : '0';

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            Verificación de Aciertos
          </CardTitle>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{hitRate}%</span>
            <span className="text-xs text-muted-foreground">({stats.hits}/{stats.total})</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Compara los resultados reales con las predicciones de la IA. Los aciertos se marcan en verde.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
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
                    <span>{selectedLotteryData?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                      <span>{l.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cabecera de lotería */}
        <div className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-lg border">
          <img src={getLotteryLogo(selectedLottery)} alt="" className="w-10 h-10" />
          <div className="flex-1">
            <p className="font-bold">{selectedLotteryData?.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedDate} · {results.length} resultados verificados
            </p>
          </div>
          {stats.hits > 0 && (
            <div className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">
              <CheckCircle className="w-3 h-3" />
              {stats.hits} aciertos
            </div>
          )}
        </div>

        {/* Tabla tipo Excel */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold border-b">HORA</th>
                  <th className="px-3 py-2 text-center text-xs font-bold border-b">RESULTADO</th>
                  <th className="px-3 py-2 text-left text-xs font-bold border-b">ANIMAL</th>
                  <th className="px-3 py-2 text-center text-xs font-bold border-b">PREDICCIÓN TOP 3</th>
                  <th className="px-3 py-2 text-center text-xs font-bold border-b">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {availableTimes.map((time, idx) => {
                  const result = resultsByTime[time];
                  const hasResult = !!result;
                  
                  return (
                    <tr 
                      key={time} 
                      className={`border-b last:border-0 transition-colors ${
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      } ${hasResult && result.isHit ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-3 py-2 font-medium text-sm">{time}</td>
                      <td className="px-3 py-2 text-center">
                        {hasResult ? (
                          <span className={`font-mono font-black text-lg ${result.isHit ? 'text-primary' : ''}`}>
                            {result.result_number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {hasResult ? (
                          result.animal_name || ANIMAL_MAPPING[result.result_number] || '-'
                        ) : (
                          <span className="text-muted-foreground opacity-50">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {hasResult ? (
                          <div className="flex justify-center gap-1">
                            {result.top5?.slice(0, 3).map((n: string, i: number) => (
                              <span 
                                key={i} 
                                className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                                  n === result.result_number || n === parseInt(result.result_number).toString()
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                {n.padStart(2, '0')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-center block text-muted-foreground opacity-50">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {hasResult ? (
                          result.isHit ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                              <CheckCircle className="w-3 h-3" /> ACIERTO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                              <XCircle className="w-3 h-3" /> Fallo
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground opacity-50 text-xs">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground">TOTAL</div>
          </div>
          <div className="text-center p-2 bg-primary/10 rounded">
            <div className="text-lg font-bold text-primary">{stats.hits}</div>
            <div className="text-[10px] text-muted-foreground">ACIERTOS</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-lg font-bold">{hitRate}%</div>
            <div className="text-[10px] text-muted-foreground">EFECTIVIDAD</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
