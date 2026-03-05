import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2, Sparkles } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatAnimal = (num: string) => {
    if (!num || num === '--') return "Sin dato";
    return `[${num}] ${getAnimalName(num)} ${getAnimalEmoji(num)}`;
  };

  const generarRespuesta = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);
    try {
      const esLotto = msg.includes('lotto') || msg.includes('granjita') || msg.includes('sale') || msg.includes('fijo');
      
      if (!esLotto) {
        if (msg.includes('hola')) return "¡Epa jefe! ¿Cómo está esa malicia hoy? Soy Ricardo IA, listo para analizar.";
        if (msg.includes('quien eres')) return "Soy el cerebro del Búnker. Analizo datos de Supabase para darte los fijos.";
        return "Esa pregunta es buena, pero mi fuerte son los animalitos. ¿Analizamos alguna lotería?";
      }

      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');
      let filtrado = msg.includes('activo') ? 'lotto_activo' : 'granjita';
      let d = pronosticos?.find(p => p.lottery_type === filtrado) || pronosticos?.[0];

      if (d) {
        return `🎯 *DATOS DEL BÚNKER (${d.lottery_type.toUpperCase()})*\n\n🔥 Traspaso: ${formatAnimal(d.v_traspaso)}\n🚀 Digital: ${formatAnimal(d.v_digital)}\n🌓 Espejo: ${formatAnimal(d.v_espejo)}\n\n¡A cobrar mi pana! 💰🏁`;
      }
      return "¡Epa! No tengo datos frescos en el búnker ahora mismo. Intenta en un ratico.";
    } catch {
      return "Se me cruzaron los cables. Vuelve a preguntarme jefe.";
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
      <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-green-600 flex items-center justify-center shadow-2xl border-2 border-white/20">
        {isOpen ? <X className="text-white w-5 h-5" /> : <Bot className="text-white w-6 h-6" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[320px] h-[420px] bg-card border-2 border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-3 text-white font-black italic flex justify-between text-xs">
            <span>RICARDO IA v2.0</span>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-3 bg-muted/10" ref={scrollRef}>
            <div className="space-y-3">
              {messages.length === 0 && <div className="bg-primary/5 p-2 rounded border-l-4 border-primary text-[10px] font-bold">¡Epa jefe! Pregúntame lo que sea. 💰</div>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2 rounded-xl text-[11px] ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card border font-bold'}`}>
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2 border-t flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué quieres saber?" className="h-8 text-[10px] font-bold" />
            <Button type="submit" size="icon" className="h-8 w-8"><Send className="w-3 h-3" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
