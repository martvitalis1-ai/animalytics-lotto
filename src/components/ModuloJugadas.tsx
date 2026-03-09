import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Plus, Trash2, Pencil, Landmark, 
  Wallet, CheckCircle2, History, 
  Clock, RotateCcw, ReceiptText, Store
} from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

interface Play {
  loteria: string;
  numero: string;
  monto: number;
  horas: string[];
}

interface SavedTicket {
  id: string;
  agenciaNombre: string;
  agenciaWhatsapp: string;
  fecha: string;
  jugadas: Play[];
  total: number;
  userBanco: string; // Nuevo
  userPM: string;
  userCedula: string;
}

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<Play[]>([]);
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos personales del usuario
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('animalytics_user_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('animalytics_user_pm') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('animalytics_user_cedula') || "");

  // Formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: agData } = await supabase.from('agencias').select('*').eq('activa', true);
      if (agData) setAgencias(agData);

      const hoy = new Date().toISOString().split('T')[0];
      const { data: resData } = await supabase.from('lottery_results').select('*').eq('draw_date', hoy);
      if (resData) setTodayResults(resData);

      const local = localStorage.getItem('animalytics_tickets_history');
      if (local) setSavedTickets(JSON.parse(local));
      setLoading(false);
    };
    init();
  }, []);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const agregarOActualizarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Completa Lotería, Número, Monto y Sorteos");
    }
    const nuevaPlay: Play = { loteria: lot, numero: num.padStart(2, '0'), monto: parseFloat(mon), horas: [...selectedHours].sort() };

    if (editingIndex !== null) {
      const temp = [...currentJugadas];
      temp[editingIndex] = nuevaPlay;
      setCurrentJugadas(temp);
      setEditingIndex(null);
    } else {
      setCurrentJugadas([...currentJugadas, nuevaPlay]);
    }
    setNum(""); setMon(""); setSelectedHours([]);
  };

  const finalizarTicket = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userBanco || !userPM || !userCedula) {
      return toast.error("Completa tus datos de cobro y selecciona agencia");
    }

    localStorage.setItem('animalytics_user_banco', userBanco);
    localStorage.setItem('animalytics_user_pm', userPM);
    localStorage.setItem('animalytics_user_cedula', userCedula);

    const nuevoTicket: SavedTicket = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia.nombre,
      agenciaWhatsapp: selectedAgencia.whatsapp,
      fecha: new Date().toISOString(),
      jugadas: currentJugadas,
      total: currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0),
      userBanco,
      userPM,
      userCedula
    };

    const historialActualizado = [nuevoTicket, ...savedTickets];
    setSavedTickets(historialActualizado);
    localStorage.setItem('animalytics_tickets_history', JSON.stringify(historialActualizado));
    
    mandarWhatsApp(nuevoTicket);
    setCurrentJugadas([]);
    setSelectedAgencia(null);
  };

  const mandarWhatsApp = (t: SavedTicket) => {
    let msg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*%0A`;
    msg += `----------------------------%0A`;
    msg += `*AGENCIA:* ${t.agenciaNombre}%0A`;
    msg += `----------------------------%0A`;
    msg += `*DATOS PARA PAGARME PREMIOS:*%0A`;
    msg += `🏦 Banco: ${t.userBanco}%0A`;
    msg += `📞 Pago Móvil: ${t.userPM}%0A`;
    msg += `🆔 Cédula: ${t.userCedula}%0A`;
    msg += `----------------------------%0A`;
    
    t.jugadas.forEach(j => {
      msg += `📍 *${j.loteria.toUpperCase()}*%0A`;
      msg += `Animal: *#${j.numero}*%0A`;
      msg += `Sorteos: ${j.horas.join(", ")}%0A`;
      msg += `Total: ${(j.monto * j.horas.length).toFixed(2)} Bs%0A`;
      msg += `---%0A`;
    });

    msg += `*TOTAL A PAGAR:* ${t.total.toFixed(2)} Bs%0A`;
    msg += `----------------------------%0A`;
    msg += `📥 _Adjunto comprobante del pago realizado._`;

    window.open(`https://wa.me/${t.agenciaWhatsapp}?text=${msg}`, '_blank');
  };

  const verificarPremio = (play: Play) => {
    return play.horas.some(h => 
      todayResults.find(r => 
        r.lottery_type.toLowerCase().replace(" ","_") === play.loteria.toLowerCase().replace(" ","_") && 
        r.draw_time.includes(h) && r.result_number === play.numero
      )
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-primary italic">Sincronizando Centro de Jugadas...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">💰 NUEVO TICKET</h2>
          
          <div className="space-y-6">
            {/* DATOS DEL USUARIO */}
            <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Wallet size={14}/> 1. Tus Datos de Cobro (Premios)
              </label>
              <div className="grid grid-cols-1 gap-2">
                <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco (Ej: Provincial)" className="bg-background font-bold text-xs" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Teléfono Pago Móvil" className="bg-background font-bold text-xs" />
                  <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
                </div>
              </div>
            </div>

            {/* SELECCIONAR AGENCIA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                <Store size={14}/> 2. Selecciona Agencia
              </label>
              <div className="flex flex-wrap gap-2">
                {agencias.map(ag => (
                  <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 border-2 rounded-2xl text-[10px] font-black uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                    {ag.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* DATOS BANCARIOS AGENCIA */}
            {selectedAgencia && (
              <div className="p-5 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 mb-3">
                  <Landmark size={14}/> 🏦 Pagar a la Agencia (Pago Móvil):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-black uppercase italic">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-100">
                    <p className="opacity-50 text-[8px]">Banco</p>
                    <p className="text-emerald-700">{selectedAgencia.banco_nombre || '---'}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-100">
                    <p className="opacity-50 text-[8px]">Cédula/RIF</p>
                    <p className="text-emerald-700">{selectedAgencia.banco_cedula}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-100">
                    <p className="opacity-50 text-[8px]">Teléfono</p>
                    <p className="text-emerald-700">{selectedAgencia.banco_telefono}</p>
                  </div>
                </div>
              </div>
            )}

            {/* FORMULARIO DE LÍNEA */}
            <Card className={`border-2 transition-all shadow-xl rounded-3xl ${editingIndex !== null ? 'border-amber-500 bg-amber-500/5' : 'border-primary/20'}`}>
              <div className="p-5 space-y-4 text-left">
                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">3. Agrega tus Animales</label>
                <Select value={lot} onValueChange={setLot}>
                  <SelectTrigger className="font-black uppercase h-11"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
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
                  <Input placeholder="Nº Animal" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" />
                  <Input placeholder="Monto Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
                  <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20 shadow-inner">
                    <div className="flex flex-wrap gap-1.5">
                      {DRAW_TIMES.map(time => (
                        <Button 
                          key={time} 
                          variant={selectedHours.includes(time) ? "default" : "outline"}
                          className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(time) ? 'bg-primary' : 'bg-background'}`}
                          onClick={() => toggleHour(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={agregarOActualizarJugada} className={`w-full h-12 font-black uppercase shadow-lg rounded-2xl ${editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                  {editingIndex !== null ? <RotateCcw className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                  {editingIndex !== null ? "Actualizar Jugada" : "Añadir al Ticket"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* TICKET VISUAL */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tu Ticket en vivo:</label>
          <div className="bg-white text-slate-900 p-8 font-mono shadow-[0_30px_60px_rgba(0,0,0,0.1)] rounded-sm border-t-[14px] border-primary relative min-h-[450px]">
             <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-6">
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.3em]">Animalytics Pro Ticket</p>
             </div>
             
             <div className="space-y-5">
                <div className="bg-slate-50 p-3 rounded-xl border border-dashed text-[10px] font-bold">
                  <p className="text-primary text-[8px] uppercase tracking-widest mb-1">Pagar premios a:</p>
                  <p>🏦 BANCO: {userBanco || '---'}</p>
                  <p>📞 PM: {userPM || '---'}</p>
                </div>

               {currentJugadas.map((j, i) => (
                 <div key={i} className={`text-[12px] border-b border-dotted border-slate-300 pb-3 flex justify-between items-center ${editingIndex === i ? 'bg-amber-50 p-2 rounded-lg' : ''}`}>
                    <div className="flex-1">
                      <div className="flex justify-between font-black uppercase">
                        <span className="text-primary">{j.loteria}</span>
                        <span className="text-lg">#{j.numero}</span>
                      </div>
                      <div className="text-[9px] mt-1 opacity-70 leading-relaxed italic">
                        Sorteos: {j.horas.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                       <span className="font-black text-right text-sm">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <div className="flex gap-1">
                         <button onClick={() => prepararEdicion(i)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                         <button onClick={() => borrarLinea(i)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs">Ticket Vacío</p></div>}
             </div>

             <div className="mt-8 flex justify-between font-black text-xl border-t-2 border-slate-900 pt-4 uppercase italic">
               <span>Total Bs:</span>
               <span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)}</span>
             </div>

             <Button 
                disabled={!selectedAgencia || currentJugadas.length === 0} 
                onClick={finalizarTicket}
                className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-3"
             >
                <Send size={24} /> ENVIAR TICKET Y CAPTURE
             </Button>
          </div>
        </div>
      </section>

      {/* HISTORIAL TICKETS */}
      <section className="space-y-6 pt-16 border-t-4 border-dashed border-muted">
        <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">
          <History className="bg-primary text-white rounded-full p-1" /> Mis Jugadas Guardadas
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
                  <button onClick={() => eliminarTicket(ticket.id)} className="text-destructive hover:scale-110 transition-transform"><Trash2 size={20}/></button>
                </div>

                <div className="space-y-3 py-3 border-y-2 border-dashed border-muted">
                  {ticket.jugadas.map((play, idx) => {
                    const gano = verificarPremio(play);
                    return (
                      <div key={idx} className={`p-3 rounded-2xl flex justify-between items-center transition-all ${gano ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-inner' : 'bg-muted/30 border border-transparent'}`}>
                        <div className="text-left">
                          <p className="text-[9px] font-black uppercase text-muted-foreground leading-none mb-1">{play.loteria}</p>
                          <p className="font-black text-xl tracking-tighter">#{play.numero}</p>
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
                  <span className="text-xs uppercase opacity-60 tracking-widest">Total Ticket:</span>
                  <span className="text-xl text-emerald-600 tracking-tighter">{ticket.total.toFixed(2)} Bs</span>
                </div>
                
                <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase italic rounded-xl border-2 hover:bg-primary/5 gap-2" onClick={() => mandarWhatsApp(ticket)}>
                   <RotateCcw size={14}/> Re-enviar WhatsApp
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
