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
  Clock, ReceiptText, Store, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");

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
        const local = localStorage.getItem('tickets_history_v_final');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const mandarWhatsApp = (t: any) => {
    let ticketMsg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n----------------------------\n*MIS DATOS DE COBRO:*\n🏦 Banco: ${t.userBanco}\n📞 PM: ${t.userPM}\n🆔 CI: ${t.userCedula}\n----------------------------\n`;
    t.jugadas.forEach((j: any) => {
      ticketMsg += `📍 *${j.loteria.toUpperCase()}*\n#${j.numero} - Sorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs c/u\n---\n`;
    });
    ticketMsg += `*TOTAL A PAGAR:* ${t.total.toFixed(2)} Bs\n----------------------------\n📥 _Capture adjunto._`;

    const phoneClean = t.agenciaWhatsapp?.toString().replace(/\D/g, '') || "";
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(ticketMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Datos incompletos");
    const nueva = { loteria: lot, numero: num.padStart(2, '0'), monto: parseFloat(mon), horas: [...selectedHours].sort() };
    if (editingIndex !== null) {
      const temp = [...currentJugadas]; temp[editingIndex] = nueva;
      setCurrentJugadas(temp); setEditingIndex(null);
    } else {
      setCurrentJugadas([...currentJugadas, nueva]);
    }
    setNum(""); setMon(""); setSelectedHours([]);
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return toast.error("Faltan datos");
    localStorage.setItem('u_pm_banco', userBanco);
    localStorage.setItem('u_pm_tlf', userPM);
    localStorage.setItem('u_pm_cedula', userCedula);
    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    const t = { id: Math.random().toString(36).substring(2, 8).toUpperCase(), agenciaNombre: selectedAgencia.nombre, agenciaWhatsapp: selectedAgencia.whatsapp, fecha: new Date().toISOString(), jugadas: currentJugadas, total, userBanco, userPM, userCedula };
    const h = [t, ...savedTickets];
    setSavedTickets(h);
    localStorage.setItem('tickets_history_v_final', JSON.stringify(h));
    mandarWhatsApp(t);
    setCurrentJugadas([]); setSelectedAgencia(null);
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-primary italic uppercase">Conectando con el Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para cobrar Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2">
                <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" />
                <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Paso 1: Elige Agencia Aliada</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-3 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover border" alt="logo" />}
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {selectedAgencia && (
            <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase italic space-y-1 shadow-sm">
              <p className="text-emerald-600 text-[8px] uppercase tracking-widest">🏦 Pagar a la Agencia (Pago Móvil):</p>
              <p>{selectedAgencia?.banco_nombre || '---'} | {selectedAgencia?.banco_cedula || '---'} | {selectedAgencia?.banco_telefono || '---'}</p>
            </div>
          )}

          <Card className={`border-2 rounded-3xl p-5 space-y-4 shadow-xl ${editingIndex !== null ? 'border-amber-500 bg-amber-50' : 'border-primary/20'}`}>
            <Select value={lot} onValueChange={setLot}><SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Lotería" /></SelectTrigger><SelectContent className="font-bold"><SelectItem value="Lotto Activo">Lotto Activo</SelectItem><SelectItem value="La Granjita">La Granjita</SelectItem><SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem><SelectItem value="Lotto Rey">Lotto Rey</SelectItem><SelectItem value="Guacharito">Guacharito</SelectItem><SelectItem value="Selva Plus">Selva Plus</SelectItem></SelectContent></Select>
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Animal Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" /><Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
               <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20 shadow-inner"><div className="flex flex-wrap gap-1.5">{DRAW_TIMES.map(t => (<Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} onClick={() => toggleHour(t)}>{t}</Button>))}</div></ScrollArea>
            </div>
            <Button onClick={agregarOActualizar} className={`w-full h-12 font-black uppercase rounded-2xl shadow-md ${editingIndex !== null ? 'bg-amber-600' : ''}`}>{editingIndex !== null ? <RotateCcw className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />} {editingIndex !== null ? "Corregir Línea" : "Añadir al Ticket"}</Button>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px] relative text-left">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-14 h-14 mx-auto mb-2 rounded-full border shadow-sm object-cover bg-muted" alt="logo" />}
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase font-black tracking-widest">Animalytics Pro Ticket</p>
             </div>
             <div className="space-y-5">
               {currentJugadas.map((j, i) => (
                 <div key={i} className={`text-[12px] border-b border-dotted pb-3 flex justify-between items-center ${editingIndex === i ? 'bg-amber-50 p-2 rounded-lg' : ''}`}>
                    <div className="flex-1">
                      <div className="flex justify-between font-black uppercase"><span className="text-primary">{j.loteria}</span><span className="text-lg">#{j.numero}</span></div>
                      <p className="text-[9px] opacity-70 italic leading-none">Sorteos: {j.horas.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                       <span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <div className="flex gap-1">
                          <button onClick={() => { setLot(j.loteria); setNum(j.numero); setMon(j.monto.toString()); setSelectedHours(j.horas); setEditingIndex(i); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                          <button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs">Ticket Vacío</p></div>}
             </div>
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4 uppercase italic"><span>TOTAL BS:</span><span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span></div>
             <Button disabled={!selectedAgencia || currentJugadas.length === 0} onClick={finalizarTicket} className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl gap-3 transition-all hover:scale-[1.02]"><Send size={24} /> ENVIAR POR WHATSAPP</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
