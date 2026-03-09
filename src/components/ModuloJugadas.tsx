import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Plus, Trash2, Pencil, 
  Wallet, Clock, ReceiptText, RotateCcw
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

  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");

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
        const local = localStorage.getItem('tickets_history_v_final');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const toggleHour = (hora: string) => {
    setSelectedHours(prev => 
      prev.includes(hora) ? prev.filter(h => h !== hora) : [...prev, hora]
    );
  };

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Faltan datos");
    let numeroFinal = num.trim();
    if (numeroFinal !== "0" && numeroFinal !== "00" && numeroFinal.length === 1) numeroFinal = numeroFinal.padStart(2, '0');
    
    const nueva = { loteria: lot, numero: numeroFinal, monto: parseFloat(mon), horas: [...selectedHours].sort() };
    if (editingIndex !== null) {
      const temp = [...currentJugadas]; temp[editingIndex] = nueva;
      setCurrentJugadas(temp); setEditingIndex(null);
    } else {
      setCurrentJugadas([...currentJugadas, nueva]);
    }
    setNum(""); setMon(""); setSelectedHours([]);
  };

  const registrarTicketLocalmente = () => {
    localStorage.setItem('u_pm_banco', userBanco);
    localStorage.setItem('u_pm_tlf', userPM);
    localStorage.setItem('u_pm_cedula', userCedula);
    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    const ticket = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia?.nombre,
      fecha: new Date().toISOString(),
      total,
      jugadas: currentJugadas
    };
    const updatedHistory = [ticket, ...savedTickets];
    setSavedTickets(updatedHistory);
    localStorage.setItem('tickets_history_v_final', JSON.stringify(updatedHistory));
  };

  // --- FUNCIÓN DE ENVÍO REPARADA DEFINITIVAMENTE ---
  const handleSendWhatsApp = () => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) {
        return toast.error("Datos incompletos");
    }

    // 1. Limpieza de número (Solo dígitos)
    let tlf = selectedAgencia.whatsapp.toString().replace(/\D/g, '');
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    // 2. Construcción del mensaje con Codificación Manual
    // He quitado los emojis para asegurar que el canal no se obstruya en móviles
    let msg = `SOLICITUD DE JUGADA - ANIMALYTICS PRO\n`;
    msg += `----------------------------\n`;
    msg += `BANCO: ${userBanco}\n`;
    msg += `PAGO MOVIL: ${userPM}\n`;
    msg += `CEDULA: ${userCedula}\n`;
    msg += `----------------------------\n\n`;
    
    currentJugadas.forEach((j) => {
      msg += `LOTERIA: ${j.loteria.toUpperCase()}\n`;
      msg += `ANIMAL: ${j.numero}\n`; 
      msg += `HORAS: ${j.horas.join(", ")}\n`;
      msg += `MONTO: ${j.monto} Bs x sorteo\n`;
      msg += `----------\n`;
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    msg += `\nTOTAL A PAGAR: ${total.toFixed(2)} Bs\n`;
    msg += `----------------------------\n`;
    msg += `Envio comprobante adjunto.`;

    // 3. Registro Local
    registrarTicketLocalmente();

    // 4. CODIFICACIÓN MANUAL ESTRICTA (Solución al error de recorte)
    // Usamos encodeURIComponent y reemplazamos manualmente el asterisco por su código hexadecimal (%2A)
    // para que el navegador no lo use como carácter de ruptura.
    let encodedText = encodeURIComponent(msg)
      .replace(/\*/g, '%2A')
      .replace(/#/g, '%23')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');

    // 5. El Link de la API de WhatsApp (Más robusto para móviles)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${tlf}&text=${encodedText}`;

    // 6. Redirección Directa
    window.location.href = whatsappUrl;
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-primary italic text-xl">Iniciando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> 1. Datos para Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2">
                <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" />
                <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">2. Agencia de Envío</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-3 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          <Card className={`border-2 rounded-3xl p-5 space-y-4 shadow-xl ${editingIndex !== null ? 'border-amber-500 bg-amber-50' : 'border-primary/20'}`}>
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
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-black text-center text-xl" />
              <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-xl" />
            </div>
            <div className="space-y-1">
               <ScrollArea className="h-24 border rounded-2xl p-3 bg-muted/20 shadow-inner">
                 <div className="flex flex-wrap gap-1.5">
                   {DRAW_TIMES.map(t => (
                    <Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-8 px-3 text-[10px] font-black rounded-lg ${selectedHours.includes(t) ? 'bg-primary' : 'bg-background'}`} onClick={() => toggleHour(t)}>{t}</Button>
                   ))}
                 </div>
               </ScrollArea>
            </div>
            <Button onClick={agregarOActualizar} className="w-full h-12 font-black uppercase rounded-2xl shadow-md">
              {editingIndex !== null ? <RotateCcw className="mr-2" /> : <Plus className="mr-2" />} 
              {editingIndex !== null ? "Corregir Línea" : "Añadir al Ticket"}
            </Button>
          </Card>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-white text-slate-900 p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-primary min-h-[450px] relative">
             <div className="text-center border-b-2 border-dashed pb-4 mb-6">
               <h3 className="font-black text-2xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
               <p className="text-[9px] opacity-60 uppercase font-black">Animalytics Pro Ticket</p>
             </div>
             <div className="space-y-5">
               {currentJugadas.map((j, i) => (
                 <div key={i} className="text-[12px] border-b border-dotted pb-3 flex justify-between items-center">
                    <div className="flex-1 text-left">
                      <div className="flex justify-between font-black uppercase"><span className="text-primary">{j.loteria}</span><span className="text-lg">#{j.numero}</span></div>
                      <p className="text-[9px] opacity-70 italic leading-none">Horas: {j.horas.join(", ")}</p>
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
               {currentJugadas.length === 0 && <div className="text-center py-20 opacity-20 flex flex-col items-center gap-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs tracking-widest text-center italic">Ticket Vacío</p></div>}
             </div>
             
             <div className="mt-8 flex justify-between font-black text-xl border-t-2 pt-4 uppercase italic">
               <span>TOTAL:</span>
               <span className="text-emerald-700 underline decoration-double">
                {currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs
               </span>
             </div>
             
             <Button 
               onClick={handleSendWhatsApp}
               disabled={!selectedAgencia || currentJugadas.length === 0 || !userPM}
               className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
             >
                <Send size={24} /> ENVIAR POR WHATSAPP
             </Button>

             {currentJugadas.length > 0 && (
               <button onClick={() => { setCurrentJugadas([]); setSelectedAgencia(null); }} className="w-full mt-6 text-[10px] font-black uppercase text-red-500 hover:text-red-700 opacity-50 hover:opacity-100 transition-opacity">
                 ❌ Limpiar Mesa de Trabajo
               </button>
             )}
          </div>
        </div>
      </section>
    </div>
  );
}
