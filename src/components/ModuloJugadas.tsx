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

interface Play {
  loteria: string;
  numero: string;
  monto: number;
  horas: string[];
}

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<Play[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('user_pm_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('user_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('user_pm_cedula') || "");

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
        const local = localStorage.getItem('tickets_history_v2');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Por favor completa: Lotería, Número, Monto y al menos 1 Sorteo");
    }

    const nueva: Play = {
      loteria: lot,
      numero: num.padStart(2, '0'),
      monto: parseFloat(mon),
      horas: [...selectedHours].sort()
    };

    if (editingIndex !== null) {
      const temp = [...currentJugadas];
      temp[editingIndex] = nueva;
      setCurrentJugadas(temp);
      setEditingIndex(null);
      toast.success("Línea actualizada");
    } else {
      setCurrentJugadas([...currentJugadas, nueva]);
      toast.success("Añadido al ticket");
    }

    setNum(""); setMon(""); setSelectedHours([]);
  };

  const mandarWhatsApp = (t: any) => {
    let ticketMsg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n----------------------------\n*MIS DATOS DE COBRO (PREMIOS):*\n🏦 Banco: ${t.userBanco}\n📞 Pago Móvil: ${t.userPM}\n🆔 Cédula: ${t.userCedula}\n----------------------------\n`;
    t.jugadas.forEach((j: any) => {
      ticketMsg += `📍 *${j.loteria.toUpperCase()}*\nAnimal: *#${j.numero}*\nSorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs x sorteo\n---\n`;
    });
    ticketMsg += `*TOTAL A PAGAR:* ${t.total.toFixed(2)} Bs\n----------------------------\n📥 _Capture adjunto._`;

    const url = `https://wa.me/${t.agenciaWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(ticketMsg)}`;
    window.open(url, '_blank');
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM || !userBanco) {
      return toast.error("Faltan datos bancarios o seleccionar agencia");
    }

    localStorage.setItem('user_pm_banco', userBanco);
    localStorage.setItem('user_pm_tlf', userPM);
    localStorage.setItem('user_pm_cedula', userCedula);

    const t = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia.nombre,
      agenciaWhatsapp: selectedAgencia.whatsapp,
      fecha: new Date().toISOString(),
      jugadas: currentJugadas,
      total: currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0),
      userBanco, userPM, userCedula
    };

    const h = [t, ...savedTickets];
    setSavedTickets(h);
    localStorage.setItem('tickets_history_v2', JSON.stringify(h));
    mandarWhatsApp(t);
    setCurrentJugadas([]);
    setSelectedAgencia(null);
  };

  const verificarPremio = (play: Play) => {
    return play.horas.some(h => 
      todayResults.find(r => 
        r.lottery_type.toLowerCase().replace(" ","_") === play.loteria.toLowerCase().replace(" ","_") && 
        r.draw_time.includes(h) && r.result_number === play.numero
      )
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-primary italic">Sincronizando Búnker de Apuestas...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">💰 CENTRO DE JUGADAS</h2>
          
          <div className="space-y-6">
            {/* 1. Datos del Usuario */}
            <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
              <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para Cobrar (Premios)</label>
              <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco (Ej: Banesco)" className="bg-background font-bold text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" />
                <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
              </div>
            </div>

            {/* 2. Selector de Agencias */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Paso 1: Selecciona Agencia</label>
              <div className="flex flex-wrap gap-2">
                {agencias.map(ag => (
                  <button 
                    key={ag.id} 
                    onClick={() => setSelectedAgencia(ag)}
                    className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border hover:border-primary/20'}`}
                  >
                    {ag.logo_url && <img src={ag.logo_url} className="w-5 h-5 rounded-full object-cover border" />}
                    {ag.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Datos Pago Agencia */}
            {selectedAgencia && (
              <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl text-[11px] font-black uppercase italic space-y-1 shadow-sm animate-in fade-in zoom-in duration-300">
                <p className="text-emerald-600 text-[8px] tracking-widest">🏦 PAGAR A LA AGENCIA (PAGO MÓVIL):</p>
                <p>{selectedAgencia.banco_nombre || 'S/D'} | {selectedAgencia.banco_cedula} | {selectedAgencia.banco_telefono}</p>
              </div>
            )}

            {/* 4. FORMULARIO DE ENTRADA (Aquí metes la jugada) */}
            <Card className={`border-2 rounded-3xl transition-all shadow-xl ${editingIndex !== null ? 'border-amber-500 bg-amber-500/5' : 'border-primary/20'}`}>
              <div className="p-5 space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Paso 2: Arma tu jugada</label>
                <Select value={lot} onValueChange={setLot}>
                  <SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
                  <SelectContent className="font-bold">
                    <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                    <SelectItem value="La Granjita">La Granjita</SelectItem>
                    <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                    <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                    <SelectItem value="Guacharito">Guacharito</SelectItem>
                    <SelectItem value="Selva Plus">Selva Plus</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" />
                  <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
                  <ScrollArea className="h-28 border rounded-2xl p-3 bg-muted/20 shadow-inner">
                    <div className="flex flex-wrap gap-1.5">
                      {DRAW_TIMES.map(t => (
                        <Button 
                          key={t} 
                          variant={selectedHours.includes(t) ? "default" : "outline"} 
                          className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} 
                          onClick={() => toggleHour(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={agregarOActualizar} className={`w-full h-12 font-black uppercase rounded-2xl shadow-md ${editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                  {editingIndex !== null ? <RotateCcw className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                  {editingIndex !== null ? "Corregir Jugada" : "Añadir al Ticket"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 5. VISTA PREVIA TICKET ACTUAL */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tu Ticket:</label>
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary relative min-h-[450px]">
             <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-6">
               {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-12 h-12 mx-auto mb-2 rounded-full border shadow-sm object-cover" />}
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">Animalytics Pro Ticket</p>
             </div>

             <div className="space-y-5">
               {currentJugadas.map((j, i) => (
                 <div key={i} className={`text-[12px] border-b border-dotted border-slate-300 pb-3 flex justify-between items-center ${editingIndex === i ? 'bg-amber-50 p-2 rounded-lg' : ''}`}>
                    <div className="flex-1">
                      <div className="flex justify-between font-black uppercase">
                        <span className="text-primary">{j.loteria}</span>
                        <span className="text-lg">#{j.numero}</span>
                      </div>
                      <p className="text-[9px] opacity-70 italic">Sorteos: {j.horas.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                       <span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <div className="flex gap-1">
                          <button onClick={() => prepararEdicion(i)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                          <button onClick={() => quitarJugada(i)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs">Ticket Vacío</p></div>}
             </div>

             <div className="mt-8 flex justify-between font-black text-xl border-t-2 border-slate-900 pt-4 uppercase italic">
               <span>TOTAL BS:</span>
               <span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span>
             </div>

             <Button 
                disabled={!selectedAgencia || currentJugadas.length === 0} 
                onClick={finalizarTicket} 
                className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl gap-3 transition-all hover:scale-[1.02]"
             >
                <Send size={24} /> ENVIAR POR WHATSAPP
             </Button>
          </div>
        </div>
      </section>

      {/* 6. HISTORIAL DE TICKETS (ABAJO) */}
      <section className="space-y-6 pt-16 border-t-4 border-dashed border-muted">
        <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">
          <History className="bg-primary text-white rounded-full p-1" /> Historial de Jugadas (Hoy)
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTickets.map(ticket => (
            <Card key={ticket.id} className="border-2 border-border hover:border-primary/40 transition-all shadow-lg bg-card overflow-hidden rounded-3xl relative">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">{new Date(ticket.fecha).toLocaleString()}</p>
                    <h4 className="font-black text-sm uppercase text-primary truncate w-40">🏢 {ticket.agenciaNombre}</h4>
                  </div>
                  <button onClick={() => { setSavedTickets(savedTickets.filter(t => t.id !== ticket.id)); localStorage.setItem('tickets_history_v2', JSON.stringify(savedTickets.filter(t => t.id !== ticket.id))); }} className="text-destructive hover:scale-110 transition-transform"><Trash2 size={20}/></button>
                </div>

                <div className="space-y-3 py-3 border-y-2 border-dashed border-muted">
                  {ticket.jugadas.map((play, idx) => {
                    const gano = verificarPremio(play);
                    return (
                      <div key={idx} className={`p-3 rounded-2xl flex justify-between items-center transition-all ${gano ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-inner' : 'bg-muted/30 border border-transparent'}`}>
                        <div className="text-left">
                          <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">{play.loteria}</p>
                          <p className="font-black text-xl">#{play.numero}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                           {gano ? <Badge className="bg-emerald-600 text-[9px] animate-bounce font-black px-3 py-1 rounded-full shadow-lg">GANÓ 💰</Badge> : <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Pendiente</span>}
                           <span className="text-xs font-black">{(play.monto * play.horas.length).toFixed(2)} Bs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center font-black pt-2">
                  <span className="text-xs uppercase opacity-60">Pago Total:</span>
                  <span className="text-xl text-emerald-600 font-mono tracking-tighter">{ticket.total.toFixed(2)} Bs</span>
                </div>
                
                <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase italic rounded-xl border-2 hover:bg-primary/5 gap-2" onClick={() => mandarWhatsApp(ticket)}>
                   <RotateCcw size={14}/> Re-enviar Ticket
                </Button>
              </div>
            </Card>
          ))}
          {savedTickets.length === 0 && (
            <div className="col-span-full p-20 text-center border-4 border-dashed rounded-[3rem] opacity-20 flex flex-col items-center gap-4">
              <History size={64}/><p className="font-black uppercase tracking-[0.2em] text-sm italic">Búnker de tickets vacío</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
