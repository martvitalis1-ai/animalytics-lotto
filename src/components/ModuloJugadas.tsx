import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, Trash2, Pencil, CheckCircle2, History, Clock, RotateCcw } from "lucide-react";
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
}

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<Play[]>([]);
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
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

      const localTickets = localStorage.getItem('animalytics_tickets');
      if (localTickets) setSavedTickets(JSON.parse(localTickets));
      setLoading(false);
    };
    init();
  }, []);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const agregarOActualizarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Completa todos los campos y selecciona al menos una hora");
    }

    const nuevaPlay: Play = {
      loteria: lot,
      numero: num.padStart(2, '0'),
      monto: parseFloat(mon),
      horas: [...selectedHours].sort()
    };

    if (editingIndex !== null) {
      const temp = [...currentJugadas];
      temp[editingIndex] = nuevaPlay;
      setCurrentJugadas(temp);
      setEditingIndex(null);
      toast.success("Jugada actualizada");
    } else {
      setCurrentJugadas([...currentJugadas, nuevaPlay]);
      toast.success("Añadido al ticket");
    }

    // Reset formulario
    setNum(""); setMon(""); setSelectedHours([]);
  };

  const prepararEdicion = (index: number) => {
    const item = currentJugadas[index];
    setLot(item.loteria);
    setNum(item.numero);
    setMon(item.monto.toString());
    setSelectedHours(item.horas);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quitarJugada = (index: number) => {
    setCurrentJugadas(currentJugadas.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const guardarYEnviar = () => {
    if (!selectedAgencia || currentJugadas.length === 0) return;
    
    const nuevoTicket: SavedTicket = {
      id: Math.random().toString(36).substring(2, 9),
      agenciaNombre: selectedAgencia.nombre,
      agenciaWhatsapp: selectedAgencia.whatsapp,
      fecha: new Date().toISOString(),
      jugadas: currentJugadas,
      total: currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0)
    };

    const nuevosTickets = [nuevoTicket, ...savedTickets];
    setSavedTickets(nuevosTickets);
    localStorage.setItem('animalytics_tickets', JSON.stringify(nuevosTickets));
    
    enviarWhatsApp(nuevoTicket);
    setCurrentJugadas([]);
    setSelectedAgencia(null);
  };

  const eliminarTicket = (id: string) => {
    const filtrados = savedTickets.filter(t => t.id !== id);
    setSavedTickets(filtrados);
    localStorage.setItem('animalytics_tickets', JSON.stringify(filtrados));
  };

  const enviarWhatsApp = (ticket: SavedTicket) => {
    let msg = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A----------------------------%0A*Agencia:* ${ticket.agenciaNombre}%0A----------------------------%0A`;
    ticket.jugadas.forEach(j => {
      msg += `📍 *${j.loteria.toUpperCase()}*%0AAnimal: *#${j.numero}*%0AHoras: ${j.horas.join(", ")}%0AMonto: ${j.monto} Bs x sorteo%0A---%0A`;
    });
    msg += `*TOTAL:* ${ticket.total.toFixed(2)} Bs%0A----------------------------%0A_Enviado desde mi App._`;
    window.open(`https://wa.me/${ticket.agenciaWhatsapp}?text=${msg}`, '_blank');
  };

  const checkWin = (play: Play) => {
    return play.horas.some(h => 
      todayResults.find(r => 
        r.lottery_type.toLowerCase().includes(play.loteria.toLowerCase().replace(" ","_")) && 
        r.draw_time.includes(h) && 
        r.result_number === play.numero
      )
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase italic text-primary">Sincronizando con Agencias...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">💰 Crear Jugada</h2>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1. Selecciona Agencia:</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button 
                  key={ag.id} 
                  onClick={() => setSelectedAgencia(ag)}
                  className={`px-3 py-2 border-2 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-md' : 'bg-card border-border'}`}
                >
                  {ag.nombre}
                </button>
              ))}
            </div>

            <Card className={`border-2 transition-all ${editingIndex !== null ? 'border-amber-500 bg-amber-500/5' : 'border-primary/20'}`}>
              <div className="p-4 space-y-4">
                <Select value={lot} onValueChange={setLot}>
                  <SelectTrigger className="font-bold uppercase"><SelectValue placeholder="Lotería" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                    <SelectItem value="La Granjita">La Granjita</SelectItem>
                    <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                    <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                    <SelectItem value="Guacharito">Guacharito</SelectItem>
                    <SelectItem value="Selva Plus">Selva Plus</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="font-black text-center text-lg" />
                  <Input placeholder="Monto" type="number" value={mon} onChange={e => setMon(e.target.value)} className="font-black text-center text-lg" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Sorteos:</label>
                  <div className="flex flex-wrap gap-1">
                    {DRAW_TIMES.map(time => (
                      <Button 
                        key={time} 
                        variant={selectedHours.includes(time) ? "default" : "outline"}
                        className={`h-7 px-2 text-[9px] font-bold ${selectedHours.includes(time) ? 'bg-primary' : ''}`}
                        onClick={() => toggleHour(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={agregarOActualizarJugada} className={`w-full h-12 font-black uppercase italic ${editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                  {editingIndex !== null ? <RotateCcw className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                  {editingIndex !== null ? "Actualizar Jugada" : "Añadir al Ticket"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">2. Vista Previa:</label>
          <div className="bg-white text-slate-900 p-6 font-mono shadow-2xl rounded-sm border-t-8 border-primary relative min-h-[350px]">
             <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
               <h3 className="font-black text-lg uppercase">{selectedAgencia?.nombre || "TICKET"}</h3>
               <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Animalytics Pro Ticket</p>
             </div>
             
             <div className="space-y-4">
               {currentJugadas.map((j, i) => (
                 <div key={i} className={`text-[11px] border-b border-dotted pb-2 flex justify-between items-center ${editingIndex === i ? 'bg-amber-50 p-1 rounded' : ''}`}>
                    <div className="flex-1">
                      <div className="flex justify-between font-black uppercase">
                        <span>{j.loteria.substring(0,8)}</span>
                        <span className="text-primary font-black">#{j.numero}</span>
                      </div>
                      <div className="text-[9px] mt-1 opacity-70">
                        Horas: {j.horas.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                       <span className="font-black">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <div className="flex gap-1">
                         <button onClick={() => prepararEdicion(i)} className="text-blue-600 p-1"><Pencil size={14}/></button>
                         <button onClick={() => quitarJugada(i)} className="text-red-600 p-1"><Trash2 size={14}/></button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>

             <div className="mt-6 flex justify-between font-black text-base border-t-2 pt-2 uppercase">
               <span>Total:</span>
               <span className="text-emerald-700">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs</span>
             </div>

             <Button 
                disabled={!selectedAgencia || currentJugadas.length === 0} 
                onClick={guardarYEnviar}
                className="w-full h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-8 rounded-xl font-black italic gap-2 shadow-xl"
             >
                <Send size={20} /> ENVIAR A WHATSAPP
             </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-10 border-t-4 border-dashed border-muted">
        <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">
          <History className="bg-primary text-white rounded-full p-1" /> Tickets Guardados
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTickets.map(ticket => (
            <Card key={ticket.id} className="border-2 border-border hover:border-primary/40 transition-all shadow-md bg-card overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase">{new Date(ticket.fecha).toLocaleString()}</p>
                    <h4 className="font-black text-sm uppercase text-primary truncate">{ticket.agenciaNombre}</h4>
                  </div>
                  <button onClick={() => eliminarTicket(ticket.id)} className="text-destructive"><Trash2 size={18}/></button>
                </div>

                <div className="space-y-2 py-2 border-y border-dashed">
                  {ticket.jugadas.map((play, idx) => {
                    const win = checkWin(play);
                    return (
                      <div key={idx} className={`p-2 rounded-lg flex justify-between items-center ${win ? 'bg-emerald-500/10 border border-emerald-500/50' : 'bg-muted/20'}`}>
                        <div className="text-left">
                          <p className="text-[8px] font-black uppercase">{play.loteria}</p>
                          <p className="font-black text-lg">#{play.numero}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           {win ? <Badge className="bg-emerald-600 text-[8px] animate-bounce">¡GANÓ! 💰</Badge> : <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Pendiente</span>}
                           <span className="text-xs font-bold">{(play.monto * play.horas.length).toFixed(2)} Bs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center font-black">
                  <span className="text-xs">TOTAL:</span>
                  <span className="text-lg text-emerald-600">{ticket.total.toFixed(2)} Bs</span>
                </div>
                
                <Button variant="outline" className="w-full h-8 text-[9px] font-black uppercase italic" onClick={() => enviarWhatsApp(ticket)}>Re-enviar WhatsApp</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
