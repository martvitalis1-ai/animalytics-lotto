import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2 } from "lucide-react";

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
  const [contextoReal, setContextoReal] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🕵️ ABSORCIÓN DE CONOCIMIENTO (Lee Supabase para que Ricardo no invente)
  const absorbKnowledge = useCallback(async () => {
    try {
      const [pronosticos, similitud, manuales] = await Promise.all([
        supabase.from('super_pronostico_final').select('*'),
        supabase.from('reporte_similitud_semanal').select('*'),
        supabase.from('dato_ricardo_predictions').select('*').eq('prediction_date', new Date().toISOString().split('T')[0])
      ]);

      let ctx = "DATOS REALES DEL BÚNKER:\n";
      pronosticos.data?.forEach(l => {
        ctx += `- ${l.lottery_type}: Arrastre ${l.v_arrastre}, Escuadra ${l.v_escuadra}, Cruzada ${l.v_resta}. Score: ${l.power_score}\n`;
      });
      similitud.data?.forEach(s => {
        ctx += `- Similitud en ${s.Lotería}: ${s.Similitud}\n`;
      });
      setContextoReal(ctx);
    } catch (e) { console.error("Error absorbiendo:", e); }
  }, []);

  useEffect(() => { if (isOpen) absorbKnowledge(); }, [isOpen, absorbKnowledge]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim().toLowerCase();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. INTENTAMOS LLAMAR A LA IA (Lovable Function)
      const { data, error } = await supabase.functions.invoke('ricardo-ai', {
        body: { message: userMsg, context: contextoReal }
      });

      if (error || !data) throw new Error("Sin créditos");

      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: data.response, timestamp: new Date() }]);
    } catch (e) {
      // 2. FALLBACK: INTELIGENCIA DE CALLE (Si no hay créditos)
      let respuestaDeEmergencia = "¡Epa mi pana! El satélite del búnker está fallando, pero aquí tengo mis papeles a la mano. ";
      
      if (userMsg.includes("que sale") || userMsg.includes("dato") || userMsg.includes("fijo")) {
        respuestaDeEmergencia += "Mira chamo, las matrices están así:\n\n" + contextoReal + "\n¡Mándale plomo a los de mayor Score! 💰";
      } else if (userMsg.includes("hola") || userMsg.includes("saludos")) {
        respuestaDeEmergencia += "¡Epa chamo! Activo aquí analizando la jugada. ¿Qué lotería quieres que te desglose? 🕵️‍♂️";
      } else {
        respuestaDeEmergencia += "Chamo, no te entendí muy bien por la interferencia, pero lo que está caliente ahorita son los datos por Arrastre y Escuadra que ves en pantalla. ¡Activo! 🏁";
      }

      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: respuestaDeEmergencia, timestamp: new Date() }]);
    }
    setIsLoading(false);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/20">
        {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="w-8 h-8 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-600 p-4 text-white font-black italic flex justify-between items-center">
            <span>RICARDO IA - EL BÚNKER 🕵️‍♂️</span>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-card border-l-4 border-orange-500 p-3 rounded text-sm font-bold shadow-sm">¡Epa jefe! El búnker está activo. Pregúntame qué animal va a salir o qué racha veo. ¡Plomo! 💰🏁</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-card border font-bold shadow-sm'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-4" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué animal sale ahorita?" className="bg-muted/50 font-bold" />
            <Button type="submit" size="icon" className="bg-green-600 text-white"><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      )}
    </>
  );
}
