import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Grid3X3, 
  RefreshCw, 
  Loader2, 
  Search,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { buildSequenceMatrix, SequenceMatrix, SequenceRow } from '@/lib/sequenceMatrix';
import { getAnimalEmoji, getAnimalName, getMaxNumberForLottery } from '@/lib/animalData';
import { ScrollArea } from "@/components/ui/scroll-area";
import { LEARNING_START_DATE } from '@/lib/hypothesisEngine';

export function SequenceMatrixView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [matrix, setMatrix] = useState<SequenceMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState<string>('');

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const maxNumber = getMaxNumberForLottery(selectedLottery);

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const result = await buildSequenceMatrix(selectedLottery);
      setMatrix(result);
    } catch (error) {
      console.error('Error loading matrix:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!matrix) return [];
    if (!searchNumber.trim()) return matrix.rows;
    
    const search = searchNumber.trim();
    return matrix.rows.filter(row => {
      const normalizedRowNum = row.number === '00' ? '00' : parseInt(row.number).toString();
      return normalizedRowNum === search || row.number.includes(search);
    });
  }, [matrix, searchNumber]);

  const formatSequence = (row: SequenceRow, maxItems: number = 15): string => {
    return row.successors
      .slice(0, maxItems)
      .map(s => s.code.padStart(2, '0'))
      .join('/');
  };

  return (
    <Card className="glass-card border-2 border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Grid3X3 className="w-5 h-5 text-primary-foreground" />
            </div>
            Matriz Histórica de Secuencias
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4" />
                      <span className="truncate">{l.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={loadMatrix} disabled={loading} variant="outline" size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4 mt-2">
          <p className="text-xs text-muted-foreground">
            Desde {LEARNING_START_DATE} • {matrix?.totalDraws || 0} sorteos • Rango 0-{maxNumber}
          </p>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar número..."
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="pl-8 w-[140px] h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Construyendo matriz sin límites...</p>
            </div>
          </div>
        ) : !matrix || filteredRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay datos para mostrar</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 pr-4 font-mono text-sm">
              {filteredRows.map((row) => (
                <div
                  key={row.number}
                  className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Number with emoji */}
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <span className="text-lg">{getAnimalEmoji(row.number)}</span>
                    <span className="font-bold text-primary">
                      {row.number === '0' ? '0' : row.number === '00' ? '00' : row.number.padStart(2, '0')}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />

                  {/* Sequence */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground break-all leading-relaxed">
                      {formatSequence(row)}
                      {row.successors.length > 15 && (
                        <span className="text-primary ml-1">+{row.successors.length - 15}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>
                        Total: {row.totalOccurrences}
                      </span>
                      {row.successors[0] && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Top: {row.successors[0].code} ({row.successors[0].percentage}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Quick stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 mt-4">
          <span className="flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" />
            Formato: NÚMERO=SUCESOR1/SUCESOR2/...
          </span>
          <span>
            {lottery?.name} • Sin límites de consulta
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
