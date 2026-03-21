import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2, Sparkles, Zap } from "lucide-react";
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; };

export function RicardoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatAnimal = (num: string) => {
    if (!num || num === '--' || num === '0') return "Analizando...";
    return `[${num}] ${getAnimalName(num)} ${getAnimalEmoji(num)}`;
  };

  const generarRespuesta = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);
    try {
      const { data: pronosticos } = await (supabase.from as any)('super_pronostico_final').select('*');
      let target = '';
      if (msg.includes('guacharito')) target = 'guacharito';
      else if (msg.includes('guacharo')) target = 'guacharo';
      else if (msg.includes('activo')) target = 'lotto_activo';
      else if (msg.includes('granjita')) target = 'granjita';

      let saludo = "¡Epa jefe! Ricardo IA en el búnker... 💰🏁\n\n";

      if (target && pronosticos) {
        const d = pronosticos.find((p: any) => p.lottery_type === target);
        if (d) {
          return `${saludo}📊 *REPORTE ${(d as any).lottery_type.toUpperCase()}*:\n🎯 Traspaso: ${formatAnimal((d as any).v_traspaso)}\n🚀 Digital: ${formatAnimal((d as any).v_digital)}\n🌓 Espejo: ${formatAnimal((d as any).v_espejo)}\n\n¡Cobra seguro! 💰`;
        }
      }

      if (msg.includes('hola') || msg.includes('quien eres')) {
        return "¡Qué pasó mi pana! Soy Ricardo IA, el analista del búnker. Pídeme fijos de cualquier lotería y yo consulto Supabase por ti. 🦜📊";
      }

      return "Dime una lotería o pídeme los fijos para analizar los datos. 💰🏁";
    } catch (err) {
      return "Se me cruzaron los cables. Intenta de nuevo jefe. 🍀";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }]);
    setInput('');
    const resp = await generarRespuesta(text);
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: resp, timestamp: new Date() }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40 group">
        {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="text-white w-7 h-7 animate-pulse" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[340px] h-[480px] bg-card border-2 border-primary/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-4 text-white font-black italic flex items-center justify-between">
            <span className="text-xs">RICARDO IA v3.0</span>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/10 text-left" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-primary/10 p-3 rounded-xl text-[11px] font-bold">👋 ¡Epa jefe! Pregúntame qué sale en Guacharo o cualquier otra. 💰</div>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card border-2 font-bold'}`}>
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué quieres saber?" className="bg-muted/50 font-bold text-xs h-10 rounded-2xl" />
            <Button type="submit" size="icon" className="h-10 w-10 bg-green-600 rounded-2xl"><Send className="w-4 h-4 text-white" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
