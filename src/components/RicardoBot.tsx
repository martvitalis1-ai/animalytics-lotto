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
    if (!num || num === '--' || num === '0') return "Calculando...";
    return `[${num}] ${getAnimalName(num)} ${getAnimalEmoji(num)}`;
  };

  const generarRespuestaInteligente = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);
    
    try {
      // 1. CONSULTA MAESTRA A SUPABASE
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');

      // 2. DETECCIÓN DE LOTERÍA ESPECÍFICA
      let loteriaClave = '';
      if (msg.includes('guacharito')) loteriaClave = 'guacharito';
      else if (msg.includes('guacharo')) loteriaClave = 'guacharo';
      else if (msg.includes('activo')) loteriaClave = 'lotto_activo';
      else if (msg.includes('granjita')) loteriaClave = 'granjita';
      else if (msg.includes('selva')) loteriaClave = 'selva_plus';
      else if (msg.includes('rey')) loteriaClave = 'lotto_rey';

      // 3. LÓGICA DE RESPUESTA
      let saludo = "¡Epa mi pana! Aquí Ricardo IA reportándose desde el búnker. 💰🏁\n\n";
      
      // Caso A: Pide una lotería específica
      if (loteriaClave && pronosticos) {
        const d = pronosticos.find(p => p.lottery_type === loteriaClave);
        if (d) {
          return `${saludo}🎯 *REPORTE PARA ${d.lottery_type.replace('_',' ').toUpperCase()}*:\n\n🔥 Traspaso: ${formatAnimal(d.v_traspaso)}\n🚀 Digital: ${formatAnimal(d.v_digital)}\n🌓 Espejo: ${formatAnimal(d.v_espejo)}\n🚜 Arrastre: ${formatAnimal(d.v_arrastre)}\n\n¡Echale malicia que hoy se cobra! 💰🏁`;
        }
      }

      // Caso B: Pide números para "todo el día" o general
      if (msg.includes('todo el dia') || msg.includes('numeros') || msg.includes('fijos') || msg.includes('gusta')) {
        if (pronosticos && pronosticos.length > 0) {
          let resumen = `${saludo}📊 *MIS FIJOS PARA TODO EL DÍA*:\n\n`;
          // Tomamos las 3 primeras loterías para no hacer el mensaje eterno
          pronosticos.slice(0, 3).forEach(l => {
            resumen += `🏛 *${l.lottery_type.replace('_',' ').toUpperCase()}*:\n👉 ${formatAnimal(l.v_traspaso)} y ${formatAnimal(l.v_digital)}\n\n`;
          });
          return resumen + "¡Mucha fe y mente fría! 🍀";
        }
      }

      // Caso C: Charla normal
      if (msg.includes('hola') || msg.includes('quien eres')) {
        return "¡Qué pasó jefe! Soy Ricardo IA, el analista del búnker. Pregúntame qué animal sale para cualquier lotería o pídeme los fijos del día y yo tiro la minería de datos en Supabase por ti. 🦜📊";
      }

      return "¡Epa chamo! No te entendí bien. ¿Quieres los datos de alguna lotería o mis favoritos para todo el día? Pregúntame con confianza. 💰🏁";

    } catch (err) {
      return "¡Coño mi pana! Se me cayó el sistema en el búnker. Dame un minuto mientras reconecto con Supabase. 🍀";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }]);
    setInput('');
    const respuesta = await generarRespuestaInteligente(userText);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: respuesta, timestamp: new Date() }]);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 via-red-600 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40 group">
        {isOpen ? <X className="text-white w-6 h-6" /> : <div className="relative"><Bot className="w-7 h-7 text-white" /><Zap className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-bounce" /></div>}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] h-[500px] bg-card border-2 border-primary/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={20} className="animate-pulse" /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Sincronizado con Supabase</p>
                <p className="text-sm font-black italic tracking-tighter">RICARDO IA HÍBRIDO v3.0</p>
              </div>
            </div>
            <X className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsOpen(false)} />
          </div>

          <ScrollArea className="flex-1 p-4 bg-muted/5" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-3xl text-[11px] font-bold shadow-inner text-left">
                  👋 ¡Epa jefe! Ya me puse las pilas. Soy Híbrido: puedo charlar contigo o analizar los datos del búnker. <br/><br/>
                  💡 *Prueba preguntando:* <br/>
                  - "¿Qué sale en Guacharo?"<br/>
                  - "¿Qué números te gustan para todo el día?"<br/>
                  - "¿Quién eres tú?"
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] shadow-md leading-relaxed text-left ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border-2 border-muted font-bold rounded-tl-none'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-primary font-black italic text-[10px] animate-pulse ml-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> ANALIZANDO TENDENCIAS...
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-muted/20 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Dime una lotería o pide los fijos..." className="bg-background border-2 border-primary/20 font-bold text-xs h-10 rounded-2xl" />
            <Button type="submit" size="icon" className="h-10 w-10 rounded-2xl shadow-lg"><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
