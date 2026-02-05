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
import { getAnimalByCode, getAnimalName, getAnimalEmoji, getFullAnimalListString } from '@/lib/animalData';
import { 
  generateHourlyPredictions, 
  getExplosivePredictions,
  AdvancedPrediction 
} from '@/lib/advancedProbability';
import { buildMemoryContext, saveBotMemory, extractSaveMemoryCommand } from '@/lib/botMemory';
import { LEARNING_START_DATE } from '@/lib/hypothesisEngine';
import { getPredictedSuccessors, getMatrixSummary } from '@/lib/sequenceMatrix';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const SESSION_STORAGE_KEY = 'ricardo_chat_history';
const SESSION_ADMIN_KEY = 'ricardo_is_admin';

export function RicardoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [memoryContext, setMemoryContext] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Restore chat history from sessionStorage
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const savedAdmin = sessionStorage.getItem(SESSION_ADMIN_KEY);
      
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      }
      
      if (savedAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.warn('Failed to restore chat history:', e);
    }
  }, []);

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  // Save admin status to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(SESSION_ADMIN_KEY, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Load COMPLETE history without limits
  useEffect(() => {
    const loadHistory = async () => {
      // NO LIMIT - Load complete history since learning start date
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .gte('draw_date', LEARNING_START_DATE)
        .order('created_at', { ascending: false });
      
      if (data) {
        setHistory(data);
        console.log(`[RicardoBot] Loaded ${data.length} results since ${LEARNING_START_DATE} (NO LIMIT)`);
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

  // Load bot memory when opening
  useEffect(() => {
    if (isOpen) {
      const loadMemory = async () => {
        const context = await buildMemoryContext();
        setMemoryContext(context);
        console.log('[RicardoBot] Memory context loaded:', context.length, 'chars');
      };
      loadMemory();
    }
  }, [isOpen]);

  // Welcome message only if no saved messages
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

  // Call general AI with memory context and full animal lists
  const callGeneralAI = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Include memory context in request
      const response = await supabase.functions.invoke('ricardo-ai', {
        body: { 
          message: userMessage, 
          conversationHistory,
          memoryContext: memoryContext // Send admin memory to backend
        }
      });

      if (response.error) {
        return `${getRandomExpression()} ¡Epa chamo! Tuve un problemita. Intenta de nuevo.`;
      }

      return response.data?.response || `${getRandomExpression()} No pude procesar eso.`;
    } catch (error) {
      return `${getRandomExpression()} ¡Coño! Hubo un error. Intenta de nuevo.`;
    }
  }, [messages, memoryContext]);

  // Check if message is lottery-related
  const isLotteryRelated = useCallback((msg: string): boolean => {
    const keywords = [
      'pronóstico', 'predicción', 'predic', 'qué va a salir', 'qué juego', 'dame números',
      'lotería', 'animalitos', 'lotto', 'granjita', 'selva', 'guacharo',
      'sorteo', 'número', 'animal', 'tigre', 'león', 'gato', 'perro',
      'soñé', 'sueño', 'insertar', 'análisis', 'estadísticas',
      'caliente', 'frío', 'vencido', 'hora', 'ayuda', 'matriz', 'secuencia'
    ];
    const lower = msg.toLowerCase();
    return keywords.some(k => lower.includes(k)) ||
           LOTTERIES.some(l => lower.includes(l.id) || lower.includes(l.name.toLowerCase()));
  }, []);

  // Check if message is sports-related
  const isSportsRelated = useCallback((msg: string): boolean => {
    const keywords = [
      'fútbol', 'soccer', 'béisbol', 'baseball', 'básquet', 'basketball', 'nba',
      'mlb', 'nfl', 'hockey', 'nhl', 'parley', 'deporte', 'equipo', 'partido',
      'liga', 'champions', 'libertadores', 'lvbp', 'real madrid', 'barcelona',
      'yankees', 'lakers', 'celtics', 'chiefs', 'eagles', 'pronóstico deportivo'
    ];
    return keywords.some(k => msg.toLowerCase().includes(k));
  }, []);

  // Process message with new algorithm
  const processMessage = useCallback(async (userMessage: string): Promise<string> => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Check for admin codes (GANADOR85 and GANADOR2026)
    const adminCodes = ['ganador85', 'ganador2026'];
    const cleanInput = lowerMsg.trim().replace(/\s+/g, '');
    
    if (adminCodes.some(code => cleanInput.includes(code.replace(/\s+/g, '')))) {
      setIsAdmin(true);
      return `${getRandomExpression()} ¡Acceso de administrador activado! ¿Qué necesitas, jefe?`;
    }

    // Check for save memory command (admin only)
    if (isAdmin) {
      const memoryCommand = extractSaveMemoryCommand(userMessage);
      if (memoryCommand.shouldSave) {
        const saved = await saveBotMemory(memoryCommand.content, 'instruction');
        if (saved) {
          // Refresh memory context
          const newContext = await buildMemoryContext();
          setMemoryContext(newContext);
          return `${getRandomExpression()} ¡Guardado en mi memoria permanente! Recordaré: "${memoryCommand.content}"`;
        } else {
          return `${getRandomExpression()} No pude guardar eso en mi memoria. Intenta de nuevo.`;
        }
      }
    }

    // Greetings
    if (lowerMsg.match(/^(hola|hey|epa|qué tal|buenas)$/)) {
      return getRandomResponse('greeting');
    }

    // Farewells
    if (lowerMsg.match(/^(chao|adiós|bye|hasta luego)$/)) {
      return getRandomResponse('farewell');
    }

    // Sports-related queries (brief and executive)
    if (isSportsRelated(lowerMsg)) {
      let response = `${getRandomExpression()} ¡Tendencias deportivas!\n\n`;
      
      if (lowerMsg.includes('nba') || lowerMsg.includes('básquet')) {
        response += `🏀 **NBA Hoy:**\n`;
        response += `• Lakers vs Celtics: Lakers favorito (65%)\n`;
        response += `• Warriors vs Suns: Over 220 puntos (70%)\n`;
        response += `💡 Consejo: Busca spreads en cuartos finales.\n`;
      } else if (lowerMsg.includes('mlb') || lowerMsg.includes('béisbol') || lowerMsg.includes('lvbp')) {
        response += `⚾ **Béisbol Hoy:**\n`;
        response += `• Yankees favorito ante Red Sox (60%)\n`;
        response += `• Dodgers: Pitcheo dominante (68%)\n`;
        response += `💡 Consejo: Revisa el pitcheo abridor.\n`;
      } else if (lowerMsg.includes('nfl') || lowerMsg.includes('football')) {
        response += `🏈 **NFL Tendencias:**\n`;
        response += `• Chiefs: Racha positiva (72%)\n`;
        response += `• Under en climas fríos suele pagar\n`;
        response += `💡 Consejo: Mira las lesiones del día.\n`;
      } else if (lowerMsg.includes('hockey') || lowerMsg.includes('nhl')) {
        response += `🏒 **NHL Hoy:**\n`;
        response += `• Oilers: Ofensiva alta (65%)\n`;
        response += `• Rangers: Defensa sólida en casa\n`;
        response += `💡 Consejo: Busca Over en partidos de rivalidad.\n`;
      } else {
        response += `⚽ **Fútbol Hoy:**\n`;
        response += `• Real Madrid: Tendencia positiva (68%)\n`;
        response += `• Premier: Equipos locales dominando\n`;
        response += `💡 Ve a /sports para análisis completo.\n`;
      }
      
      response += `\n🎯 Esto es análisis de tendencias, no garantía.`;
      return response;
    }

    // Matrix/Sequence query
    if (lowerMsg.match(/matriz|secuencia|sucesores|después de/)) {
      const targetLottery = LOTTERIES.find(l => 
        lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
      ) || LOTTERIES[0];

      // Check for specific number query
      const numberMatch = lowerMsg.match(/(?:después de|número|el)\s*(\d{1,2})/);
      
      if (numberMatch) {
        const queryNumber = numberMatch[1];
        const successors = getPredictedSuccessors(queryNumber, history, targetLottery.id, 5);
        
        if (successors.length === 0) {
          return `${getRandomExpression()} No tengo suficientes datos sobre el ${queryNumber} en ${targetLottery.name}.`;
        }

        let response = `${getRandomExpression()} **Después del ${queryNumber}** en ${targetLottery.name}:\n\n`;
        successors.forEach((s, i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📍';
          response += `${emoji} **${s.code}** - ${s.name} (${s.probability}%)\n`;
        });
        response += `\n📊 Basado en histórico completo desde ${LEARNING_START_DATE}`;
        return response;
      }

      // Full matrix summary
      const summary = await getMatrixSummary(targetLottery.id, history);
      return `${getRandomExpression()}\n\n${summary}`;
    }

    // If lottery-related, use prediction algorithm
    if (isLotteryRelated(lowerMsg)) {
      // Predictions
      if (lowerMsg.match(/pronóstico|predicción|predic|qué va a salir|dame números|recomend/)) {
        if (history.length < 10) {
          return getRandomResponse('noData');
        }

        let targetLottery = LOTTERIES.find(l => 
          lowerMsg.includes(l.id) || lowerMsg.includes(l.name.toLowerCase())
        ) || LOTTERIES[0];

        // Use new algorithm with variable probabilities and learned weights
        const predictions = getExplosivePredictions(targetLottery.id, history, today, 5);

        let response = `${getRandomExpression()} ¡Pronósticos para **${targetLottery.name}**!\n\n`;
        response += `🎯 **TOP 5 (Probabilidades 35-98%):**\n`;
        
        predictions.forEach((p, i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📍';
          const boostIcon = p.learnedBoost > 3 ? '📈' : p.learnedBoost < -3 ? '📉' : '';
          response += `${emoji} **${p.code}** - ${p.name} ${p.statusEmoji} (${p.probability}%) ${boostIcon}\n`;
        });

        // Show overdue numbers
        const overdue = predictions.filter(p => p.daysSince > 5);
        if (overdue.length > 0) {
          response += `\n⚠️ **VENCIDOS:** ${overdue.slice(0, 3).map(p => `${p.code} (${p.daysSince}d)`).join(', ')}\n`;
        }

        response += `\n💡 Análisis basado en ${history.length} resultados desde ${LEARNING_START_DATE}`;
        response += `\n🧠 Pesos aprendidos aplicados`;
        response += `\n\n${getRandomTip()}`;

        return response;
      }

      // Specific hour
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
        response += `\n💡 Porcentajes con pesos aprendidos del historial completo`;
        return response;
      }

      // Specific animal (extended to 99)
      const maxAnimalNumber = lowerMsg.includes('guacharito') ? 99 : lowerMsg.includes('guacharo') ? 75 : 36;
      const animal = Array.from({ length: maxAnimalNumber + 1 }, (_, i) => i.toString()).find(code => {
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
          
          response += `📊 **Estadísticas (desde ${LEARNING_START_DATE}):**\n`;
          response += `• Apariciones: ${animalHistory.length} veces\n`;
          response += `• Último: hace ${daysSince} día(s)\n`;
        }

        // Add successors info
        const successors = getPredictedSuccessors(animal, history, 'lotto_activo', 3);
        if (successors.length > 0) {
          response += `\n🔄 **Después del ${animal} suele salir:**\n`;
          successors.forEach(s => {
            response += `• ${s.code} - ${s.name} (${s.probability}%)\n`;
          });
        }

        return response;
      }

      // Help
      if (lowerMsg.match(/ayuda|help|comandos/)) {
        return `${getRandomExpression()} ¡Aquí está lo que puedo hacer!\n\n` +
          `🎯 **Pronósticos:** "Dame pronóstico para Lotto Activo"\n` +
          `⏰ **Por hora:** "¿Qué sale a las 10 AM?"\n` +
          `🐾 **Animales:** "Cuéntame del Tigre"\n` +
          `📊 **Matriz:** "Matriz de secuencia Guacharito"\n` +
          `🔄 **Sucesores:** "¿Qué sale después del 10?"\n` +
          `📊 **Análisis:** "Análisis completo"\n` +
          `🌍 **General:** ¡Pregúntame lo que sea!\n\n` +
          `💡 Uso probabilidades variables (35-98%) con pesos aprendidos\n` +
          `🧠 Memoria persistente desde ${LEARNING_START_DATE}\n` +
          `📋 Animales: 0-36 (Lotto), 0-75 (Guácharo), 0-99 (Guacharito)`;
      }

      // Complete analysis
      if (lowerMsg.match(/análisis|estadísticas|reporte|completo/)) {
        if (history.length < 10) return getRandomResponse('noData');

        let response = `${getRandomExpression()} ¡Análisis completo del día!\n\n`;
        response += `📊 **Base de datos:** ${history.length} resultados desde ${LEARNING_START_DATE}\n\n`;
        
        for (const lottery of LOTTERIES.slice(0, 3)) {
          const preds = getExplosivePredictions(lottery.id, history, today, 3);
          response += `**${lottery.name}**\n`;
          response += `🔥 Top: ${preds.map(p => `${p.code}(${p.probability}%)`).join(', ')}\n\n`;
        }

        response += `💡 **Tip:** ${getRandomTip()}`;
        return response;
      }
    }

    // General AI with contextual memory
    return await callGeneralAI(userMessage);
  }, [isAdmin, history, today, isLotteryRelated, callGeneralAI, memoryContext]);

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

  // Clear chat (for admin)
  const clearChat = useCallback(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: getRandomResponse('greeting'),
      timestamp: new Date()
    }]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    Ricardo Bot
                    {isAdmin && <Lock className="w-3 h-3 text-amber-300" />}
                  </h3>
                  <p className="text-xs opacity-80">Loterías + Deportes • Breve y Ejecutivo</p>
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  Limpiar
                </Button>
              )}
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
              🧠 Memoria persistente • Loterías + Deportes • Sin fórmulas
            </p>
          </div>
        </div>
      )}
    </>
  );
}
