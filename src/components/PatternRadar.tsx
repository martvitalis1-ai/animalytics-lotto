import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Radar, 
  Bell, 
  AlertTriangle, 
  Flame,
  Zap,
  RefreshCw,
  Loader2,
  X,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalName, getAnimalEmoji, getMaxNumberForLottery } from '@/lib/animalData';
import { LEARNING_START_DATE } from '@/lib/hypothesisEngine';
import { calculateSuccessorSequence } from '@/lib/sequenceMatrix';
import { RichAnimalCard } from './RichAnimalCard';
import { Switch } from "@/components/ui/switch";

interface Alert {
  id: string;
  number: string;
  animalName: string;
  lotteryId: string;
  lotteryName: string;
  drawTime: string;
  probability: number;
  reason: string;
  timestamp: Date;
  dismissed?: boolean;
  missCount?: number;
}

// Storage key for dismissed alerts
const DISMISSED_ALERTS_KEY = 'radar_dismissed_alerts';

// Load dismissed alerts from localStorage
const loadDismissedAlerts = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save dismissed alerts to localStorage
const saveDismissedAlerts = (dismissed: Record<string, number>) => {
  try {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissed));
  } catch (e) {
    console.warn('Failed to save dismissed alerts');
  }
};

export function PatternRadar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, number>>(loadDismissedAlerts());

  // Descarte logic: If number didn't appear, don't show again unless >90%
  const shouldShowAlert = useCallback((alertId: string, probability: number): boolean => {
    const missCount = dismissedAlerts[alertId] || 0;
    
    // If dismissed once and probability < 90%, don't show
    if (missCount > 0 && probability < 90) {
      return false;
    }
    
    // If dismissed multiple times, only show if probability > 95%
    if (missCount >= 2 && probability < 95) {
      return false;
    }
    
    return true;
  }, [dismissedAlerts]);

  const runPatternScan = useCallback(async () => {
    setLoading(true);
    const newAlerts: Alert[] = [];

    try {
      // Fetch full history since learning start date
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('*')
        .gte('draw_date', LEARNING_START_DATE)
        .order('draw_date', { ascending: true })
        .order('draw_time', { ascending: true });

      if (error) throw error;
      if (!history || history.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];

      // Analyze each lottery
      for (const lottery of LOTTERIES) {
        const lotteryHistory = history.filter(h => h.lottery_type === lottery.id);
        if (lotteryHistory.length < 10) continue;

        const drawTimes = getDrawTimesForLottery(lottery.id);
        
        // Find the last result
        const lastResult = lotteryHistory[lotteryHistory.length - 1];
        const lastNumber = lastResult.result_number?.toString().trim();

        // Calculate successor probabilities
        const successors = calculateSuccessorSequence(lastNumber, lotteryHistory, lottery.id);
        
        // Check for high probability patterns (>85%)
        for (const successor of successors.slice(0, 5)) {
          if (successor.percentage >= 85) {
              const alertId = `${lottery.id}-${successor.code}-succ`;
              
              // Apply descarte logic
              if (!shouldShowAlert(alertId, successor.percentage)) {
                continue;
              }
              
            // Find next applicable draw time
            for (const time of drawTimes) {
              const match = time.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
              if (match) {
                let hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const ampm = match[3].toUpperCase();

                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;

                const drawMinutes = hours * 60 + minutes;
                if (drawMinutes > currentMinutes) {
                  const animalName = getAnimalName(successor.code, lottery.id);
                  
                  newAlerts.push({
                    id: `${lottery.id}-${successor.code}-${time}`,
                    number: successor.code,
                    animalName,
                    lotteryId: lottery.id,
                    lotteryName: lottery.name,
                    drawTime: time,
                    probability: successor.percentage,
                    reason: `Después del ${lastNumber}, el ${successor.code} ha salido ${successor.count} veces (${successor.percentage}%)`,
                    timestamp: now,
                  });
                  break; // Only one alert per number per lottery
                }
              }
            }
          }
        }

        // Also check for overdue numbers (days without appearing)
        const maxNumber = getMaxNumberForLottery(lottery.id);
        const numberOccurrences: Record<string, Date> = {};

        for (const result of lotteryHistory) {
          const num = result.result_number?.toString().trim();
          if (num) {
            numberOccurrences[num] = new Date(result.draw_date);
          }
        }

        // Find numbers that haven't appeared in 7+ days
        for (let i = 0; i <= maxNumber; i++) {
          const code = i.toString();
          const lastAppearance = numberOccurrences[code];
          
          if (lastAppearance) {
            const daysSince = Math.floor((now.getTime() - lastAppearance.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSince >= 7 && daysSince <= 14) {
              const baseProb = 75 + Math.min(15, daysSince - 7); // 75-90%
              const animalName = getAnimalName(code, lottery.id);
              
              // Only add if probability is high enough and not already added
              if (baseProb >= 85 && !newAlerts.some(a => a.number === code && a.lotteryId === lottery.id)) {
                const nextTime = drawTimes.find(time => {
                  const match = time.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
                  if (match) {
                    let hours = parseInt(match[1]);
                    if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
                    if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
                    return hours * 60 + parseInt(match[2]) > currentMinutes;
                  }
                  return false;
                });

                if (nextTime) {
                  newAlerts.push({
                    id: `overdue-${lottery.id}-${code}`,
                    number: code,
                    animalName,
                    lotteryId: lottery.id,
                    lotteryName: lottery.name,
                    drawTime: nextTime,
                    probability: baseProb,
                    reason: `No ha salido en ${daysSince} días - Alta probabilidad de aparición`,
                    timestamp: now,
                  });
                }
              }
            }
          }
        }
      }

      // Sort by probability
      newAlerts.sort((a, b) => b.probability - a.probability);

      setAlerts(newAlerts);
      setLastScan(now);

      // Show popup for the highest alert if enabled
      if (alertsEnabled && newAlerts.length > 0) {
        const topAlert = newAlerts[0];
        // Only show popup for >90% probability (recurrence logic)
        if (topAlert.probability >= 90) {
          setCurrentAlert(topAlert);
          setShowPopup(true);
        }
      }

      console.log(`[PatternRadar] Found ${newAlerts.length} high-probability patterns`);
    } catch (error) {
      console.error('Error in pattern scan:', error);
      toast.error('Error al escanear patrones');
    }
    setLoading(false);
  }, [alertsEnabled]);

  // Run scan on mount and every 5 minutes
  useEffect(() => {
    runPatternScan();
    const interval = setInterval(runPatternScan, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [runPatternScan]);

  const dismissAlert = (id: string) => {
    // Update miss count for descarte logic
    const newDismissed = { ...dismissedAlerts };
    newDismissed[id] = (newDismissed[id] || 0) + 1;
    setDismissedAlerts(newDismissed);
    saveDismissedAlerts(newDismissed);
    
    setAlerts(prev => prev.filter(a => a.id !== id));
    if (currentAlert?.id === id) {
      setShowPopup(false);
      setCurrentAlert(null);
    }
  };

  return (
    <>
      <Card className="glass-card border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-red-500">
                <Radar className="w-5 h-5 text-white" />
              </div>
              Radar de Patrones
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {alerts.length}
                </span>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={runPatternScan}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Escaneo continuo desde {LEARNING_START_DATE} • 
            {lastScan && ` Último: ${lastScan.toLocaleTimeString()}`}
          </p>
        </CardHeader>

        <CardContent>
          {loading && alerts.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Analizando patrones históricos...</p>
              </div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin alertas de alta probabilidad</p>
              <p className="text-xs">El radar está activo y monitoreando</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${alert.probability >= 90 
                      ? 'bg-red-500/10 border-red-500/50 animate-pulse' 
                      : 'bg-amber-500/10 border-amber-500/50'}
                  `}
                >
                  <span className="text-3xl">{getAnimalEmoji(alert.number)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xl">
                        {alert.number === '0' ? '0' : alert.number === '00' ? '00' : alert.number.padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium">{alert.animalName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{alert.lotteryName}</span>
                      <span>•</span>
                      <span>{alert.drawTime}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {alert.reason}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
                      ${alert.probability >= 90 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}
                    `}>
                      {alert.probability >= 90 ? <Flame className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {alert.probability}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-500/10 via-background to-red-500/10 border-2 border-amber-500/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500 animate-bounce" />
              ¡OPORTUNIDAD DETECTADA!
              <Volume2 className="w-5 h-5 text-amber-500" />
            </DialogTitle>
          </DialogHeader>

          {currentAlert && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <RichAnimalCard
                  code={currentAlert.number}
                  probability={currentAlert.probability}
                  status={currentAlert.probability >= 90 ? 'CALIENTE' : 'FUERTE'}
                  statusEmoji={currentAlert.probability >= 90 ? '🔥' : '⚡'}
                  size="lg"
                  lotteryName={currentAlert.lotteryName}
                  reason={currentAlert.reason}
                  showProbability
                />
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg font-bold">
                  <span>{currentAlert.drawTime}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{currentAlert.lotteryName}</span>
                </div>
                <p className="text-sm text-muted-foreground px-4">
                  {currentAlert.reason}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setShowPopup(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  toast.success('¡Alerta guardada! Revisa el Radar para más detalles.');
                  setShowPopup(false);
                }}>
                  Entendido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
