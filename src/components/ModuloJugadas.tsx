import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Plus, Trash2, Pencil, 
  Wallet, Clock, ReceiptText, RotateCcw,
  Trash
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
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  // Formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Cargar agencias
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
        
        // Cargar historial y datos locales
        const localHistory = localStorage.getItem('tickets_history_v_final');
        if (localHistory) setSavedTickets(JSON.parse(localHistory));
        
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
      } catch (e) { 
        console.error("Error inicializando bunker:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, []);

  // --- LÓGICA DE APOYO ---

  const toggleHour = (hora: string) => {
    setSelectedHours(prev => 
      prev.includes(hora) ? prev.filter(h => h !== hora) : [...prev, hora]
    );
  };

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      toast.error("Faltan datos");
      return;
    }
    
    let numeroFinal = num.trim();
    if (numeroFinal !== "0" && numeroFinal !== "00" && numeroFinal.length === 1) {
        numeroFinal = numeroFinal.padStart(2, '0');
    }

    const nueva: Play = { 
      loteria: lot, 
      numero: numeroFinal, 
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

  const registrarTicketLocalmente = () => {
    localStorage.setItem('u_pm_banco', userBanco);
    localStorage.setItem('u_pm_tlf', userPM);
    localStorage.setItem('u_pm_cedula', userCedula);

    const ticket = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia?.nombre,
      fecha: new Date().toISOString(),
      jugadas: currentJugadas,
      total: currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0)
    };

    const updatedHistory = [ticket, ...savedTickets];
    setSavedTickets(updatedHistory);
    localStorage.setItem('tickets_history_v_final', JSON.stringify(updatedHistory));
  };

  // --- GENERACIÓN DE LINK BLINDADO PARA OPERA ---
  const getWhatsAppLink = () => {
    if (!selectedAgencia?.whatsapp || currentJugadas.length === 0) return "#";
    
    // 1. Limpieza extrema del número
    let tlf = selectedAgencia.whatsapp.toString().replace(/\D/g, '');
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    // 2. Construcción del mensaje
    let msg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n`;
    msg += `----------------------------\n`;
    msg += `🏦 *BANCO:* ${userBanco || '---'}\n`;
    msg += `📞 *PAGO MÓVIL:* ${userPM || '---'}\n`;
    msg += `🆔 *CÉDULA:* ${userCedula || '---'}\n`;
    msg += `----------------------------\n`;
    
    currentJugadas.forEach((j) => {
      msg += `📍 *${j.loteria.toUpperCase()}*\n`;
      msg += `Animal: *#${j.numero}*\n`;
      msg += `Sorteos: ${j.horas.join(", ")}\n`;
      msg += `Monto: ${j.monto} Bs\n`;
      msg += `---\n`;
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    msg += `*TOTAL A PAGAR:* ${total.toFixed(2)} Bs\n`;
    msg += `----------------------------\n`;
    msg += `📥 _Envío captura de pago adjunta._`;

    // 3. Retorno de URL codificada
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) return <div className="p-20 text-center font-black text-primary">CARGANDO BÚNKER...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* SECCIÓN 1: DATOS */}
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> 1. Tus Datos de Cobro</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold" />
            <div className="grid grid-cols-2 gap-2">
                <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold" />
                <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold" />
            </div>
          </div>

          {/* SECCIÓN 2: AGENCIAS */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">2. Selecciona Agencia</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-3 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: FORMULARIO */}
          <Card className={`border-2 rounded-3xl p-5 space-y-4 shadow-xl ${editingIndex !== null ? 'border-amber-500 bg-amber-50' : 'border-primary/20'}`}>
            <Select value={lot} onValueChange={setLot}>
              <SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                <SelectItem value="La Granjita">La Granjita</SelectItem>
                <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                <SelectItem value="Guacharito">Guacharito</SelectItem>
                <SelectItem value="Selva Plus">Selva Plus</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" />
              <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" />
            </div>
            <div className="space-y-1">
               <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20">
                 <div className="flex flex-wrap gap-1.5">
                   {(DRAW_TIMES || []).map(t => (
                    <Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className="h-8 px-3 text-[10px] font-black" onClick={() => toggleHour(t)}>
                      {t}
                    </Button>
                   ))}
                 </div>
               </ScrollArea>
            </div>
            <Button onClick={agregarOActualizar} className="w-full h-12 font-black uppercase rounded-2xl">
              {editingIndex !== null ? <RotateCcw className="mr-2" /> : <Plus className="mr-2" />} 
              {editingIndex !== null ? "Corregir" : "Añadir"}
            </Button>
          </Card>
        </div>

        {/* TICKET VISUAL */}
        <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary relative">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               <h3 className="font-black text-2xl uppercase italic">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
             </div>
             <div className="space-y-4">
               {currentJugadas.map((j, i) => (
                 <div key={i} className="text-[12px] border-b border-dotted pb-2 flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-black uppercase">{j.loteria} - #{j.numero}</p>
                      <p className="text-[9px] opacity-70">{j.horas.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-black">{(j.monto * j.horas.length).toFixed(2)}</span>
                       <button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-600"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4">
               <span>TOTAL:</span>
               <span>{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs</span>
             </div>
             
             <a 
               href={getWhatsAppLink()} 
               target="_blank" 
               rel="noopener noreferrer" // Clave para Opera
               className={`w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${(!selectedAgencia || currentJugadas.length === 0 || !userPM) ? 'opacity-50 pointer-events-none' : ''}`}
               onClick={() => registrarTicketLocalmente()}
             >
                <Send size={24} /> ENVIAR JUGADA
             </a>
             
             {currentJugadas.length > 0 && (
               <button onClick={() => setCurrentJugadas([])} className="w-full mt-4 text-[10px] font-black text-red-500 uppercase">
                 Limpiar Ticket
               </button>
             )}
        </div>
      </section>
    </div>
  );
}
