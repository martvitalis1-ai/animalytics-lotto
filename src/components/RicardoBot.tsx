import { useState, useRef, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const getAnimalFullInfo = async (num: string) => {
    if (!num || num === '--' || num === 'undefined') return "-- Animal";
    const { data } = await supabase.from('animales_maestro').select('nombre, emoji').eq('num', num.padStart(2, '0')).maybeSingle();
    return data ? `${num.padStart(2, '0')} ${data.nombre} ${data.emoji}` : `${num} Animal`;
  };

  const generarRespuestaRicardo = async (userMsg: string) => {
    try {
      const msg = userMsg.toLowerCase();
      const numMatch = msg.match(/\d+/); // Buscamos si pusiste un número (ej: 11)
      
      // --- LÓGICA 1: PREGUNTA POR UN ANIMAL ESPECÍFICO (JALADERA) ---
      if (numMatch) {
        const numero = numMatch[0].padStart(2, '0');
        const { data: jaladeras } = await supabase
          .from('matriz_secuencia_fija')
          .select('animal_siguiente, veces_repetido, probabilidad_secuencia')
          .eq('animal_sale', numero)
          .order('veces_repetido', { ascending: false })
          .limit(3);

        if (jaladeras && jaladeras.length > 0) {
          let r = `¡Epa mi pana! Analizando mi búnker, veo que después del *${numero}*, el banquero suele soltar estos:\n\n`;
          for (const j of jaladeras) {
            const info = await getAnimalFullInfo(j.animal_siguiente);
            r += `🎯 *${info}* - Fuerza: ${j.probabilidad_secuencia}%\n`;
          }
          r += `\nEste patrón se ha repetido ${jaladeras[0].veces_repetido} veces desde enero. ¡Mándale plomo! 💰`;
          return r;
        } else {
          return `Chamo, el número ${numero} está medio frío en mi historia reciente. Mejor guíate por el Reporte de Traspaso que te mandé arriba. 🕵️‍♂️`;
        }
      }

      // --- LÓGICA 2: REPORTE GENERAL (Si no hay número en la pregunta) ---
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');
      if (!pronosticos || pronosticos.length === 0) return "¡Coño jefe! Se me cayó la señal del búnker. Intenta en un minuto. 🍀";

      let respuesta = "¡Epa mi pana! Aquí te tengo la malicia pura del *REPORTE DE TRASPASO*. Activo ahí: \n\n";
      for (const l of pronosticos) {
        const lotName = (l.lottery_type || 'Lotería').replace('_', ' ').toUpperCase();
        const infoArra = await getAnimalFullInfo(l.v_arrastre);
        const infoEscu = await getAnimalFullInfo(l.v_escuadra);
        const infoRest = await getAnimalFullInfo(l.v_resta);

        respuesta += `🏛 *${lotName}*\n🚜 Arrastre: ${infoArra}\n📐 Escuadra: ${infoEscu}\n❌ Cruzada: ${infoRest}\n------------------\n`;
      }
      return respuesta + "\n¡Activo que hoy se cobra! 💰🏁";

    } catch (err) {
      return "¡Epa chamo! Se me cruzaron los cables. Vuelve a preguntarme con fe. 🍀";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    const respuesta = await generarRespuestaRicardo(userText);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: respuesta, timestamp: new Date() }]);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/20">
        {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="w-8 h-8 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-600 p-4 text-white font-black italic flex items-center justify-between">
            <div className="flex items-center gap-2"><Bot size={20} /> RICARDO IA - EL BÚNKER 🕵️‍♂️</div>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-card border-l-4 border-orange-500 p-3 rounded text-sm font-bold shadow-sm">¡Epa jefe! El búnker está activo. Pregúntame qué animal sale después del 10 o mira el Reporte. 💰🏁</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-card border font-bold rounded-bl-none'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-4" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué animal sale después del 11?" className="bg-muted/50 font-bold" />
            <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700 shrink-0"><Send className="w-4 h-4 text-white" /></Button>
          </form>
        </div>
      )}
    </>
  );
}
