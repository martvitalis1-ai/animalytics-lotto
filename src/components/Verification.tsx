import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Calendar, TrendingUp } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { calculateProbabilities } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";

export function Verification() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Obtener todo el historial para calcular predicciones
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      setAllHistory(history || []);

      // Obtener resultados del día seleccionado
      let query = supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', selectedDate)
        .order('draw_time', { ascending: true });
      
      if (selectedLottery !== "all") {
        query = query.eq('lottery_type', selectedLottery);
      }
      
      const { data } = await query;
      
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
    };
    
    fetchData();
  }, [selectedDate, selectedLottery]);

  // Agrupar por lotería
  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.lottery_type]) acc[r.lottery_type] = [];
    acc[r.lottery_type].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  const hitRate = stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(1) : '0';

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Verificación de Aciertos
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{hitRate}%</span>
              <span className="text-xs text-muted-foreground">({stats.hits}/{stats.total})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40 bg-background"
            />
          </div>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-44 bg-background">
              <SelectValue placeholder="Todas las loterías" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              <SelectItem value="all">Todas las loterías</SelectItem>
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedResults).map(([lotteryId, items]) => {
            const lottery = LOTTERIES.find(l => l.id === lotteryId);
            const itemsArray = items as any[];
            const lotteryHits = itemsArray.filter(i => i.isHit).length;
            
            return (
              <div key={lotteryId} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-card py-2 border-b">
                  <img src={getLotteryLogo(lotteryId)} alt="" className="w-8 h-8" />
                  <span className="font-bold">{lottery?.name || lotteryId}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    lotteryHits > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {lotteryHits}/{itemsArray.length} aciertos
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="excel-table">
                    <thead>
                      <tr>
                        <th className="w-24">Hora</th>
                        <th className="w-20">Número</th>
                        <th className="w-28">Animal</th>
                        <th className="w-36">Predicción Top 3</th>
                        <th className="w-20 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsArray.map((r: any, idx: number) => (
                        <tr key={r.id} className={idx % 2 === 0 ? '' : 'bg-muted/30'}>
                          <td className="font-medium">{r.draw_time}</td>
                          <td className="font-mono font-black text-lg">{r.result_number}</td>
                          <td className="text-sm">
                            {r.animal_name || ANIMAL_MAPPING[r.result_number] || '-'}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              {r.top5?.slice(0, 3).map((n: string, i: number) => (
                                <span 
                                  key={i} 
                                  className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                                    n === r.result_number || n === parseInt(r.result_number).toString()
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  {n.padStart(2, '0')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="text-center">
                            {r.isHit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                <CheckCircle className="w-3 h-3" /> ACIERTO
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                                <XCircle className="w-3 h-3" /> Fallo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          
          {results.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No hay resultados para esta fecha
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
