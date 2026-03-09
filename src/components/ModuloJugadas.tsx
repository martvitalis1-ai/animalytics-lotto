import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Pencil, Landmark, Wallet, CheckCircle2, History, Clock, ReceiptText, Store } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('user_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('user_pm') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('user_cedula') || "");

  useEffect(() => {
    const init = async () => {
      const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
      if (ag) setAgencias(ag);
      const hoy = new Date().toISOString().split('T')[0];
      const { data: res } = await supabase.from('lottery_results').select('*').eq('draw_date', hoy);
      if (res) setTodayResults(res);
      const local = localStorage.getItem('tickets_history');
      if (local) setSavedTickets(JSON.parse(local));
      setLoading(false);
    };
    init();
  }, []);

  const mandarWhatsApp = (t: any) => {
    let ticket = `*JUGADA - ANIMALYTICS PRO*\n----------------------------\n*DATOS DE COBRO:*\n🏦 Banco: ${t.userBanco}\n📞 PM: ${t.userPM}\n🆔 CI: ${t.userCedula}\n----------------------------\n`;
    t.jugadas.forEach((j: any) => {
      ticket += `📍 *${j.loteria.toUpperCase()}*\n#${j.numero} - Sorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs c/u\n---\n`;
    });
    ticket += `*TOTAL:* ${t.total.toFixed(2)} Bs\n----------------------------\n📥 _Capture adjunto._`;

    // SOLUCIÓN AL BLOQUEO: Usar wa.me y codificar bien el mensaje
    const url = `https://wa.me/${t.agenciaWhatsapp.replace('+', '')}?text=${encodeURIComponent(ticket)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return toast.error("Datos incompletos");
    localStorage.setItem('user_banco', userBanco);
    localStorage.setItem('user_pm', userPM);
    localStorage.setItem('user_cedula', userCedula);
    const t = { id: Math.random().toString(36).substring(2, 8).toUpperCase(), agenciaNombre: selectedAgencia.nombre, agenciaWhatsapp: selectedAgencia.whatsapp, fecha: new Date().toISOString(), jugadas: currentJugadas, total: currentJugadas.reduce((a:any, c:any) => a + (c.monto * c.horas.length), 0), userBanco, userPM, userCedula };
    const h = [t, ...savedTickets];
    setSavedTickets(h); localStorage.setItem('tickets_history', JSON.stringify(h));
    mandarWhatsApp(t); setCurrentJugadas([]); setSelectedAgencia(null);
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para cobrar Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2"><Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" /><Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" /></div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground"><Store className="inline w-3 h-3"/> Elige tu Agencia Aliada:</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover" />}
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>
          {selectedAgencia && (<div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase italic space-y-1 shadow-sm"><p className="text-emerald-600 text-[8px]">🏦 Pagar a Agencia (Pago Móvil):</p><p>{selectedAgencia.banco_nombre} | {selectedAgencia.banco_cedula} | {selectedAgencia.banco_telefono}</p></div>)}
          {/* ... resto del formulario igual que el anterior ... */}
          <Button disabled={!selectedAgencia || currentJugadas.length === 0} onClick={finalizarTicket} className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl gap-3"><Send size={24} /> ENVIAR TICKET Y CAPTURE</Button>
        </div>
        <div className="space-y-4">
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px] relative">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-12 h-12 mx-auto mb-2 rounded-full border shadow-sm object-cover" />}
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase">Animalytics Pro Ticket</p>
             </div>
             {/* ... mapeo de jugadas ... */}
          </div>
        </div>
      </section>
    </div>
  );
}
