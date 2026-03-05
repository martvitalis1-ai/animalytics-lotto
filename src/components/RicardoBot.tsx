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

  const generarRespuestaMaestra = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);
    
    try {
      // 1. EXTRAEMOS LA DATA DEL BÚNKER (SUPABASE)
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');

      // 2. DETECCIÓN DE LOTERÍA EN LA PREGUNTA
      let target = '';
      if (msg.includes('guacharito')) target = 'guacharito';
      else if (msg.includes('guacharo')) target = 'guacharo';
      else if (msg.includes('activo')) target = 'lotto_activo';
      else if (msg.includes('granjita')) target = 'granjita';
      else if (msg.includes('selva')) target = 'selva_plus';
      else if (msg.includes('rey')) target = 'lotto_rey';

      // 3. RESPUESTA HÍBRIDA
      let saludo = "¡Epa jefe! Ricardo IA en línea. Metiéndole malicia a los datos... 💰🏁\n\n";

      // Si pide lotería específica
      if (target && pronosticos) {
        const d = pronosticos.find(p => p.lottery_type === target);
        if (d) {
          return `${saludo}📊 *REPORTE ${d.lottery_type.toUpperCase()}*:\n🎯 Traspaso: ${formatAnimal(d.v_traspaso)}\n🚀 Digital: ${formatAnimal(d.v_digital)}\n🚜 Arrastre: ${formatAnimal(d.v_arrastre)}\n🌓 Espejo: ${formatAnimal(d.v_espejo)}\n\n¡Cobra seguro mi pana! 💰`;
        }
      }

      // Si pide fijos o números general
      if (msg.includes('fijo') || msg.includes('numero') || msg.includes('gusta') || msg.includes('dia')) {
        if (pronosticos && pronosticos.length > 0) {
          let res = `${saludo}🔥 *MIS FIJOS RECOMENDADOS*:\n`;
          pronosticos.slice(0, 3).forEach(l => {
            res += `📍 ${l.lottery_type.toUpperCase()}: ${getAnimalEmoji(l.v_traspaso)} y ${getAnimalEmoji(l.v_digital)}\n`;
          });
          return res + "\n¡Mucha fe y mente fría! 🍀";
        }
      }

      // Respuesta humana (IA)
      if (msg.includes('hola') || msg.includes('quien eres')) {
        return "¡Qué pasó mi pana! Soy Ricardo IA, el analista jefe del búnker. Mi trabajo es masticar los datos de Supabase para que tú solo tengas que cobrar. ¿Qué lotería quieres que analicemos hoy? 🦜📊";
      }

      return "¡Epa! No te capté bien. ¿Quieres que te de los fijos de alguna lotería o mis favoritos del día? Pregúntame con malicia. 💰🏁";

    } catch (err) {
      return "¡Coño mi pana! Se me cruzaron los cables con Supabase. Intenta otra vez en un ratico. 🍀";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }]);
    setInput('');
    const respuesta = await generarRespuestaMaestra(userText);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: respuesta, timestamp: new Date() }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 via-red-600 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40 group">
        {isOpen ? <X className="text-white w-6 h-6" /> : <div className="relative"><Bot className="w-7 h-7 text-white" /><Zap className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-bounce" /></div>}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[340px] h-[480px] bg-card border-2 border-primary/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-4 text-white font-black italic flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs"><Sparkles size={16} /> RICARDO IA v3.0</div>
            <X className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsOpen(false)} />
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/10 text-left" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-2xl text-[11px] font-bold">👋 ¡Epa jefe! El búnker está sincronizado. Pregúntame qué animal sale en tu lotería favorita. 💰🏁</div>}
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
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué quieres saber?" className="bg-muted/50 font-bold text-xs h-10 rounded-2xl" />
            <Button type="submit" size="icon" className="h-10 w-10 bg-green-600 rounded-2xl"><Send className="w-4 h-4 text-white" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
