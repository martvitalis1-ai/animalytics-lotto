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

  // 1. ABSORCIÓN TOTAL (Historial + Explosivos + Pronósticos Ricardo)
  const absorbKnowledge = useCallback(async () => {
    try {
      console.log("🕵️ Ricardo IA absorbiendo el búnker...");
      
      const today = new Date().toISOString().split('T')[0];

      // JALAMOS TODO: Resultados, Explosivos y Pronósticos de Ricardo
      const [resultsRes, overridesRes, predictionsRes] = await Promise.all([
        supabase
          .from('lottery_results')
          .select('lottery_type, result_number, draw_time, draw_date')
          .order('draw_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('admin_picks')
          .select('*'),
        supabase
          .from('dato_ricardo_predictions')
          .select('lottery_type, predicted_numbers, draw_time, notes')
          .eq('prediction_date', today)
      ]);

      let contextString = "ESTADO ACTUAL DEL BÚNKER (USA ESTO PARA RESPONDER):\n\n";
      
      // Absorción de Explosivos/Regalos
      if (overridesRes.data && overridesRes.data.length > 0) {
        contextString += "🔥 DATOS FIJOS DEL JEFE (MANDO MANUAL):\n";
        overridesRes.data.forEach((o: any) => {
          contextString += `- ${o.pick_type?.toUpperCase() || 'EXPLOSIVO'}: ${o.animal_code} (${o.animal_name})\n`;
        });
      }

      // Absorción de Pronósticos de Ricardo
      if (predictionsRes.data && predictionsRes.data.length > 0) {
        contextString += "\n📋 PRONÓSTICOS DEL JEFE RICARDO PARA HOY:\n";
        predictionsRes.data.forEach(p => {
          contextString += `- En ${p.lottery_type} para las ${p.draw_time} recomendó: ${p.predicted_numbers.join(', ')}. Nota: ${p.notes || 'Sin nota'}\n`;
        });
      }

      // Absorción de Historial
      if (resultsRes.data && resultsRes.data.length > 0) {
        contextString += "\n📊 ÚLTIMOS SORTEOS (RACHAS):\n";
        resultsRes.data.forEach(r => {
          contextString += `- ${r.lottery_type} | ${r.draw_date} | ${r.draw_time}: salió el ${r.result_number}\n`;
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

  // 2. MOTOR DE RESPUESTA BLINDADO (Try/Catch total)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMsg, timestamp: new Date() };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Intentamos llamar a la IA de Lovable/Edge Function
      const { data, error } = await supabase.functions.invoke('ricardo-ai', {
        body: { 
          message: userMsg,
          context: `${fullContext}\n\nINSTRUCCIÓN CRÍTICA: Eres Ricardo IA, el datero más malicioso de Venezuela. Responde con seguridad, emojis de dinero y búnker. Si te preguntan 'qué sale', revisa los DATOS FIJOS o los PRONÓSTICOS DEL JEFE. Si no hay nada, analiza las RACHAS del historial. NUNCA digas que no sabes. NUNCA des error.`
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
      // RESPUESTA DE EMERGENCIA (Si Supabase o Lovable fallan, el bot sigue vivo)
      const emergencyData = [
        "¡Epa chamo! El búnker está pesado hoy pero mi malicia no falla: juégate el 12 (Caballo) y el 25 (Gallina) que tienen racha de salir ahorita. 💰",
        "Dímelo jefe, el que estás buscando es el 33 (Pescado), está que arde en las matrices. Mándale plomo. 🏁",
        "¡Coño! Se cayó la señal en el búnker, pero mi ojo clínico ve al 11 (Gato) bajando por la racha de los 10. 🕵️‍♂️"
      ];
      const random = Math.floor(Math.random() * emergencyData.length);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: emergencyData[random],
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
            RICARDO IA - EL BÚNKER DATERO 🕵️‍♂️
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-card border-l-4 border-primary p-3 rounded-r-lg text-sm font-bold shadow-sm">
                  ¡Epa jefe! El búnker está activo. Pregúntame qué animal va a salir o qué racha analizo. ¡Plomo! 💰🏁
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
