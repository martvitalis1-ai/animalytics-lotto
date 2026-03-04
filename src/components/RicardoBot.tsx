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
      const numMatch = msg.match(/\d+/);
      
      if (numMatch) {
        const numero = numMatch[0].padStart(2, '0');
        let loteriaFiltro = 'lotto_activo';
        if (msg.includes('granjita')) loteriaFiltro = 'granjita';
        else if (msg.includes('guacharo')) loteriaFiltro = 'guacharo';
        else if (msg.includes('guacharito')) loteriaFiltro = 'guacharito';

        const { data: jaladeras } = await supabase
          .from('matriz_secuencia_fija')
          .select('animal_siguiente, veces_repetido, probabilidad_secuencia')
          .eq('animal_sale', numero)
          .eq('lottery_type', loteriaFiltro)
          .order('veces_repetido', { ascending: false }).limit(3);

        if (jaladeras && jaladeras.length > 0) {
          let r = `¡Epa mi pana! Analizando el búnker para *${loteriaFiltro.replace('_',' ').toUpperCase()}*, después del *${numero}* vienen estos:\n\n`;
          for (const j of jaladeras) {
            r += `🎯 *${await getAnimalFullInfo(j.animal_siguiente)}* - Fuerza: ${j.probabilidad_secuencia}%\n`;
          }
          return r + `\n¡Mándale plomo con fe! 💰`;
        }
      }

      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');
      if (!pronosticos) return "¡Coño jefe! Se me cayó la señal. Intenta en un minuto. 🍀";

      let loteriaEspecifica = '';
      if (msg.includes('activo')) loteriaEspecifica = 'lotto_activo';
      else if (msg.includes('granjita')) loteriaEspecifica = 'granjita';
      else if (msg.includes('guacharo')) loteriaEspecifica = 'guacharo';
      else if (msg.includes('guacharito')) loteriaEspecifica = 'guacharito';

      let filtrados = loteriaEspecifica ? pronosticos.filter(p => p.lottery_type === loteriaEspecifica) : pronosticos;
      let respuesta = `¡Epa mi pana! Aquí te tengo la malicia pura del *REPORTE DE TRASPASO*:\n\n`;
      
      for (const l of filtrados) {
        respuesta += `🏛 *${l.lottery_type.replace('_',' ').toUpperCase()}*\n`;
        respuesta += `🚜 Arrastre: ${await getAnimalFullInfo(l.v_arrastre)}\n`;
        respuesta += `📐 Escuadra: ${await getAnimalFullInfo(l.v_escuadra)}\n`;
        respuesta += `❌ Cruzada: ${await getAnimalFullInfo(l.v_resta)}\n`;
        respuesta += `------------------\n`;
      }
      return respuesta + "\n¡Hoy se cobra! 💰🏁";
    } catch (err) { return "¡Epa chamo! Se me cruzaron los cables. Vuelve a preguntarme. 🍀"; }
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
    }, 600);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/20">
        {isOpen ? <X className="text-white w-5 h-5" /> : <Bot className="w-6 h-6 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-[330px] h-[420px] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-600 p-3 text-white font-black italic flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs"><Bot size={16} /> RICARDO IA - EL BÚNKER</div>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-3 bg-muted/10" ref={scrollRef}>
            <div className="space-y-3">
              {messages.length === 0 && <div className="bg-card border-l-4 border-orange-500 p-2 rounded text-[10px] font-bold shadow-sm">¡Epa jefe! Pregúntame qué jala un número o pide el 'reporte'. 💰🏁</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2 rounded-xl text-[11px] shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-card border font-bold'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-4" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué sale?" className="bg-muted/50 font-bold text-[10px] h-7" />
            <Button type="submit" size="icon" className="bg-green-600 h-7 w-7"><Send className="w-3 h-3 text-white" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
