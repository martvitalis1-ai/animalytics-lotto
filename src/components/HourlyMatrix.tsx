import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Grid3X3, Clock, Calendar } from "lucide-react";
import { LOTTERIES, DRAW_TIMES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

export function HourlyMatrix() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [results, setResults] = useState<Record<string, any>>({});

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
  }, [selectedDate, selectedLottery]);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Matriz por Hora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
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
            <SelectTrigger className="w-48 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <span className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                    {l.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 py-2 border-b">
          <img src={getLotteryLogo(selectedLottery)} alt="" className="w-10 h-10" />
          <div>
            <p className="font-bold">{lottery?.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedDate} · {Object.keys(results).length} sorteos registrados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {DRAW_TIMES.map((time) => {
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
      </CardContent>
    </Card>
  );
}
