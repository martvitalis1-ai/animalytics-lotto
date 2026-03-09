import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Send, Plus, Trash2, Pencil, Landmark, Wallet, History, Clock, ReceiptText, Store } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_cedula') || "");

  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
        const hoy = new Date().toISOString().split('T')[0];
        const { data: res } = await supabase.from('lottery_results').select('*').eq('draw_date', hoy);
        if (res) setTodayResults(res);
        const local = localStorage.getItem('tickets_history_final');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  // Función para construir el texto que recibirá la agencia
  const generarTextoTicket = () => {
    let ticketMsg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n----------------------------\n*DATOS DE COBRO:*\n🏦 Banco: ${userBanco}\n📞 PM: ${userPM}\n🆔 CI: ${userCedula}\n----------------------------\n`;
    currentJugadas.forEach((j: any) => {
      ticketMsg += `📍 *${j.loteria.toUpperCase()}*\n#${j.numero} - Sorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs x sorteo\n---\n`;
    });
    ticketMsg += `*TOTAL A PAGAR:* ${currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs\n----------------------------\n📥 _Envío comprobante de pago por aquí._`;
    return ticketMsg;
  };

  // Limpiar el número de la agencia para el link wa.me
  const phoneClean = selectedAgencia?.whatsapp?.toString().replace(/\D/g, '') || "";
  const finalWhatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(generarTextoTicket())}`;

  if (loading) return <div className="p-20 text-center animate-pulse uppercase font-black italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para cobrar Premios</label>
            <Input value={userBanco} onChange={e => { setUserBanco(e.target.value); localStorage.setItem('u_banco', e.target.value); }} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => { setUserPM(e.target.value); localStorage.setItem('u_pm', e.target.value); }} placeholder="Teléfono Pago Móvil" className="bg-background font-bold text-xs" />
              <Input value={userCedula} onChange={e => { setUserCedula(e.target.value); localStorage.setItem('u_cedula', e.target.value); }} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">Paso 1: Elige Agencia Aliada</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-3 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover border" alt="logo" />}
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {selectedAgencia && (<div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase italic space-y-1 shadow-sm"><p className="text-emerald-600 text-[8px]">🏦 Pagar a Agencia:</p><p>{selectedAgencia.banco_nombre} | {selectedAgencia.banco_cedula} | {selectedAgencia.banco_telefono}</p></div>)}

          <Card className="border-2 rounded-3xl border-primary/20 p-5 space-y-4 shadow-xl">
             <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest text-center">Paso 2: Arma tu Jugada</div>
             <Select onValueChange={setLot}><SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Lotería" /></SelectTrigger>
               <SelectContent className="font-bold">
                 <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                 <SelectItem value="La Granjita">La Granjita</SelectItem>
                 <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                 <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                 <SelectItem value="Guacharito">Guacharito</SelectItem>
                 <SelectItem value="Selva Plus">Selva Plus</SelectItem>
               </SelectContent>
             </Select>
             <div className="grid grid-cols-2 gap-2"><Input placeholder="Nº Animal" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" /><Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
               <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20 shadow-inner"><div className="flex flex-wrap gap-1.5">{DRAW_TIMES.map(t => (<Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}>{t}</Button>))}</div></ScrollArea>
             </div>
             <Button onClick={() => { 
                if(!lot || !num || !mon || selectedHours.length === 0) return toast.error("Datos incompletos");
                // BLOQUEO DE RANGO EN EL TICKET
                const n = parseInt(num);
                if (lot === "Guácharo Activo" && n > 75) return toast.error("Guácharo llega hasta el 75");
                if (lot !== "Guacharito" && lot !== "Guácharo Activo" && n > 36) return toast.error("Esta lotería llega hasta el 36");

                setCurrentJugadas([...currentJugadas, { loteria: lot, numero: num.padStart(2,'0'), monto: parseFloat(mon), horas: [...selectedHours].sort() }]); 
                setNum(""); setMon(""); setSelectedHours([]); 
             }} className="w-full h-12 font-black uppercase rounded-2xl shadow-md"><Plus className="mr-2 h-5 w-5" /> Añadir al Ticket</Button>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px] relative">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-14 h-14 mx-auto mb-2 rounded-full border shadow-sm object-cover bg-muted" alt="logo" />}
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">Animalytics Pro Ticket</p>
             </div>
             <div className="space-y-5">
               {currentJugadas.map((j, i) => (
                 <div key={i} className={`text-[12px] border-b border-dotted pb-3 flex justify-between items-center text-left`}>
                    <div className="flex-1"><div className="flex justify-between font-black uppercase"><span className="text-primary">{j.loteria}</span><span className="text-lg">#{j.numero}</span></div><p className="text-[9px] opacity-70 italic leading-none">Sorteos: {j.horas.join(", ")}</p></div>
                    <div className="flex items-center gap-3 ml-4"><span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span><button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button></div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs tracking-widest">Ticket Vacío</p></div>}
             </div>
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4 uppercase italic"><span>TOTAL BS:</span><span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span></div>
             
             {/* ✅ SOLUCIÓN AL BLOQUEO DE WHATSAPP: USAR <A> EN LUGAR DE BUTTON CON ONCLICK */}
             <a 
               href={finalWhatsappUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className={`w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${(!selectedAgencia || currentJugadas.length === 0 || !userPM) ? 'pointer-events-none opacity-50' : ''}`}
               onClick={() => {
                 // Guardar en el historial local antes de irse
                 const ticket = { id: Math.random().toString(36).substring(2, 8).toUpperCase(), agenciaNombre: selectedAgencia.nombre, agenciaWhatsapp: selectedAgencia.whatsapp, fecha: new Date().toISOString(), jugadas: currentJugadas, total: currentJugadas.reduce((acc:any, curr:any) => acc + (curr.monto * curr.horas.length), 0), userBanco, userPM, userCedula };
                 const history = JSON.parse(localStorage.getItem('tickets_history_final') || '[]');
                 localStorage.setItem('tickets_history_final', JSON.stringify([ticket, ...history]));
                 setCurrentJugadas([]); setSelectedAgencia(null);
               }}
             >
               <Send size={24} /> ENVIAR POR WHATSAPP
             </a>
          </div>
        </div>
      </section>
    </div>
  );
}
