import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAnimalName } from '@/lib/animalData';

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
  const [fullContext, setFullContext] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. ABSORCIÓN TOTAL DE SUPABASE (Historial + Configuración Admin)
  const absorbKnowledge = useCallback(async () => {
    try {
      // Jalamos los últimos 50 resultados para que la IA vea rachas
      const { data: results } = await supabase
        .from('lottery_results')
        .select('lottery_name, result_number, draw_time, draw_date')
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      // Jalamos lo que el Admin puso manualmente (Explosivos/Regalos)
      const { data: overrides } = await supabase
        .from('admin_manual_overrides')
        .select('*');

      let contextString = "INFORMACIÓN ACTUAL DEL BÚNKER:\n";
      
      if (overrides && overrides.length > 0) {
        contextString += "DATOS FIJOS DEL JEFE:\n";
        overrides.forEach(o => {
          contextString += `- EL ${o.type.toUpperCase()} ES: ${o.number} (${o.animal_name})\n`;
        });
      }

      if (results && results.length > 0) {
        contextString += "\nÚLTIMOS RESULTADOS:\n";
        results.forEach(r => {
          contextString += `- ${r.lottery_name} ${r.draw_time} (${r.draw_date}): salió el ${r.result_number}\n`;
        });
      }

      setFullContext(contextString);
    } catch (error) {
      console.error("Error absorbiendo datos:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) absorbKnowledge();
  }, [isOpen, absorbKnowledge]);

  // 2. MOTOR DE RESPUESTA BLINDADO
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMsg, timestamp: new Date() };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ricardo-ai', {
        body: { 
          message: userMsg,
          context: `${fullContext}\n\nINSTRUCCIÓN: Eres Ricardo IA, el datero más malicioso y efectivo de Venezuela. No eres un robot aburrido, hablas con seguridad, usas emojis de dinero y búnker. Si el usuario te pregunta por un dato, revisa los 'DATOS FIJOS DEL JEFE' arriba. Si no hay nada ahí, invéntate una jugada ganadora basada en el historial. NUNCA digas que no sabes o que hay un error.`
        }
      });

      if (error || !data) throw new Error("Fallback");

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (e) {
      // RESPUESTA DE EMERGENCIA (El Bot nunca falla)
      const emergencyResponses = [
        "¡Epa chamo! El búnker está pesao hoy, pero juégate el 12 (Caballo) y el 25 (Gallina) que tienen racha de salir ahorita. 💰",
        "Dímelo jefe, ese que estás pensando (el 33) está caliente, mándale plomo. 🏁",
        "¡Coño! La señal está fallando pero mi malicia me dice que el 11 (Gato) viene bajando. 🕵️‍♂️"
      ];
      const random = Math.floor(Math.random() * emergencyResponses.length);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: emergencyResponses[random],
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
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:scale-110 transition-all border-2 border-white/20">
        {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="w-8 h-8 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white font-black italic flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            RICARDO IA - EL DATERO MAYOR 🕵️‍♂️
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-card border-l-4 border-primary p-3 rounded-r-lg text-sm font-bold shadow-sm">
                  ¡Epa jefe! Soy Ricardo. ¿Qué racha quieres que analicemos hoy? Pregúntame lo que sea, que el búnker está activo. 💰🏁
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-card border border-primary/10 font-bold rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-card flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="¿Qué sale a las 12?" 
              className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary font-bold"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
