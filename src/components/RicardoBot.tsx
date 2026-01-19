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
import { LOTTERIES, ADMIN_CODE, getDrawTimesForLottery } from '@/lib/constants';
import { 
  getRandomExpression, 
  getRandomResponse, 
  getAnimalMeaning,
  getLotteryInfo,
  getRandomTip
} from '@/lib/ricardoKnowledge';
import { getAnimalByCode, getAnimalName, getAnimalEmoji } from '@/lib/animalData';
import { 
  generateHourlyPredictions, 
  getExplosivePredictions,
  AdvancedPrediction 
} from '@/lib/advancedProbability';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Cargar historial - optimizado con throttling
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (data) {
        setHistory(data);
      }
    };
    loadHistory();

    let updateTimeout: NodeJS.Timeout;
    const channel = supabase
      .channel('ricardo-results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => {
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

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Llamar a la IA general
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
        return `${getRandomExpression()} ¡Epa chamo! Tuve un problemita. Intenta de nuevo.`;
      }

      return response.data?.response || `${getRandomExpression()} No pude procesar eso.`;
    } catch (error) {
      return `${getRandomExpression()} ¡Coño! Hubo un error. Intenta de nuevo.`;
    }
  }, [messages]);

  // Verificar si es sobre loterías
  const isLotteryRelated = useCallback((msg: string): boolean => {
    const keywords = [
      'pronóstico', 'predicción', 'predic', 'qué va a salir', 'qué juego', 'dame números',
      'lotería', 'animalitos', 'lotto', 'granjita', 'selva', 'guacharo',
      'sorteo', 'número', 'animal', 'tigre', 'león', 'gato', 'perro',
      'soñé', 'sueño', 'insertar', 'análisis', 'estadísticas',
      'caliente', 'frío', 'vencido', 'hora', 'ayuda'
    ];
    const lower = msg.toLowerCase();
    return keywords.some(k => lower.includes(k)) ||
           LOTTERIES.some(l => lower.includes(l.id) || lower.includes(l.name.toLowerCase()));
  }, []);

  // Procesar mensaje con nuevo algoritmo
  const processMessage = useCallback(async (userMessage: string): Promise<string> => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Admin check
    if (lowerMsg.includes(ADMIN_CODE.toLowerCase())) {
      setIsAdmin(true);
      return `${getRandomExpression()} ¡Acceso de administrador activado! ¿Qué necesitas, jefe?`;
    }

    // Saludos
    if (lowerMsg.match(/^(hola|hey|epa|qué tal|buenas)$/)) {
      return getRandomResponse('greeting');
    }

    // Despedidas
    if (lowerMsg.match(/^(chao|adiós|bye|hasta luego)$/)) {
      return getRandomResponse('farewell');
    }

    // Si es sobre loterías, usar nuevo algoritmo
    if (isLotteryRelated(lowerMsg)) {
      // Pronósticos
      if (lowerMsg.match(/pronóstico|predicción|predic|qué va a salir|dame números|recomend/)) {
        if (history.length < 10) {
          return getRandomResponse('noData');
        }

        let targetLottery = LOTTERIES.find(l => 
          lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
        ) || LOTTERIES[0];

        // Usar nuevo algoritmo con probabilidades variables
        const predictions = getExplosivePredictions(targetLottery.id, history, today, 5);

        let response = `${getRandomExpression()} ¡Pronósticos para **${targetLottery.name}**!\n\n`;
        response += `🎯 **TOP 5 (Probabilidades 35-98%):**\n`;
        
        predictions.forEach((p, i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📍';
          response += `${emoji} **${p.code}** - ${p.name} ${p.statusEmoji} (${p.probability}%)\n`;
        });

        // Mostrar vencidos
        const overdue = predictions.filter(p => p.daysSince > 5);
        if (overdue.length > 0) {
          response += `\n⚠️ **VENCIDOS:** ${overdue.slice(0, 3).map(p => `${p.code} (${p.daysSince}d)`).join(', ')}\n`;
        }

        response += `\n💪 Algoritmo avanzado - Porcentajes únicos por número/hora`;
        response += `\n\n${getRandomTip()}`;

        return response;
      }

      // Hora específica
      const hourMatch = lowerMsg.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (hourMatch && (lowerMsg.includes('hora') || lowerMsg.includes('sorteo'))) {
        let hour = hourMatch[1].toUpperCase();
        if (!hour.includes(':')) hour = hour.replace(/(\d+)/, '$1:00');
        if (!hour.includes('AM') && !hour.includes('PM')) {
          const num = parseInt(hour);
          hour += num < 8 || num === 12 ? ' PM' : ' AM';
        }

        const targetLottery = LOTTERIES.find(l => 
          lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
        ) || LOTTERIES[0];

        const predictions = generateHourlyPredictions(targetLottery.id, hour, history, today);
        const top3 = predictions.slice(0, 3);
        
        let response = `${getRandomExpression()} ¡Pronóstico para **${targetLottery.name}** a las **${hour}**!\n\n`;
        response += `🎯 **Números recomendados:**\n`;
        top3.forEach((p, i) => {
          response += `${i + 1}. **${p.code}** - ${p.name} ${p.statusEmoji} (${p.probability}%)\n`;
        });
        response += `\n💡 Porcentajes calculados con algoritmo determinístico`;
        return response;
      }

      // Animal específico
      const animal = Array.from({ length: 37 }, (_, i) => i.toString()).find(code => {
        const name = getAnimalName(code);
        return name && lowerMsg.includes(name.toLowerCase());
      });
      
      if (animal) {
        const animalInfo = getAnimalByCode(animal);
        const meaning = getAnimalMeaning(animal);
        
        let response = `${getRandomExpression()} ¡Te cuento sobre el **${animalInfo?.name}** (${animal})!\n\n`;
        
        if (meaning) {
          response += `🔮 **Significado:** ${meaning.meaning}\n`;
          response += `💭 **Sueños:** ${meaning.dreams}\n\n`;
        }

        const animalHistory = history.filter(h => 
          h.result_number === animal || h.result_number === animal.padStart(2, '0')
        );
        
        if (animalHistory.length > 0) {
          const lastSeen = new Date(animalHistory[0].created_at);
          const daysSince = Math.ceil((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
          
          response += `📊 **Estadísticas:**\n`;
          response += `• Apariciones: ${animalHistory.length} veces\n`;
          response += `• Último: hace ${daysSince} día(s)\n`;
        }

        return response;
      }

      // Ayuda
      if (lowerMsg.match(/ayuda|help|comandos/)) {
        return `${getRandomExpression()} ¡Aquí está lo que puedo hacer!\n\n` +
          `🎯 **Pronósticos:** "Dame pronóstico para Lotto Activo"\n` +
          `⏰ **Por hora:** "¿Qué sale a las 10 AM?"\n` +
          `🐾 **Animales:** "Cuéntame del Tigre"\n` +
          `📊 **Análisis:** "Análisis completo"\n` +
          `🌍 **General:** ¡Pregúntame lo que sea!\n\n` +
          `💡 Uso probabilidades variables (35-98%) - ¡Nada de 67% fijo!`;
      }

      // Análisis completo
      if (lowerMsg.match(/análisis|estadísticas|reporte|completo/)) {
        if (history.length < 10) return getRandomResponse('noData');

        let response = `${getRandomExpression()} ¡Análisis completo del día!\n\n`;
        
        for (const lottery of LOTTERIES.slice(0, 3)) {
          const preds = getExplosivePredictions(lottery.id, history, today, 3);
          response += `**${lottery.name}**\n`;
          response += `🔥 Top: ${preds.map(p => `${p.code}(${p.probability}%)`).join(', ')}\n\n`;
        }

        response += `💡 **Tip:** ${getRandomTip()}`;
        return response;
      }
    }

    // IA general
    return await callGeneralAI(userMessage);
  }, [isAdmin, history, today, isLotteryRelated, callGeneralAI]);

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
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error('Error al procesar el mensaje');
    }

    setIsLoading(false);
  }, [input, isLoading, processMessage]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-gradient-to-br from-primary to-accent hover:scale-110'
        }`}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir Ricardo Bot'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-7 h-7 text-white" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-300 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-card border-2 border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  Ricardo Bot
                  {isAdmin && <Lock className="w-3 h-3 text-amber-300" />}
                </h3>
                <p className="text-xs opacity-80">Experto en Animalitos • Prob. 35-98%</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-50">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-muted/30">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregúntame algo..."
                className="flex-1 bg-background"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Prob. variables 35-98% • Sin el 67% fijo
            </p>
          </div>
        </div>
      )}
    </>
  );
}
