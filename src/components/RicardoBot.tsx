import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User, Loader2 } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Función para construir la respuesta de Ricardo basada en datos reales
  const generarRespuestaRicardo = async () => {
    try {
      const { data: pronosticos, error } = await supabase
        .from('super_pronostico_final')
        .select('*');

      if (error || !pronosticos || pronosticos.length === 0) {
        return "¡Coño jefe! No consigo los papeles en el búnker ahorita. Intenta en un minuto que estoy barajando los datos. 🕵️‍♂️";
      }

      let respuesta = "¡Epa mi pana! Aquí te tengo la malicia pura para los próximos sorteos. Activo ahí: \n\n";

      pronosticos.forEach(l => {
        const lotName = l.lottery_type.replace('_', ' ').toUpperCase();
        respuesta += `🏛 *${lotName}*\n`;
        respuesta += `🚜 Arrastre: ${l.pronostico_dia}\n`;
        respuesta += `📐 Escuadra: ${l.pronostico_jaladera}\n`;
        respuesta += `❌ Cruzada: ${l.pronostico_fijo}\n`;
        if (l.power_score >= 90) respuesta += `🔥 *DATO DE TAQUILLA (Score: ${l.power_score})*\n`;
        respuesta += `------------------\n`;
      });

      respuesta += "\n¡Mándale plomo con fe que hoy se cobra! 💰🍀";
      return respuesta;

    } catch (err) {
      return "¡Epa chamo! Se me cruzaron los cables en el búnker. Dame un chance y vuelve a preguntarme. 🍀";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMsg, timestamp: new Date() };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    // OMITIMOS EL INVOKE (IA) Y USAMOS NUESTRA LÓGICA LOCAL
    const respuestaDatera = await generarRespuestaRicardo();

    // Simulamos un pequeño retraso para que parezca que Ricardo está "pensando"
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: respuestaDatera,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1000);
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
            RICARDO IA - EL BÚNKER DATERO 🕵️‍♂️
          </div>

          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-card border-l-4 border-primary p-3 rounded-r-lg text-sm font-bold shadow-sm">
                  ¡Epa jefe! El búnker está activo. Pregúntame qué animal va a salir. ¡Plomo! 💰🏁
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-card border border-primary/10 font-bold rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
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
              placeholder="¿Qué animal sale ahorita?"
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
