import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, Dices, Trophy, Zap } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';
import { AnimalEmoji } from './AnimalImage';
import { getCachedPredictions, getTodayDate } from '@/lib/predictionCache';
import { getAnimalByCode, ALL_ANIMAL_CODES } from '@/lib/animalData';
import { toast } from "sonner";

export function UniversalRoulette() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [lastNumber, setLastNumber] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  // Load history for predictions
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      setHistory(data || []);
    };
    loadHistory();
  }, []);

  // Numbers for the roulette wheel (animals: 0-36 + 00)
  const rouletteNumbers = useMemo(() => {
    if (lottery?.type !== 'numbers') {
      return ['0', '00', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];
    }
    return Array.from({ length: 38 }, (_, i) => i.toString());
  }, [lottery]);

  // Intelligent spin algorithm
  const spinRoulette = useCallback(async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);

    // Get cached predictions for consistency
    const cached = getCachedPredictions(history, selectedLottery);
    const topPredictions = cached.predictions.slice(0, 10);
    
    // Weight selection based on predictions + last number input
    let weightedNumbers: string[] = [];
    
    // Add top predictions with higher weight
    topPredictions.forEach((pred, idx) => {
      const weight = 10 - idx; // More weight for top predictions
      for (let i = 0; i < weight; i++) {
        weightedNumbers.push(pred.number);
      }
    });

    // If last number provided, use cross-formula logic
    if (lastNumber) {
      const lastNum = parseInt(lastNumber);
      if (!isNaN(lastNum)) {
        // Digital root
        let root = lastNum;
        while (root > 36) {
          root = root.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        weightedNumbers.push(root.toString(), root.toString(), root.toString());
        
        // Sum of digits
        const digitSum = lastNumber.split('').reduce((a, b) => a + parseInt(b), 0);
        if (digitSum <= 36) {
          weightedNumbers.push(digitSum.toString(), digitSum.toString());
        }
        
        // Complement to 36
        const complement = Math.abs(36 - lastNum);
        if (complement <= 36) {
          weightedNumbers.push(complement.toString(), complement.toString());
        }
      }
    }

    // Add some randomness with all numbers
    rouletteNumbers.forEach(n => weightedNumbers.push(n));

    // Select random from weighted array
    const selectedIdx = Math.floor(Math.random() * weightedNumbers.length);
    const selectedNumber = weightedNumbers[selectedIdx];
    const selectedIndex = rouletteNumbers.indexOf(selectedNumber);

    // Calculate rotation
    const degreesPerNumber = 360 / rouletteNumbers.length;
    const targetRotation = 360 * 5 + (selectedIndex * degreesPerNumber) + (degreesPerNumber / 2);
    
    // Animate rotation
    setRotation(prev => prev + targetRotation);
    
    // Show result after animation
    setTimeout(() => {
      setResult(selectedNumber);
      setIsSpinning(false);
      toast.success(`¡La ruleta ha hablado! 🎯`, {
        description: `Número sugerido: ${selectedNumber.padStart(2, '0')} - ${ANIMAL_MAPPING[selectedNumber] || 'Número'}`
      });
    }, 4000);
  }, [isSpinning, history, selectedLottery, lastNumber, rouletteNumbers]);

  const resetRoulette = () => {
    setResult(null);
    setLastNumber('');
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dices className="w-5 h-5 text-primary" />
            Ruleta Universal Inteligente
          </CardTitle>
          
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.filter(l => l.type === 'animals').map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Basada en algoritmo predictivo • Consistente para {getTodayDate()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lottery logo in center */}
        <div className="flex justify-center mb-4">
          <img 
            src={getLotteryLogo(selectedLottery)} 
            alt={lottery?.name} 
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Roulette Wheel */}
        <div className="relative flex justify-center items-center">
          <div 
            ref={canvasRef}
            className="relative w-64 h-64 rounded-full border-4 border-primary shadow-lg overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              background: `conic-gradient(
                from 0deg,
                ${rouletteNumbers.map((_, i) => {
                  const color = i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))';
                  const start = (i / rouletteNumbers.length) * 100;
                  const end = ((i + 1) / rouletteNumbers.length) * 100;
                  return `${color} ${start}% ${end}%`;
                }).join(', ')}
              )`
            }}
          >
            {/* Number labels around the wheel */}
            {rouletteNumbers.map((num, idx) => {
              const angle = (idx / rouletteNumbers.length) * 360 - 90;
              const radius = 100;
              return (
                <div
                  key={num}
                  className="absolute text-[8px] font-bold text-primary-foreground"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `
                      translate(-50%, -50%) 
                      rotate(${angle}deg) 
                      translateX(${radius}px) 
                      rotate(${-angle}deg)
                    `
                  }}
                >
                  {num.padStart(2, '0')}
                </div>
              );
            })}
            
            {/* Center pointer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-background border-2 border-primary shadow-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          {/* Arrow indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-500" />
          </div>
        </div>

        {/* Input for last number */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Último número que salió (opcional):</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ej: 15"
              value={lastNumber}
              onChange={(e) => setLastNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              className="font-mono text-center text-lg"
              maxLength={2}
            />
            <Button 
              onClick={spinRoulette} 
              disabled={isSpinning}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Girando...
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4 mr-2" />
                  ¡Girar Ruleta!
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result display */}
        {result && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-2 border-primary">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-lg">¡Resultado!</h3>
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              
              <RichAnimalCard
                code={result}
                size="lg"
                showProbability={false}
                className="mx-auto w-fit"
              />
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                <Zap className="w-4 h-4 inline mr-1 text-primary" />
                Sugerencia basada en análisis predictivo
              </p>
            </div>
          </div>
        )}

        <Button onClick={resetRoulette} variant="outline" className="w-full" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
      </CardContent>
    </Card>
  );
}
