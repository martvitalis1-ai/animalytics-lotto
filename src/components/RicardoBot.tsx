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
    if (!num || num === '--' || num === '0') return "-- Animal";
    const { data } = await supabase.from('animales_maestro').select('nombre, emoji').eq('num', num.padStart(2, '0')).maybeSingle();
    return data ? `${num.padStart(2, '0')} ${data.nombre} ${data.emoji}` : `${num} Animal`;
  };

  const generarRespuestaRicardo = async (userMsg: string) => {
    try {
      const msg = userMsg.toLowerCase();
      const numMatch = msg.match(/\d+/);
      
      // --- LÓGICA 1: PREGUNTA POR NÚMERO (JALADERA) ---
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
          .order('veces_repetido', { ascending: false })
          .limit(3);

        if (jaladeras && jaladeras.length > 0) {
          let r = `¡Epa mi pana! Analizando el búnker para *${loteriaFiltro.replace('_',' ').toUpperCase()}*, después del *${numero}* vienen estos:\n\n`;
          for (const j of jaladeras) {
            const info = await getAnimalFullInfo(j.animal_siguiente);
            r += `🎯 *${info}* - Fuerza: ${j.probabilidad_secuencia}%\n`;
          }
          return r + `\n¡Mándale plomo con fe! 💰`;
        }
      }

      // --- LÓGICA 2: REPORTE DE TRASPASO FILTRADO ---
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');
      if (!pronosticos) return "¡Coño jefe! Se me cayó la señal. Intenta en un minuto. 🍀";

      // Detectamos si el usuario quiere una lotería específica
      let loteriaEspecifica = '';
      if (msg.includes('activo')) loteriaEspecifica = 'lotto_activo';
      else if (msg.includes('granjita')) loteriaEspecifica = 'granjita';
      else if (msg.includes('guacharo')) loteriaEspecifica = 'guacharo';
      else if (msg.includes('guacharito')) loteriaEspecifica = 'guacharito';

      let filtrados = pronosticos;
      if (loteriaEspecifica) {
        filtrados = pronosticos.filter(p => p.lottery_type === loteriaEspecifica);
      }

      let respuesta = `¡Epa mi pana! Aquí te tengo la malicia pura del *REPORTE DE TRASPASO*${loteriaEspecifica ? ' para ' + loteriaEspecifica.toUpperCase() : ''}:\n\n`;
      
      for (const l of filtrados) {
        const lotName = (l.lottery_type || 'Lotería').replace('_', ' ').toUpperCase();
        respuesta += `🏛 *${lotName}*\n`;
        respuesta += `🧬 Traspaso: ${await getAnimalFullInfo(l.v_traspaso)}\n`;
        respuesta += `🔢 Digital: ${await getAnimalFullInfo(l.v_digital)}\n`;
        respuesta += `🚜 Arrastre: ${await getAnimalFullInfo(l.v_arrastre)}\n`;
        respuesta += `🌓 Espejo: ${await getAnimalFullInfo(l.v_espejo)}\n`;
        respuesta += `➕ Suma: ${await getAnimalFullInfo(l.v_suma)}\n`;
        respuesta += `➖ Resta: ${await getAnimalFullInfo(l.v_resta)}\n`;
        respuesta += `------------------\n`;
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
    }, 600);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/20">
        {isOpen ? <X className="text-white w-5 h-5" /> : <Bot className="w-6 h-6 text-white animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[450px] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-orange-600 to-green-600 p-3 text-white font-black italic flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><Bot size={18} /> RICARDO IA - EL BÚNKER 🕵️‍♂️</div>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-3 bg-muted/10" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-card border-l-4 border-orange-500 p-2 rounded text-xs font-bold shadow-sm">¡Epa jefe! Pregúntame qué jala un número o pide el 'reporte'. 💰🏁</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2 rounded-xl text-xs shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-card border font-bold rounded-bl-none'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-4" />}
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2 border-t bg-card flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué animal sale ahorita?" className="bg-muted/50 font-bold text-xs h-8" />
            <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700 shrink-0 h-8 w-8"><Send className="w-3 h-3 text-white" /></Button>
          </form>
        </div>
      )}
    </>
  );
}
