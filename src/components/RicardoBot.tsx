import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2, Sparkles, TrendingUp } from "lucide-react";
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

  // Formateador rápido de animal (Sin errores de "Animal")
  const formatAnimal = (num: string) => {
    if (!num || num === '--') return "Sin datos";
    const name = getAnimalName(num);
    const emoji = getAnimalEmoji(num);
    return `[${num}] ${name} ${emoji}`;
  };

  const generarRespuestaHibrida = async (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    setIsLoading(true);

    try {
      // 1. ANALIZAR INTENCIÓN: ¿Es sobre lotería o charla general?
      const esLoteria = msg.includes('lotto') || msg.includes('granjita') || msg.includes('fijo') || 
                        msg.includes('sale') || msg.includes('pronostico') || msg.includes('animal');

      if (!esLoteria) {
        // CHARLA GENERAL (IA Híbrida)
        if (msg.includes('hola') || msg.includes('buenos dias')) return "¡Epa mi pana! ¿Cómo está la malicia hoy? Estoy listo para desglosarte los números. ¿Qué tienes en mente?";
        if (msg.includes('quien eres')) return "Soy Ricardo IA, el cerebro del Búnker. Analizo miles de sorteos en Supabase para darte los datos con más 'veneno' de Venezuela. 🐍🏁";
        if (msg.includes('gracias')) return "¡A la orden jefe! Ya sabes, con mente fría y mucha malicia. 💰";
        return "Interesante pregunta... Pero mi fuerte es el análisis de lotería. ¿Quieres que te diga qué animal tiene más fuerza para salir ahorita?";
      }

      // 2. ANÁLISIS DE DATOS (Conexión Supabase)
      // Buscamos los últimos resultados y el súper pronóstico
      const { data: ultimos } = await supabase.from('lottery_results').select('result_number').order('created_at', { ascending: false }).limit(5);
      const { data: pronosticos } = await supabase.from('super_pronostico_final').select('*');

      let respuesta = `🔍 *ANÁLISIS DEL BÚNKER ACTIVADO* 🔍\n\n`;

      // Analizar qué lotería quiere
      let filtro = '';
      if (msg.includes('activo')) filtro = 'lotto_activo';
      else if (msg.includes('granjita')) filtro = 'granjita';

      if (ultimos && ultimos.length > 0) {
        respuesta += `📉 *Tendencia Reciente:* Los últimos que salieron fueron ${ultimos.map(r => getAnimalEmoji(r.result_number)).join(' ')}. Esto está moviendo la matriz de arrastre.\n\n`;
      }

      if (pronosticos) {
        let lotto = filtro ? pronosticos.find(p => p.lottery_type === filtro) : pronosticos[0];
        if (lotto) {
          respuesta += `🎯 *Dato de Traspaso:* ${formatAnimal(lotto.v_traspaso)}\n`;
          respuesta += `🚀 *Dato Explosivo:* ${formatAnimal(lotto.v_digital)}\n`;
          respuesta += `📏 *Análisis de Suma:* ${formatAnimal(lotto.v_suma)}\n\n`;
          respuesta += `⚠️ *Nota:* La matriz indica mucha fuerza en el grupo de los ${getAnimalByCode(lotto.v_traspaso)?.category || 'animales'}.\n`;
        }
      }

      return respuesta + "¡Cobra seguro! 🍀💰🏁";

    } catch (err) {
      return "¡Epa chamo! Se me cruzaron los cables con la base de datos. Pregúntame otra vez.";
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
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 via-red-600 to-green-600 flex items-center justify-center hover:scale-110 transition-all border-2 border-white/40 group">
        {isOpen ? <X className="text-white w-6 h-6" /> : <div className="relative"><Bot className="w-7 h-7 text-white" /><Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-pulse" /></div>}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] h-[480px] bg-card border-2 border-primary/30 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={18} className="animate-bounce" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-80">Asistente Híbrido</p>
                <p className="text-sm font-black italic tracking-tighter">RICARDO IA v2.0</p>
              </div>
            </div>
            <X className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsOpen(false)} />
          </div>

          <ScrollArea className="flex-1 p-4 bg-muted/5" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-2xl text-[11px] font-bold shadow-inner">
                  👋 ¡Epa jefe! Soy el nuevo Ricardo Híbrido. Analizo Supabase en tiempo real para darte el dato ganador. <br/><br/>
                  💡 *Pregúntame:* <br/>
                  - "¿Qué sale para Lotto Activo?"<br/>
                  - "¿Cuáles son los fijos de hoy?"<br/>
                  - "¿Hola, cómo estás?"
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] shadow-md leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border-2 border-muted font-bold rounded-tl-none'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-primary font-black italic text-[10px] animate-pulse ml-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> CONSULTANDO EL BÚNKER...
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-muted/20 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu duda aquí..." className="bg-background border-2 border-primary/20 font-bold text-xs h-10 rounded-xl" />
            <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shadow-lg"><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
