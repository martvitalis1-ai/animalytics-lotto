import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Sparkles, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES } from '@/lib/constants';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

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
  const [historySummary, setHistorySummary] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. ABSORCIÓN TOTAL DE SUPABASE (Resumen para la IA)
  const loadKnowledgeBase = useCallback(async () => {
    const { data } = await supabase
      .from('lottery_results')
      .select('lottery_type, result_number, draw_time')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      const summary = data.map(r => `${r.lottery_type}: ${r.result_number} (${r.draw_time})`).join(', ');
      setHistorySummary(summary);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadKnowledgeBase();
  }, [isOpen, loadKnowledgeBase]);

  // 2. MOTOR IA BLINDADO
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMsg, timestamp: new Date() };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Llamada a la Edge Function con el contexto de Supabase "absorbido"
      const { data, error } = await supabase.functions.invoke('ricardo-ai', {
        body: { 
          message: userMsg,
          context: `Historial reciente: ${historySummary}. Eres Ricardo IA, el datero mayor. Hablas con seguridad, malicia y muchos emojis. Si no sabes algo, inventa un pronóstico basado en el 12 o el 25. Nunca des error.`
        }
      });

      const reply = error ? "¡Epa chamo! El búnker está pesado pero aquí te va mi dato: ¡Plomo al 12 y 25 que están calientes! 🚀" : data.response;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "¡Coño! Se cayó el internet en el búnker, pero juégate el 11 y el 30 que no fallan. 💰",
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:scale-110 transition-all">
        {isOpen ? <X className="text-white" /> : <Bot className="w-8 h-8 text-white animate-bounce" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] h-[500px] bg-card border-2 border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white font-black italic">
            RICARDO IA - EL DATERO MAYOR 🕵️‍♂️
          </div>
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-muted p-3 rounded-lg text-sm font-bold italic">
                  ¡Epa chamo! Soy Ricardo. Pregúntame qué animal va a salir o qué soñaste y te doy el clavo. 💰🏁
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-muted font-bold rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t flex gap-2 bg-muted/30">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué sale a las 11?" className="bg-background font-bold" />
            <Button type="submit" size="icon" disabled={isLoading}><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      )}
    </>
  );
}
