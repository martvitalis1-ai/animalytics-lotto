import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; };

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

  const responder = async (msg: string) => {
    const text = msg.toLowerCase();
    setIsLoading(true);
    try {
      if (!text.includes('sale') && !text.includes('lotto') && !text.includes('fijo') && !text.includes('animal')) {
        if (text.includes('hola')) return "¡Epa jefe! ¿Cómo está la malicia hoy? Soy Ricardo IA, listo para los datos.";
        return "Pregúntame por los fijos o analicemos una lotería. ¡Hoy se cobra! 💰";
      }

      const { data: d } = await supabase.from('super_pronostico_final').select('*').limit(1).maybeSingle();
      if (d) {
        return `🔥 *BÚNKER INFORMA (${d.lottery_type.toUpperCase()})* 🔥\n\n🎯 Traspaso: ${formatAnimal(d.v_traspaso)}\n🚀 Digital: ${formatAnimal(d.v_digital)}\n🌓 Espejo: ${formatAnimal(d.v_espejo)}\n\n¡Malicia pura! 💰🏁`;
      }
      return "¡Epa! No tengo los fijos frescos ahorita. Revisa las matrices.";
    } catch {
      return "Se me cruzaron los cables. Pregúntame otra vez chamo.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }]);
    setInput('');
    const resp = await responder(userText);
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: resp, timestamp: new Date() }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-green-600 flex items-center justify-center shadow-xl border-2 border-white/20">
        {isOpen ? <X className="text-white w-5 h-5" /> : <Bot className="text-white w-6 h-6 animate-pulse" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[320px] h-[450px] bg-card border-2 border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-3 text-white font-black flex justify-between text-xs italic">
            <span><Sparkles className="inline w-3 h-3 mr-1" />RICARDO IA v2.0</span>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-3 bg-muted/5" ref={scrollRef}>
            <div className="space-y-3">
              {messages.length === 0 && <div className="p-2 rounded bg-primary/10 border-l-4 border-primary text-[10px] font-bold italic">¡Epa mi pana! El búnker está activo. ¿Qué quieres saber? 🍀</div>}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2 rounded-xl text-[11px] ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card border-2 font-bold'}`}>
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2 border-t flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué sale?" className="h-8 text-[10px] font-bold" />
            <Button type="submit" size="icon" className="h-8 w-8"><Send className="w-3 h-3" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
