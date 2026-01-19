import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Snowflake, 
  Clock, 
  BarChart3,
  RefreshCw,
  Loader2,
  Calendar,
  Target
} from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { analyzeAdvancedPatterns, TrendAnalysis as TrendType } from '@/lib/advancedAI';
import { getLotteryLogo } from "./LotterySelector";
import { RichAnimalCard, RichAnimalCardCompact } from './RichAnimalCard';
import { AnimalEmoji } from './AnimalImage';

export function TrendAnalysis() {
  const [trends, setTrends] = useState<Record<string, TrendType>>({});
  const [loading, setLoading] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (history) {
        const allTrends: Record<string, TrendType> = {};
        for (const lottery of LOTTERIES) {
          allTrends[lottery.id] = analyzeAdvancedPatterns(history, lottery.id);
        }
        setTrends(allTrends);
      }
    } catch (error) {
      console.error('Error loading trends:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrends();
  }, []);

  const currentTrend = trends[selectedLottery];
  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  return (
    <div className="space-y-4">
      {/* Header con selector de lotería */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Análisis de Tendencias</h2>
        </div>
        <Button onClick={loadTrends} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2 hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Selector de lotería */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {LOTTERIES.map((l) => (
          <Button
            key={l.id}
            variant={selectedLottery === l.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLottery(l.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
            <span className="hidden sm:inline">{l.name}</span>
          </Button>
        ))}
      </div>

      {currentTrend ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Números Calientes */}
          <Card className="glass-card border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Números Calientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentTrend.hotNumbers.length > 0 ? (
                  currentTrend.hotNumbers.map((num) => (
                    <RichAnimalCard
                      key={num}
                      code={num}
                      status="HOT"
                      size="sm"
                      showProbability={false}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Números con alta frecuencia reciente
              </p>
            </CardContent>
          </Card>

          {/* Números Fríos */}
          <Card className="glass-card border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                Números Fríos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentTrend.coldNumbers.length > 0 ? (
                  currentTrend.coldNumbers.map((num) => (
                    <RichAnimalCard
                      key={num}
                      code={num}
                      status="COLD"
                      size="sm"
                      showProbability={false}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Números con baja frecuencia
              </p>
            </CardContent>
          </Card>

          {/* Números Vencidos */}
          <Card className="glass-card border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Números Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentTrend.overdueNumbers.length > 0 ? (
                  currentTrend.overdueNumbers.map((num) => (
                    <RichAnimalCard
                      key={num}
                      code={num}
                      status="OVERDUE"
                      size="sm"
                      showProbability={false}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Estadísticamente deberían salir pronto
              </p>
            </CardContent>
          </Card>

          {/* Patrones Detectados */}
          <Card className="glass-card md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Patrones Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTrend.patterns.length > 0 ? (
                <div className="space-y-3">
                  {currentTrend.patterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        pattern.probability > 60 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {pattern.probability}%
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pattern.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pattern.numbers.map((n, i) => (
                            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
                              <AnimalEmoji code={n} size="sm" />
                              <span className="font-mono font-bold text-sm">{n.padStart(2, '0')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Analizando patrones... Se necesitan más datos.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tendencias por hora */}
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Mejores Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {currentTrend.hourlyTrends.slice(0, 4).map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{trend.hour}</span>
                    </div>
                    <div className="flex gap-1">
                      {trend.topNumbers.map((n, i) => (
                        <div key={i} className="flex items-center gap-0.5 px-2 py-1 bg-primary/10 text-primary rounded">
                          <AnimalEmoji code={n} size="sm" />
                          <span className="font-mono text-xs font-bold">{n.padStart(2, '0')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendencias por día */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Por Día de Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentTrend.weekdayTrends.slice(0, 4).map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs font-medium">{trend.day}</span>
                    <div className="flex gap-1">
                      {trend.topNumbers.slice(0, 2).map((n, i) => (
                        <div key={i} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent/20 text-accent-foreground rounded">
                          <AnimalEmoji code={n} size="sm" />
                          <span className="font-mono text-[10px] font-bold">{n.padStart(2, '0')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendación */}
          <Card className="glass-card md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recomendación del Sistema
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {currentTrend.confidence.toFixed(0)}% confianza
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {currentTrend.recommendation.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            {loading ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            ) : (
              <>
                <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Cargando análisis de tendencias...</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
