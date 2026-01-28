import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, MinusCircle, RefreshCw, BarChart3 } from "lucide-react";
import { getAllHypothesesForLottery, getLearningStats, PersistentHypothesis } from '@/lib/persistentLearning';
import { LOTTERIES } from '@/lib/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HypothesisAudit() {
  const [hypotheses, setHypotheses] = useState<PersistentHypothesis[]>([]);
  const [stats, setStats] = useState<{
    totalRecords: number;
    hitRate: number;
    hypothesesActive: number;
    hypothesesPenalized: number;
    hypothesesDeactivated: number;
    consecutiveDays: number;
    lastProcessed: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLottery, setSelectedLottery] = useState('lotto_activo');

  const loadData = async () => {
    setLoading(true);
    try {
      const [hyps, statsData] = await Promise.all([
        getAllHypothesesForLottery(selectedLottery),
        getLearningStats(),
      ]);
      setHypotheses(hyps);
      setStats(statsData);
    } catch (e) {
      console.error('Error loading hypothesis data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedLottery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'reactivated':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'penalized':
        return <MinusCircle className="w-4 h-4 text-amber-500" />;
      case 'deactivated':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'reactivated': return 'Reactivado';
      case 'penalized': return 'Penalizado';
      case 'deactivated': return 'Desactivado';
      default: return status;
    }
  };

  const formatPatternType = (type: string) => {
    const labels: Record<string, string> = {
      'spatial_neighbor': 'Vecinos ±1',
      'spatial_opposite': 'Opuesto 180°',
      'spatial_jump': 'Saltos ±5,7,9',
      'math_sum_2': 'Suma 2 cons.',
      'math_sum_3': 'Suma 3 cons.',
      'math_diff_2': 'Resta 2 cons.',
      'math_diff_3': 'Resta 3 cons.',
      'math_mult': 'Multiplicación',
      'math_digit_sum': 'Suma dígitos',
      'math_digit_diff': 'Resta dígitos',
      'math_digital_root': 'Raíz digital',
      'math_cross_digit': 'Cruce dígito',
      'overdue': 'Vencidos 7+ días',
      'hourly_trend': 'Tendencia hora',
      'daily_trend': 'Tendencia día',
      'frequency': 'Frecuencia hist.',
      'animal_association_short': 'Asoc. corta 3d',
      'animal_association_medium': 'Asoc. media 7d',
      'animal_association_long': 'Asoc. larga 15d',
    };
    return labels[type] || type;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Auditoría de Hipótesis
          </CardTitle>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Estado del sistema de aprendizaje desde 02/01/2026
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{stats.hypothesesActive}</div>
              <div className="text-[10px] text-muted-foreground">ACTIVOS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{stats.hypothesesPenalized}</div>
              <div className="text-[10px] text-muted-foreground">PENALIZADOS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{stats.hypothesesDeactivated}</div>
              <div className="text-[10px] text-muted-foreground">DESACTIVADOS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{(stats.hitRate * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">TASA ACIERTO</div>
            </div>
          </div>
        )}

        {/* Learning Meta */}
        {stats && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            📅 Días consecutivos: {stats.consecutiveDays} | 
            📊 Registros: {stats.totalRecords} | 
            🕐 Último proceso: {stats.lastProcessed || 'Pendiente'}
          </div>
        )}

        {/* Hypothesis Table */}
        <TooltipProvider>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b">
                  <th className="text-left p-2">Patrón</th>
                  <th className="text-center p-2">Estado</th>
                  <th className="text-center p-2">Peso</th>
                  <th className="text-center p-2">Aciertos</th>
                  <th className="text-center p-2">Tasa</th>
                  <th className="text-center p-2">vs Azar</th>
                </tr>
              </thead>
              <tbody>
                {hypotheses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">
                      {loading ? 'Cargando...' : 'No hay hipótesis registradas aún'}
                    </td>
                  </tr>
                ) : (
                  hypotheses.map(h => {
                    const vsAzar = h.baseline_chance > 0 
                      ? ((h.hit_rate / h.baseline_chance - 1) * 100).toFixed(0)
                      : '0';
                    const vsAzarNum = parseFloat(vsAzar);
                    
                    return (
                      <tr key={h.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{formatPatternType(h.pattern_type)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{h.hypothesis_id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2 text-center">
                          <span className="inline-flex items-center gap-1">
                            {getStatusIcon(h.status)}
                            <span className="hidden sm:inline">{getStatusLabel(h.status)}</span>
                          </span>
                        </td>
                        <td className="p-2 text-center font-mono">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${h.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px]">{(h.weight * 100).toFixed(0)}%</span>
                        </td>
                        <td className="p-2 text-center font-mono">
                          {h.hits}/{h.hits + h.misses}
                        </td>
                        <td className="p-2 text-center font-mono">
                          {(h.hit_rate * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 text-center font-bold ${
                          vsAzarNum > 0 ? 'text-green-500' : 
                          vsAzarNum < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {vsAzarNum > 0 ? '+' : ''}{vsAzar}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> Activo/Reactivado
          </span>
          <span className="flex items-center gap-1">
            <MinusCircle className="w-3 h-3 text-amber-500" /> Penalizado
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-500" /> Desactivado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
