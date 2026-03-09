import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, Trash2, Pencil, CheckCircle2, History, Ticket, Clock } from "lucide-react";
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

  useEffect(() => {
    const init = async () => {
      // 1. Cargar Agencias
      const { data: agData } = await supabase.from('agencias').select('*').eq('activa', true);
      if (agData) setAgencias(agData);

      // 2. Cargar Resultados de hoy para verificar premios
      const hoy = new Date().toISOString().split('T')[0];
      const { data: resData } = await supabase.from('lottery_results').select('*').eq('draw_date', hoy);
      if (resData) setTodayResults(resData);

      // 3. Cargar Tickets Guardados del LocalStorage
      const localTickets = localStorage.getItem('animalytics_tickets');
      if (localTickets) setSavedTickets(JSON.parse(localTickets));

      setLoading(false);
    };
    init();
  }, []);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const agregarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Completa Lotería, Número, Monto y al menos una Hora");
    }
    const nuevaPlay: Play = {
      loteria: lot,
      numero: num.padStart(2, '0'),
      monto: parseFloat(mon),
      horas: selectedHours
    };
    setCurrentJugadas([...currentJugadas, nuevaPlay]);
    setNum(""); setMon(""); setSelectedHours([]);
    toast.success("Añadido al ticket");
  };

  const guardarTicket = () => {
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
    
    // Generar mensaje de WhatsApp
    enviarWhatsApp(nuevoTicket);
    
    // Resetear actual
    setCurrentJugadas([]);
    setSelectedAgencia(null);
  };

  const eliminarTicket = (id: string) => {
    const filtrados = savedTickets.filter(t => t.id !== id);
    setSavedTickets(filtrados);
    localStorage.setItem('animalytics_tickets', JSON.stringify(filtrados));
    toast.info("Ticket eliminado");
  };

  const enviarWhatsApp = (ticket: SavedTicket) => {
    let msg = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A`;
    msg += `----------------------------%0A`;
    msg += `*Agencia:* ${ticket.agenciaNombre}%0A`;
    msg += `----------------------------%0A`;
    
    ticket.jugadas.forEach(j => {
      msg += `📍 *${j.loteria.toUpperCase()}*%0A`;
      msg += `Animal: *#${j.numero}*%0A`;
      msg += `Horas: ${j.horas.join(", ")}%0A`;
      msg += `Monto x Sorteo: ${j.monto} Bs%0A`;
      msg += `Sub-total: ${j.monto * j.horas.length} Bs%0A`;
      msg += `---%0A`;
    });

    msg += `*TOTAL A PAGAR:* ${ticket.total.toFixed(2)} Bs%0A`;
    msg += `----------------------------%0A_Por favor procese mi jugada._`;

    window.open(`https://wa.me/${ticket.agenciaWhatsapp}?text=${msg}`, '_blank');
  };

  const checkWin = (play: Play) => {
    // Busca si en los resultados de hoy existe la combinacion loteria + hora + numero
    return play.horas.some(h => 
      todayResults.find(r => 
        r.lottery_type.toLowerCase().includes(play.loteria.toLowerCase().replace(" ","_")) && 
        r.draw_time.includes(h) && 
        r.result_number === play.numero
      )
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10">
      
      {/* 1. SECCIÓN DE CREACIÓN */}
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="text-left space-y-4">
            <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">
              <Plus className="bg-primary text-white rounded-full p-1" /> Nueva Jugada
            </h2>
            
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paso 1: Elige Agencia</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {agencias.map(ag => (
                <button 
                  key={ag.id} 
                  onClick={() => setSelectedAgencia(ag)}
                  className={`p-2 border-2 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10' : 'bg-card border-border'}`}
                >
                  {ag.nombre}
                </button>
              ))}
            </div>

            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="p-4 bg-muted/20 space-y-4">
                <Select onValueChange={setLot}>
                  <SelectTrigger className="font-bold uppercase h-12"><SelectValue placeholder="Lotería" /></SelectTrigger>
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
                  <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-12 text-center font-black text-xl" />
                  <Input placeholder="Monto Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-12 text-center font-black text-xl" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Seleccionar Horas:</label>
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

                <Button onClick={agregarJugada} className="w-full h-12 font-black uppercase italic text-lg shadow-lg">
                  Añadir al Ticket
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* VISTA PREVIA DEL TICKET ACTUAL */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left block">Paso 2: Confirmar y Enviar</label>
          <div className="bg-[#f8f9fa] text-slate-800 p-6 font-mono shadow-2xl rounded-sm border-t-8 border-primary relative">
             <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
               <h3 className="font-black text-xl uppercase">{selectedAgencia?.nombre || "NUEVO TICKET"}</h3>
               <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Animalytics Pro Intelligence</p>
             </div>
             
             <div className="space-y-4 min-h-[150px]">
               {currentJugadas.map((j, i) => (
                 <div key={i} className="text-xs border-b border-dotted pb-2">
                    <div className="flex justify-between font-black">
                      <span>{j.loteria.toUpperCase()}</span>
                      <span className="text-primary">#{j.numero}</span>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 italic">
                      <span className="w-2/3 truncate">Horas: {j.horas.join(", ")}</span>
                      <span>{j.monto} x {j.horas.length} = {(j.monto * j.horas.length).toFixed(2)}</span>
                    </div>
                 </div>
               ))}
               {currentJugadas.length === 0 && <p className="text-center py-10 opacity-30 italic">No hay jugadas añadidas...</p>}
             </div>

             <div className="mt-6 flex justify-between font-black text-lg border-t-2 pt-2">
               <span>TOTAL:</span>
               <span className="text-emerald-700">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs</span>
             </div>

             <Button 
                disabled={!selectedAgencia || currentJugadas.length === 0} 
                onClick={guardarTicket}
                className="w-full h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-6 rounded-xl font-black italic gap-2 shadow-xl"
             >
                <Send size={20} /> ENVIAR Y GUARDAR
             </Button>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE HISTORIAL Y ACIERTOS */}
      <section className="space-y-6 pt-10 border-t-4 border-dashed border-muted">
        <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2">
          <History className="bg-primary text-white rounded-full p-1" /> Mis Tickets de Hoy
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTickets.map(ticket => (
            <Card key={ticket.id} className="border-2 border-border hover:border-primary/40 transition-all shadow-md relative overflow-hidden bg-card">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">{new Date(ticket.fecha).toLocaleTimeString()}</p>
                    <h4 className="font-black text-sm uppercase text-primary">{ticket.agenciaNombre}</h4>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => eliminarTicket(ticket.id)}>
                    <Trash2 size={16}/>
                  </Button>
                </div>

                <div className="space-y-2 py-2 border-y border-dashed">
                  {ticket.jugadas.map((play, idx) => {
                    const win = checkWin(play);
                    return (
                      <div key={idx} className={`p-2 rounded-lg flex justify-between items-center ${win ? 'bg-emerald-500/10 border border-emerald-500/50' : 'bg-muted/30'}`}>
                        <div className="text-left">
                          <p className="text-[9px] font-black uppercase leading-none">{play.loteria}</p>
                          <p className="font-black text-base">#{play.numero}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           {win ? (
                             <Badge className="bg-emerald-600 text-[8px] animate-bounce"><CheckCircle2 size={8} className="mr-1"/> GANÓ</Badge>
                           ) : (
                             <span className="text-[8px] font-bold text-muted-foreground">Pendiente</span>
                           )}
                           <span className="text-xs font-bold">{(play.monto * play.horas.length).toFixed(2)} Bs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center font-black">
                  <span className="text-xs uppercase">Total Ticket:</span>
                  <span className="text-lg text-emerald-600">{ticket.total.toFixed(2)} Bs</span>
                </div>
                
                <Button variant="outline" className="w-full h-8 text-[10px] font-black uppercase italic" onClick={() => enviarWhatsApp(ticket)}>
                   Re-enviar WhatsApp
                </Button>
              </div>
            </Card>
          ))}
          {savedTickets.length === 0 && (
            <div className="col-span-full p-10 text-center border-2 border-dashed rounded-3xl opacity-30 font-black uppercase italic">
              Aún no tienes tickets guardados hoy.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
