import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Lock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING, ADMIN_CODE, DRAW_TIMES } from '@/lib/constants';
import { 
  RICARDO_KNOWLEDGE, 
  getRandomExpression, 
  getRandomResponse, 
  getAnimalMeaning,
  getLotteryInfo,
  getRandomTip
} from '@/lib/ricardoKnowledge';
import { analyzeAdvancedPatterns, generateHourlyForecast } from '@/lib/advancedAI';
import { getCachedPredictions, getTodayDate, CachedPrediction } from '@/lib/predictionCache';
import { AnimalEmoji } from './AnimalImage';
import { getAnimalByCode } from '@/lib/animalData';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function RicardoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [cachedPredictionsMap, setCachedPredictionsMap] = useState<Record<string, CachedPrediction>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar historial de lotería - memoized to avoid recalculation
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (data) {
        setHistory(data);
        
        // Pre-calculate and cache predictions for all lotteries
        const predictionsMap: Record<string, CachedPrediction> = {};
        LOTTERIES.forEach(lottery => {
          predictionsMap[lottery.id] = getCachedPredictions(data, lottery.id);
        });
        setCachedPredictionsMap(predictionsMap);
      }
    };
    loadHistory();

    // Suscripción en tiempo real - throttled updates
    let updateTimeout: NodeJS.Timeout;
    const channel = supabase
      .channel('ricardo-results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => {
        // Throttle updates to avoid excessive recalculations
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          loadHistory();
        }, 2000);
      })
      .subscribe();

    return () => { 
      clearTimeout(updateTimeout);
      supabase.removeChannel(channel); 
    };
  }, []);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getRandomResponse('greeting'),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Llamar a la IA general para preguntas no relacionadas con loterías
  const callGeneralAI = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await supabase.functions.invoke('ricardo-ai', {
        body: { message: userMessage, conversationHistory }
      });

      if (response.error) {
        console.error('AI function error:', response.error);
        return `${getRandomExpression()} ¡Epa chamo! Tuve un problemita. ${response.error.message || 'Intenta de nuevo.'}`;
      }

      if (response.data?.error) {
        return response.data.message || `${getRandomExpression()} Algo salió mal, vale.`;
      }

      return response.data?.response || `${getRandomExpression()} No pude procesar eso, intenta de nuevo.`;
    } catch (error) {
      console.error('Error calling AI:', error);
      return `${getRandomExpression()} ¡Coño! Hubo un error conectando con mi cerebro. Intenta de nuevo.`;
    }
  }, [messages]);

  // Verificar si el mensaje es sobre loterías/animalitos - memoized
  const isLotteryRelated = useCallback((msg: string): boolean => {
    const lotteryKeywords = [
      'pronóstico', 'predicción', 'predic', 'qué va a salir', 'qué juego', 'dame números',
      'lotería', 'loteria', 'animalitos', 'animalito', 'lotto', 'granjita', 'selva', 
      'guacharo', 'guacharito', 'sorteo', 'número', 'numero', 'animal',
      'tigre', 'león', 'gato', 'perro', 'caballo', 'elefante', 'mono', 'cochino',
      'soñé', 'sueño', 'dream', 'insertar', 'resultado', 'análisis', 'estadísticas',
      'caliente', 'frío', 'vencido', 'matriz', 'hora', 'ayuda', 'help', 'comandos'
    ];
    const lowerMsg = msg.toLowerCase();
    return lotteryKeywords.some(keyword => lowerMsg.includes(keyword)) ||
           LOTTERIES.some(l => lowerMsg.includes(l.id.toLowerCase()) || lowerMsg.includes(l.name.toLowerCase()));
  }, []);

  // Boost probability for display (35-85% range)
  const boostProbability = useCallback((prob: number): number => {
    if (prob < 35) {
      return Math.min(85, 35 + (prob * 0.5));
    }
    return Math.min(85, prob);
  }, []);

  const processMessage = useCallback(async (userMessage: string): Promise<string> => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Verificar si intenta activar modo admin
    if (lowerMsg.includes(ADMIN_CODE.toLowerCase()) || lowerMsg.includes('ganador85')) {
      setIsAdmin(true);
      return `${getRandomExpression()} ¡Acceso de administrador activado! Ahora puedo ayudarte con tareas especiales. ¿Qué necesitas que haga, jefe?`;
    }

    // Comandos de admin
    if (isAdmin) {
      // Insertar resultado
      if (lowerMsg.includes('insertar') || lowerMsg.includes('agregar resultado')) {
        return `¡Claro jefe! Para insertar un resultado necesito:\n\n` +
          `📝 **Formato:** "insertar [lotería] [hora] [número]"\n` +
          `📌 **Ejemplo:** "insertar lotto_activo 09:00 AM 15"\n\n` +
          `Loterías disponibles: ${LOTTERIES.map(l => l.id).join(', ')}`;
      }

      // Procesar inserción
      const insertMatch = lowerMsg.match(/insertar\s+(\w+)\s+(\d{2}:\d{2}\s*(?:AM|PM))\s+(\d+)/i);
      if (insertMatch) {
        const [, lottery, time, number] = insertMatch;
        const lotteryConfig = LOTTERIES.find(l => l.id === lottery || l.name.toLowerCase().includes(lottery));
        
        if (lotteryConfig) {
          const animal = lotteryConfig.type === 'animals' ? ANIMAL_MAPPING[number] : null;
          const today = new Date().toISOString().split('T')[0];
          
          const { error } = await supabase.from('lottery_results').insert({
            lottery_type: lotteryConfig.id,
            result_number: number.padStart(2, '0'),
            animal_name: animal,
            draw_time: time.toUpperCase(),
            draw_date: today
          });
          
          if (error) {
            return `😅 Epa, hubo un problema: ${error.message}`;
          }
          
          return `${getRandomExpression()} ¡Resultado insertado exitosamente!\n\n` +
            `🎰 **${lotteryConfig.name}**\n` +
            `⏰ Hora: ${time}\n` +
            `🔢 Número: ${number}${animal ? ` - ${animal}` : ''}\n\n` +
            `La IA ya está aprendiendo de este nuevo dato. 🧠`;
        }
        return `Chamo, no encontré esa lotería. Las disponibles son: ${LOTTERIES.map(l => l.id).join(', ')}`;
      }

      // Eliminar resultado
      if (lowerMsg.includes('eliminar') || lowerMsg.includes('borrar resultado')) {
        return `Para eliminar un resultado, ve a la sección **Admin > Gestión del Historial**. ` +
          `Por seguridad, solo puedes eliminar desde ahí, vale.`;
      }
    }

    // Saludos básicos
    if (lowerMsg.match(/^(hola|hey|epa|qué tal|buenas|saludos)$/)) {
      return getRandomResponse('greeting');
    }

    // Despedidas
    if (lowerMsg.match(/^(chao|adiós|bye|hasta luego|nos vemos)$/)) {
      return getRandomResponse('farewell');
    }

    // Si es relacionado con loterías, usar lógica local CON CACHE
    if (isLotteryRelated(lowerMsg)) {
      // Preguntar por pronósticos - USE CACHED PREDICTIONS
      if (lowerMsg.match(/pronóstico|predicción|predic|qué va a salir|qué juego|dame números|recomend/)) {
        if (history.length < 10) {
          return getRandomResponse('noData');
        }

        let targetLottery = LOTTERIES.find(l => 
          lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
        );

        if (!targetLottery) {
          targetLottery = LOTTERIES[0];
        }

        // Use pre-cached predictions instead of recalculating
        const cached = cachedPredictionsMap[targetLottery.id] || getCachedPredictions(history, targetLottery.id);
        const predictions = cached.predictions.slice(0, 5);

        let response = `${getRandomExpression()} ¡Aquí están mis pronósticos para **${targetLottery.name}**!\n\n`;
        
        response += `🎯 **TOP 5 NÚMEROS (Bloqueados para ${getTodayDate()}):**\n`;
        predictions.forEach((p, i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📍';
          const animal = targetLottery?.type === 'animals' ? ` - ${p.animal}` : '';
          const boostedProb = boostProbability(p.probability);
          response += `${emoji} **${p.number.padStart(2, '0')}**${animal} (${boostedProb.toFixed(0)}% prob)\n`;
        });

        if (cached.overdueNumbers.length > 0) {
          response += `\n⚠️ **VENCIDOS:** ${cached.overdueNumbers.slice(0, 3).map(n => n.number.padStart(2, '0')).join(', ')}\n`;
        }

        response += `\n💪 Predicciones consistentes - no cambiarán hoy.`;
        response += `\n\n${getRandomTip()}`;

        return response;
      }

      // Preguntar por hora específica - USE CACHED
      const hourMatch = lowerMsg.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (hourMatch && (lowerMsg.includes('hora') || lowerMsg.includes('sorteo'))) {
        let hour = hourMatch[1].toUpperCase();
        if (!hour.includes(':')) {
          hour = hour.replace(/(\d+)/, '$1:00');
        }
        if (!hour.includes('AM') && !hour.includes('PM')) {
          const num = parseInt(hour);
          hour += num < 8 || num === 12 ? ' PM' : ' AM';
        }

        const targetLottery = LOTTERIES.find(l => 
          lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
        ) || LOTTERIES[0];

        // Use cached forecast
        const cached = cachedPredictionsMap[targetLottery.id];
        if (cached) {
          const topPredictions = cached.predictions.slice(0, 3);
          
          let response = `${getRandomExpression()} ¡Pronóstico para **${targetLottery.name}** a las **${hour}**!\n\n`;
          response += `🎯 **Números recomendados:**\n`;
          topPredictions.forEach((p, i) => {
            const animal = getAnimalByCode(p.number);
            const boostedProb = boostProbability(p.probability);
            response += `${i + 1}. **${p.number.padStart(2, '0')}** - ${animal?.name || 'N/A'} (${boostedProb.toFixed(0)}%)\n`;
          });
          response += `\n💪 Consistente para todo el día`;
          return response;
        }

        return `Chamo, no tengo suficientes datos para las ${hour}. Necesito más historial.`;
      }

      // Preguntar por animal específico
      const animalMatch = Object.entries(ANIMAL_MAPPING).find(([num, animal]) => 
        lowerMsg.includes(animal.toLowerCase())
      );
      if (animalMatch) {
        const [num, animal] = animalMatch;
        const meaning = getAnimalMeaning(num);
        
        let response = `${getRandomExpression()} ¡Te cuento sobre el **${animal}** (${num.padStart(2, '0')})!\n\n`;
        
        if (meaning) {
          response += `🔮 **Significado:** ${meaning.meaning}\n`;
          response += `💭 **Sueños:** ${meaning.dreams}\n\n`;
        }

        const animalHistory = history.filter(h => 
          h.result_number === num || h.result_number === num.padStart(2, '0')
        );
        
        if (animalHistory.length > 0) {
          const lastSeen = new Date(animalHistory[0].created_at);
          const daysSince = Math.ceil((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
          
          response += `📊 **Estadísticas:**\n`;
          response += `• Ha salido ${animalHistory.length} veces en el historial\n`;
          response += `• Última vez: hace ${daysSince} día(s)\n`;
          response += `• Última lotería: ${animalHistory[0].lottery_type}\n`;
        }

        return response;
      }

      // Preguntar por lotería específica
      const lotteryMatch = LOTTERIES.find(l => 
        lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
      );
      if (lotteryMatch) {
        const info = getLotteryInfo(lotteryMatch.id);
        if (info) {
          let response = `${getRandomExpression()} ¡Te cuento sobre **${info.name}**!\n\n`;
          response += `📝 ${info.description}\n\n`;
          response += `⏰ **Horario:** ${info.schedule}\n`;
          response += `💡 **Tip:** ${info.tips}\n`;
          return response;
        }
      }

      // Preguntar por sueños
      if (lowerMsg.match(/soñé|sueño|dream|qué significa/)) {
        let response = `${getRandomExpression()} ¡Los sueños son clave en los animalitos!\n\n`;
        response += `Cuéntame qué soñaste y te digo qué animal jugar. Aquí algunos ejemplos:\n\n`;
        
        const examples = ['10', '12', '5', '20', '27'];
        examples.forEach(num => {
          const meaning = getAnimalMeaning(num);
          if (meaning) {
            response += `🔮 **${meaning.animal}** (${num}): ${meaning.dreams}\n`;
          }
        });

        return response;
      }

      // Ayuda
      if (lowerMsg.match(/ayuda|help|qué puedes|comandos/)) {
        let response = `${getRandomExpression()} ¡Aquí está lo que puedo hacer!\n\n`;
        response += `🎯 **Pronósticos:** "Dame pronóstico para Lotto Activo"\n`;
        response += `⏰ **Por hora:** "¿Qué sale a las 10 AM?"\n`;
        response += `🐾 **Animales:** "Cuéntame del Tigre"\n`;
        response += `🎰 **Loterías:** "Info de La Granjita"\n`;
        response += `💭 **Sueños:** "Soñé con un caballo"\n`;
        response += `📊 **Análisis:** "Análisis completo"\n`;
        response += `\n🌍 **CUALQUIER TEMA:** ¡Pregúntame lo que sea!\n`;
        
        if (isAdmin) {
          response += `\n👑 **ADMIN:**\n`;
          response += `📝 "Insertar lotto_activo 09:00 AM 15"\n`;
        }

        return response;
      }

      // Análisis completo - USE CACHED
      if (lowerMsg.match(/análisis|estadísticas|reporte|completo/)) {
        if (history.length < 10) {
          return getRandomResponse('noData');
        }

        let response = `${getRandomExpression()} ¡Análisis completo del día (${getTodayDate()})!\n\n`;
        
        for (const lottery of LOTTERIES.slice(0, 3)) {
          const cached = cachedPredictionsMap[lottery.id];
          if (cached) {
            response += `**${lottery.name}**\n`;
            response += `🔥 Top: ${cached.predictions.slice(0, 3).map(p => p.number.padStart(2, '0')).join(', ')}\n`;
            if (cached.overdueNumbers.length > 0) {
              response += `⚠️ Vencidos: ${cached.overdueNumbers.slice(0, 3).map(n => n.number.padStart(2, '0')).join(', ')}\n`;
            }
            response += `\n`;
          }
        }

        response += `💡 **Tip del día:** ${getRandomTip()}`;
        return response;
      }
    }

    // Si no es sobre loterías o no se reconoce, usar IA general
    return await callGeneralAI(userMessage);
  }, [isAdmin, history, cachedPredictionsMap, isLotteryRelated, boostProbability, callGeneralAI]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processMessage(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Error al procesar el mensaje');
    }

    setIsLoading(false);
  }, [input, isLoading, processMessage]);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-destructive text-destructive-foreground rotate-0' 
            : 'bg-primary text-primary-foreground hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Panel del chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary to-primary/80">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Ricardo</h3>
              <p className="text-xs text-white/80">
                {isAdmin ? '👑 Modo Admin' : 'Tu experto en animalitos'}
              </p>
            </div>
            {isAdmin && <Lock className="w-4 h-4 text-white/80" />}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Powered by Animalytics AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
