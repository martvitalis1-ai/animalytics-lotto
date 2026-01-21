import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, Dices, Trophy, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';
import { getCodesForLottery, getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateHourlyPredictions } from '@/lib/advancedProbability';
import { toast } from "sonner";

// Import roulette images
import ruletaLottoActivo from '@/assets/ruleta-lotto-activo.png';
import ruletaLottoRey from '@/assets/ruleta-lotto-rey.png';
import ruletaGranjita from '@/assets/ruleta-granjita.png';
import ruletaSelvaPlus from '@/assets/ruleta-selva-plus.png';
import ruletaGuacharo from '@/assets/ruleta-guacharo.png';
import ruletaGuacharito from '@/assets/ruleta-guacharito.png';

// Map lottery IDs to their respective roulette images
const ROULETTE_IMAGES: Record<string, string> = {
  'lotto_activo': ruletaLottoActivo,
  'lotto_rey': ruletaLottoRey,
  'granjita': ruletaGranjita,
  'selva_plus': ruletaSelvaPlus,
  'guacharo': ruletaGuacharo,
  'guacharito': ruletaGuacharito
};

export function UniversalRoulette() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [lastNumber, setLastNumber] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

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

  // Get roulette numbers based on lottery type
  const rouletteNumbers = useMemo(() => {
    return getCodesForLottery(selectedLottery);
  }, [selectedLottery]);

  // Check if extended mode (Guácharo)
  const isExtendedMode = selectedLottery === 'guacharo' || selectedLottery === 'guacharito';
  const maxNumber = isExtendedMode ? 99 : 36;

  // Intelligent spin algorithm
  const spinRoulette = useCallback(async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);

    // Get predictions for weighting
    const today = new Date().toISOString().split('T')[0];
    const predictions = generateHourlyPredictions(
      selectedLottery,
      new Date().getHours() < 12 ? '09:00 AM' : '03:00 PM',
      history,
      today
    );
    
    // Weight selection based on predictions + last number input
    let weightedNumbers: string[] = [];
    
    // Add top predictions with higher weight
    predictions.slice(0, 10).forEach((pred, idx) => {
      const weight = 10 - idx;
      for (let i = 0; i < weight; i++) {
        weightedNumbers.push(pred.code);
      }
    });

    // If last number provided, use cross-formula logic
    if (lastNumber) {
      const lastNum = parseInt(lastNumber);
      if (!isNaN(lastNum)) {
        // Digital root
        let root = lastNum;
        while (root > maxNumber) {
          root = root.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        weightedNumbers.push(root.toString(), root.toString(), root.toString());
        
        // Sum of digits
        const digitSum = lastNumber.split('').reduce((a, b) => a + parseInt(b), 0);
        if (digitSum <= maxNumber) {
          weightedNumbers.push(digitSum.toString(), digitSum.toString());
        }
        
        // Complement
        const complement = Math.abs(maxNumber - lastNum);
        if (complement <= maxNumber && complement >= 0) {
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
    
    // Show result after animation (faster)
    setTimeout(() => {
      setResult(selectedNumber);
      setIsSpinning(false);
      const name = getAnimalName(selectedNumber);
      toast.success(`¡La ruleta ha hablado! 🎯`, {
        description: `Número sugerido: ${selectedNumber} - ${name}`
      });
    }, 2500);
  }, [isSpinning, history, selectedLottery, lastNumber, rouletteNumbers, maxNumber]);

  const resetRoulette = () => {
    setResult(null);
    setLastNumber('');
  };

  // Get segment size based on mode
  const segmentStyle = isExtendedMode ? 'text-[5px]' : 'text-[8px]';

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
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
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
          {isExtendedMode ? 'Modo Extendido (0-99)' : 'Modo Estándar (0-36)'} • Algoritmo predictivo
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Roulette Wheel with Real Images */}
        <div className="relative flex justify-center items-center">
          <div 
            className={`relative rounded-full shadow-2xl overflow-hidden ${
              isExtendedMode ? 'w-80 h-80' : 'w-72 h-72'
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {/* Real roulette image */}
            <img 
              src={ROULETTE_IMAGES[selectedLottery] || ruletaLottoActivo}
              alt={`Ruleta ${lottery?.name}`}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
          
          {/* Arrow indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg animate-pulse" />
          </div>
        </div>

        {/* Input for last number */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Último número que salió (opcional):</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={`Ej: ${isExtendedMode ? '75' : '15'}`}
              value={lastNumber}
              onChange={(e) => setLastNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, isExtendedMode ? 2 : 2))}
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
                <h3 className="font-bold text-lg">{lottery?.name}</h3>
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              
              <RichAnimalCard
                code={result}
                size="lg"
                showProbability={false}
                className="mx-auto w-fit"
                lotteryName={lottery?.name}
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
