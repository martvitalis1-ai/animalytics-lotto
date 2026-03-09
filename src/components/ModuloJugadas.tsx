import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Plus, Trash2, Pencil, Landmark, 
  Wallet, CheckCircle2, History, 
  Clock, RotateCcw, ReceiptText, Store
} from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

interface Play { loteria: string; numero: string; monto: number; horas: string[]; }
interface SavedTicket { id: string; agenciaNombre: string; agenciaWhatsapp: string; fecha: string; jugadas: Play[]; total: number; userBanco: string; userPM: string; userCedula: string; }

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<Play[]>([]);
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
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

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Completa los datos");
    const nueva = { loteria: lot, numero: num.padStart(2, '0'), monto: parseFloat(mon), horas: [...selectedHours].sort() };
    if (editingIndex !== null) {
      const t = [...currentJugadas]; t[editingIndex] = nueva;
      setCurrentJugadas(t); setEditingIndex(null);
    } else {
      setCurrentJugadas([...currentJugadas, nueva]);
    }
    setNum(""); setMon(""); setSelectedHours([]);
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userBanco || !userPM) return toast.error("Completa tus datos bancarios arriba");
    localStorage.setItem('user_banco', userBanco);
    localStorage.setItem('user_pm', userPM);
    localStorage.setItem('user_cedula', userCedula);
    const t = { id: Math.random().toString(36).substring(2, 8).toUpperCase(), agenciaNombre: selectedAgencia.nombre, agenciaWhatsapp: selectedAgencia.whatsapp, fecha: new Date().toISOString(), jugadas: currentJugadas, total: currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0), userBanco, userPM, userCedula };
    const h = [t, ...savedTickets];
    setSavedTickets(h); localStorage.setItem('tickets_history', JSON.stringify(h));
    mandarWhatsApp(t); setCurrentJugadas([]); setSelectedAgencia(null);
  };

  const mandarWhatsApp = (t: SavedTicket) => {
    let msg = `*JUGADA - ANIMALYTICS PRO*%0A----------------------------%0A*MIS DATOS PARA COBRAR:*%0A🏦 Banco: ${t.userBanco}%0A📞 PM: ${t.userPM}%0A🆔 CI: ${t.userCedula}%0A----------------------------%0A`;
    t.jugadas.forEach(j => msg += `📍 *${j.loteria.toUpperCase()}*%0AAnimal: *#${j.numero}*%0AHoras: ${j.horas.join(", ")}%0AMonto: ${j.monto} Bs x sorteo%0A---%0A`);
    msg += `*TOTAL:* ${t.total.toFixed(2)} Bs%0A----------------------------%0A📥 _Capture adjunto._`;
    window.open(`https://wa.me/${t.agenciaWhatsapp}?text=${msg}`, '_blank');
  };

  const verificarPremio = (play: Play) => {
    return play.horas.some(h => todayResults.find(r => r.lottery_type.toLowerCase().replace(" ","_") === play.loteria.toLowerCase().replace(" ","_") && r.draw_time.includes(h) && r.result_number === play.numero));
  };

  if (loading) return <div className="p-20 text-center animate-pulse uppercase font-black italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para Cobrar Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Nombre del Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2"><Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Teléfono Pago Móvil" className="bg-background font-bold text-xs" /><Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" /></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-muted-foreground">1. Agencia Receptor</label>
            <div className="flex flex-wrap gap-2">{agencias.map(ag => (<button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>{ag.nombre}</button>))}</div>
          </div>
          {selectedAgencia && (<div className="p-5 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl animate-in fade-in slide-in-from-top-2 text-xs font-black uppercase italic space-y-1"><p className="text-emerald-600 text-[10px]">🏦 Pagar a Agencia:</p><p>Banco: {selectedAgencia.banco_nombre}</p><p>CI: {selectedAgencia.banco_cedula}</p><p>TLF: {selectedAgencia.banco_telefono}</p></div>)}
          <Card className={`border-2 rounded-3xl ${editingIndex !== null ? 'border-amber-500 bg-amber-500/5' : 'border-primary/20'}`}><div className="p-5 space-y-4 text-left">
            <Select value={lot} onValueChange={setLot}><SelectTrigger className="font-black h-11"><SelectValue placeholder="Lotería" /></SelectTrigger><SelectContent className="font-bold"><SelectItem value="Lotto Activo">Lotto Activo</SelectItem><SelectItem value="La Granjita">La Granjita</SelectItem><SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem><SelectItem value="Lotto Rey">Lotto Rey</SelectItem><SelectItem value="Guacharito">Guacharito</SelectItem><SelectItem value="Selva Plus">Selva Plus</SelectItem></SelectContent></Select>
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Animal Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" /><Input placeholder="Monto Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
              <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20"><div className="flex flex-wrap gap-1.5">{DRAW_TIMES.map(t => (<Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}>{t}</Button>))}</div></ScrollArea>
            </div>
            <Button onClick={agregarOActualizar} className={`w-full h-12 font-black uppercase rounded-2xl ${editingIndex !== null ? 'bg-amber-600' : ''}`}>{editingIndex !== null ? "Corregir Línea" : "Añadir al Ticket"}</Button>
          </div></Card>
        </div>
        <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vista Previa Ticket:</label>
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px]">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6"><h3 className="font-black text-2xl uppercase">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3><p className="text-[9px] opacity-60 uppercase">Animalytics Pro Ticket</p></div>
             <div className="space-y-5">{currentJugadas.map((j, i) => (<div key={i} className={`text-[12px] border-b border-dotted pb-3 flex justify-between items-center ${editingIndex === i ? 'bg-amber-50 p-2 rounded-lg' : ''}`}><div className="flex-1"><div className="flex justify-between font-black uppercase"><span className="text-primary">{j.loteria}</span><span className="text-lg">#{j.numero}</span></div><p className="text-[9px] opacity-70 italic">Sorteos: {j.horas.join(", ")}</p></div><div className="flex items-center gap-3 ml-4"><span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span><div className="flex gap-1"><button onClick={() => { setLot(j.loteria); setNum(j.numero); setMon(j.monto.toString()); setSelectedHours(j.horas); setEditingIndex(i); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Pencil size={18}/></button><button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={18}/></button></div></div></div>))}</div>
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4 uppercase italic"><span>TOTAL BS:</span><span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span></div>
             <Button disabled={!selectedAgencia || currentJugadas.length === 0} onClick={finalizarTicket} className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl gap-3"><Send size={24} /> ENVIAR TICKET Y CAPTURE</Button>
          </div>
        </div>
      </section>
      <section className="space-y-6 pt-16 border-t-4 border-dashed border-muted"><h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2"><History className="bg-primary text-white rounded-full p-1" /> Mis Jugadas de Hoy</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{savedTickets.map(ticket => (<Card key={ticket.id} className="border-2 border-border hover:border-primary/40 transition-all shadow-lg bg-card overflow-hidden rounded-3xl relative"><div className="p-5 space-y-4"><div className="flex justify-between items-start"><div className="text-left"><p className="text-[10px] font-black text-muted-foreground uppercase">{new Date(ticket.fecha).toLocaleString()}</p><h4 className="font-black text-sm uppercase text-primary truncate w-40">🏢 {ticket.agenciaNombre}</h4></div><button onClick={() => { setSavedTickets(savedTickets.filter(t => t.id !== ticket.id)); localStorage.setItem('tickets_history', JSON.stringify(savedTickets.filter(t => t.id !== ticket.id))); }} className="text-destructive hover:scale-110 transition-transform"><Trash2 size={20}/></button></div>
          <div className="space-y-3 py-3 border-y-2 border-dashed border-muted">{ticket.jugadas.map((play, idx) => { const gano = verificarPremio(play); return (<div key={idx} className={`p-3 rounded-2xl flex justify-between items-center transition-all ${gano ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-inner' : 'bg-muted/30 border border-transparent'}`}><div className="text-left"><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">{play.loteria}</p><p className="font-black text-xl">#{play.numero}</p></div><div className="text-right flex flex-col items-end gap-1">{gano ? <Badge className="bg-emerald-600 text-[9px] animate-bounce font-black px-3 py-1 rounded-full shadow-lg">GANÓ 💰</Badge> : <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Pendiente</span>}<span className="text-xs font-black">{(play.monto * play.horas.length).toFixed(2)} Bs</span></div></div>); })}</div>
          <div className="flex justify-between items-center font-black pt-2"><span className="text-xs uppercase opacity-60">Pago Total:</span><span className="text-xl text-emerald-600">{ticket.total.toFixed(2)} Bs</span></div>
          <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase italic rounded-xl border-2 hover:bg-primary/5 gap-2" onClick={() => mandarWhatsApp(ticket)}><RotateCcw size={14}/> Re-enviar WhatsApp</Button></div></Card>))}</div></section>
    </div>
  );
}
