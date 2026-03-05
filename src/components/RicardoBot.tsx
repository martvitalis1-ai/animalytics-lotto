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

  // Función corregida: Ahora usa los datos locales, 100% seguro.
  const formatAnimal = (num: string) => {
    if (!num || num === '--') return "Sin dato";
    const name = getAnimalName(num);
    const emoji = getAnimalEmoji(num);
    return `[${num}] ${name} ${emoji}`;
  };

  const generarRespuestaHibrida = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);

    try {
      // Lógica Híbrida: ¿Pregunta de lotería o charla normal?
      const esLotto = msg.includes('lotto') || msg.includes('granjita') || msg.includes('sale') || msg.includes('fijo');

      if (!esLotto) {
        if (msg.includes('hola')) return "¡Epa mi pana! ¿Cómo está la malicia hoy? Soy Ricardo IA, estoy listo para analizar los números contigo. 💰🏁";
        if (msg.includes('quien eres')) return "Soy el cerebro del Búnker de Animalytics. Analizo patrones históricos en Supabase para darte el dato con más veneno. 🐍";
        return "Esa pregunta está interesante, pero mi especialidad son los animalitos. ¿Quieres que analice alguna lotería por ti? 🦜📊";
      }

      // Consulta a Supabase para los datos reales
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');
      
      let res = `🔥 *REPORTE DEL BÚNKER* 🔥\n\n`;
      let filtro = msg.includes('activo') ? 'lotto_activo' : msg.includes('granjita') ? 'granjita' : '';
      let data = filtro ? pronosticos?.find(p => p.lottery_type === filtro) : pronosticos?.[0];

      if (data) {
        res += `🏛 *${data.lottery_type.toUpperCase()}*\n`;
        res += `🎯 Traspaso: ${formatAnimal(data.v_traspaso)}\n`;
        res += `🚀 Digital: ${formatAnimal(data.v_digital)}\n`;
        res += `🌓 Espejo: ${formatAnimal(data.v_espejo)}\n`;
        res += `------------------\n¡Mucha malicia y a cobrar! 💰`;
      } else {
        res = "¡Epa chamo! No encontré datos frescos ahorita. Revisa las matrices mientras sincronizo el búnker. 🍀";
      }
      return res;
    } catch {
      return "Se me cruzaron los cables con Supabase. Intenta otra vez mi pana. 🍀";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }]);
    setInput('');
    const respuesta = await generarRespuestaHibrida(userText);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: respuesta, timestamp: new Date() }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40">
        {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="w-7 h-7 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[340px] h-[450px] bg-card border-2 border-primary/30 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-4 text-white font-black italic flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs"><Sparkles size={16} /> RICARDO IA v2.0</div>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-xl text-[11px] font-bold">¡Epa jefe! El búnker está activo. Pregúntame lo que quieras o pide un análisis de lotería. 💰🏁</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-muted font-bold'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué quieres saber jefe?" className="bg-muted/50 font-bold text-xs h-10 rounded-xl" />
            <Button type="submit" size="icon" className="h-10 w-10 bg-green-600 rounded-xl"><Send className="w-4 h-4 text-white" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
