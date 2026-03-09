import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Pencil, Landmark, Wallet, History, Clock, RotateCcw, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('user_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('user_pm') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('user_cedula') || "");

  // Formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
        const hoy = new Date().toISOString().split('T')[0];
        const { data: res } = await supabase.from('lottery_results').select('*').eq('draw_date', hoy);
        if (res) setTodayResults(res);
        const local = localStorage.getItem('tickets_history_v3');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const mandarWhatsApp = (t: any) => {
    // Texto formateado con saltos de línea reales para WhatsApp
    let ticketMsg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n`;
    ticketMsg += `----------------------------\n`;
    ticketMsg += `*DATOS PARA COBRAR PREMIOS:*\n`;
    ticketMsg += `🏦 Banco: ${t.userBanco}\n`;
    ticketMsg += `📞 Pago Móvil: ${t.userPM}\n`;
    ticketMsg += `🆔 Cédula: ${t.userCedula}\n`;
    ticketMsg += `----------------------------\n`;
    
    t.jugadas.forEach((j: any) => {
      ticketMsg += `📍 *${j.loteria.toUpperCase()}*\n`;
      ticketMsg += `Animal: *#${j.numero}*\n`;
      ticketMsg += `Sorteos: ${j.horas.join(", ")}\n`;
      ticketMsg += `Monto: ${j.monto} Bs c/u\n`;
      ticketMsg += `---\n`;
    });

    ticketMsg += `*TOTAL A PAGAR:* ${t.total.toFixed(2)} Bs\n`;
    ticketMsg += `----------------------------\n`;
    ticketMsg += `📥 _Capture de pago adjunto._`;

    // SOLUCIÓN AL BLOQUEO DE OPERA: wa.me + limpiar número + encode completo
    const cleanPhone = t.agenciaWhatsapp.replace(/\D/g, ''); // Solo números (quita el +)
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(ticketMsg)}`;
    
    // Forzamos apertura externa
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) toast.error("Habilita las ventanas emergentes para enviar a WhatsApp");
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM || !userBanco) {
      return toast.error("Completa tus datos bancarios y selecciona una agencia");
    }

    localStorage.setItem('user_banco', userBanco);
    localStorage.setItem('user_pm', userPM);
    localStorage.setItem('user_cedula', userCedula);

    const ticket = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia.nombre,
      agenciaWhatsapp: selectedAgencia.whatsapp,
      fecha: new Date().toISOString(),
      jugadas: currentJugadas,
      total: currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0),
      userBanco, userPM, userCedula
    };

    const updatedHistory = [ticket, ...savedTickets];
    setSavedTickets(updatedHistory);
    localStorage.setItem('tickets_history_v3', JSON.stringify(updatedHistory));
    
    mandarWhatsApp(ticket);
    setCurrentJugadas([]);
    setSelectedAgencia(null);
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-primary italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para Cobrar (Premios)</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" />
              <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Cédula" className="bg-background font-bold text-xs" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">Paso 1: Selecciona Agencia Aliada</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-3 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover border" />}
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {selectedAgencia && (
            <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl text-[11px] font-black uppercase italic space-y-1 shadow-sm">
              <p className="text-emerald-600 text-[8px]">🏦 Pagar a la Agencia (Pago Móvil):</p>
              <p>{selectedAgencia.banco_nombre || '---'} | {selectedAgencia.banco_cedula} | {selectedAgencia.banco_telefono}</p>
            </div>
          )}

          <Card className="border-2 rounded-3xl border-primary/20 p-5 space-y-4 shadow-xl">
             <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Paso 2: Agrega tu Jugada</div>
             <Select value={lot} onValueChange={setLot}><SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Lotería" /></SelectTrigger><SelectContent className="font-bold"><SelectItem value="Lotto Activo">Lotto Activo</SelectItem><SelectItem value="La Granjita">La Granjita</SelectItem><SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem><SelectItem value="Lotto Rey">Lotto Rey</SelectItem><SelectItem value="Guacharito">Guacharito</SelectItem><SelectItem value="Selva Plus">Selva Plus</SelectItem></SelectContent></Select>
             <div className="grid grid-cols-2 gap-3"><Input placeholder="Animal Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" /><Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
               <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20 shadow-inner"><div className="flex flex-wrap gap-1.5">{DRAW_TIMES.map(t => (<Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}>{t}</Button>))}</div></ScrollArea>
             </div>
             <Button onClick={() => { if(!lot || !num || !mon || selectedHours.length === 0) return toast.error("Datos incompletos"); setCurrentJugadas([...currentJugadas, { loteria: lot, numero: num.padStart(2,'0'), monto: parseFloat(mon), horas: [...selectedHours].sort() }]); setNum(""); setMon(""); setSelectedHours([]); }} className="w-full h-12 font-black uppercase rounded-2xl shadow-md"><Plus className="mr-2 h-5 w-5" /> Añadir al Ticket</Button>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px] relative">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-14 h-14 mx-auto mb-2 rounded-full border shadow-sm object-cover bg-muted" alt="logo" />}
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase tracking-widest font-bold">Animalytics Pro Ticket</p>
             </div>
             <div className="space-y-5">
               {currentJugadas.map((j, i) => (
                 <div key={i} className="text-[12px] border-b border-dotted pb-3 flex justify-between items-center text-left">
                    <div className="flex-1">
                      <div className="flex justify-between font-black uppercase">
                        <span className="text-primary">{j.loteria}</span>
                        <span className="text-lg">#{j.numero}</span>
                      </div>
                      <p className="text-[9px] opacity-70 italic">Sorteos: {j.horas.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                       <span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                    </div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs tracking-widest">Ticket Vacío</p></div>}
             </div>
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4 uppercase italic"><span>TOTAL BS:</span><span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span></div>
             <Button disabled={!selectedAgencia || currentJugadas.length === 0} onClick={finalizarTicket} className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl gap-3"><Send size={24} /> ENVIAR TICKET Y CAPTURE</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
