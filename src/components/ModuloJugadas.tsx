import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Pencil, Wallet, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");

  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

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

  const agregarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Faltan datos");
    let n = num.trim().padStart(2, '0');
    const nueva = { loteria: lot, numero: n, monto: parseFloat(mon), horas: [...selectedHours] };
    setCurrentJugadas([...currentJugadas, nueva]);
    setNum(""); setMon(""); setSelectedHours([]);
    toast.success("Añadida");
  };

  // --- GENERACIÓN DEL LINK (SÚPER SEGURO PARA MÓVILES) ---
  const urlWhatsApp = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";

    // 1. Limpiar Telefono
    let tlf = selectedAgencia.whatsapp.toString().replace(/\D/g, '');
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    // 2. Construir mensaje (Sin símbolos raros para evitar recortes)
    let texto = "SOLICITUD DE JUGADA\n";
    texto += "------------------\n";
    texto += "PAGO: " + userBanco + " / " + userPM + " / " + userCedula + "\n";
    texto += "------------------\n\n";

    currentJugadas.forEach((j) => {
      texto += j.loteria.toUpperCase() + "\n";
      texto += "Animal: " + j.numero + "\n";
      texto += "Sorteos: " + j.horas.join(",") + "\n";
      texto += "Monto: " + j.monto + "Bs\n";
      texto += "-\n";
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    texto += "\nTOTAL: " + total.toFixed(2) + " Bs";

    return `https://wa.me/${tlf}?text=${encodeURIComponent(texto)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  const registrarYEnviar = () => {
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
    const updated = [ticket, ...savedTickets];
    setSavedTickets(updated);
    localStorage.setItem('tickets_history_v_final', JSON.stringify(updated));
    toast.success("Abriendo WhatsApp...");
  };

  if (loading) return <div className="p-20 text-center font-black">CARGANDO BÚNKER...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 text-left">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-5 bg-primary/5 border-none shadow-inner space-y-4 rounded-3xl">
            <label className="text-[10px] font-black uppercase text-primary">1. Datos de Pago</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-white font-bold" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-white font-bold" />
              <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-white font-bold" />
            </div>
          </Card>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-50">2. Agencia</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10' : 'bg-white border-transparent'}`}>
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          <Card className="p-6 space-y-4 border-2 border-primary/20 shadow-xl rounded-[30px]">
            <Select value={lot} onValueChange={setLot}>
              <SelectTrigger className="font-black h-12 uppercase border-none bg-muted/30"><SelectValue placeholder="Lotería" /></SelectTrigger>
              <SelectContent className="font-bold">
                <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                <SelectItem value="La Granjita">La Granjita</SelectItem>
                <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                <SelectItem value="Guacharito">Guacharito</SelectItem>
                <SelectItem value="Selva Plus">Selva Plus</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-14 font-black text-center text-2xl bg-muted/30 border-none" />
              <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-14 font-black text-center text-2xl bg-muted/30 border-none" />
            </div>
            <ScrollArea className="h-28 border-none bg-muted/20 rounded-2xl p-2">
              <div className="flex flex-wrap gap-2">
                {DRAW_TIMES.map(t => (
                  <Button key={t} variant={selectedHours.includes(t) ? "default" : "outline"} className={`h-9 px-4 text-[10px] font-bold rounded-full ${selectedHours.includes(t) ? 'bg-primary' : 'bg-white'}`} onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}>
                    {t}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={agregarJugada} className="w-full h-14 font-black uppercase rounded-2xl text-lg shadow-md"><Plus className="mr-2"/> Añadir al Ticket</Button>
          </Card>
        </div>

        <div>
          <div className="bg-white p-8 font-mono shadow-2xl rounded-sm border-t-[16px] border-primary min-h-[500px] flex flex-col relative">
            <div className="text-center border-b-2 border-dashed pb-4 mb-6">
              <h3 className="font-black text-2xl uppercase italic">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
            </div>
            <div className="flex-1 space-y-4">
              {currentJugadas.map((j, i) => (
                <div key={i} className="text-xs border-b border-dotted pb-2 flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-black uppercase text-primary">{j.loteria} - #{j.numero}</p>
                    <p className="text-[10px] opacity-60">{j.horas.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              {currentJugadas.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase text-xs">Ticket Vacío</p>}
            </div>
            <div className="mt-6 border-t-4 border-double pt-4 flex justify-between font-black text-2xl italic">
              <span>TOTAL:</span>
              <span>{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs</span>
            </div>

            {/* BOTÓN FINAL CORREGIDO: Enlace directo <a> para evitar bloqueos del sistema operativo */}
            <a 
              href={urlWhatsApp} 
              onClick={registrarYEnviar}
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full h-16 bg-[#25D366] text-white mt-10 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${urlWhatsApp === "#" ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Send size={24} /> ENVIAR POR WHATSAPP
            </a>
            
            {currentJugadas.length > 0 && (
              <button onClick={() => setCurrentJugadas([])} className="mt-4 text-[10px] uppercase font-bold text-red-500 opacity-50 mx-auto">Limpiar Ticket</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
