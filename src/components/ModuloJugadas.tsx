import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Pencil, Landmark, Wallet, CheckCircle2, History, Clock, ReceiptText, Store, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [todayResults, setTodayResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");

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

  const generarTicketTexto = () => {
    let ticketMsg = `*SOLICITUD DE JUGADA - ANIMALYTICS PRO*\n----------------------------\n*MIS DATOS DE COBRO:*\n🏦 Banco: ${userBanco}\n📞 PM: ${userPM}\n🆔 CI: ${userCedula}\n----------------------------\n`;
    currentJugadas.forEach((j: any) => {
      ticketMsg += `📍 *${j.loteria.toUpperCase()}*\nAnimal: *#${j.numero}*\nSorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs x sorteo\n---\n`;
    });
    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    ticketMsg += `*TOTAL A PAGAR:* ${total.toFixed(2)} Bs\n----------------------------\n📥 _Envío captura de pago adjunta._`;
    return ticketMsg;
  };

  const agregarOActualizar = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Datos incompletos");
    
    // CORRECCIÓN DE RANGOS Y DELFÍN
    let n = parseInt(num);
    let numFinal = "";
    
    if (n === 0 && num !== "00") numFinal = "0"; // Delfín es 0
    else if (num === "00") numFinal = "00"; // Ballena es 00
    else {
      // Aplicar tope según lotería
      if (lot === "Guácharo Activo" && n > 75) n = n % 76;
      if (lot !== "Guacharito" && lot !== "Guácharo Activo" && n > 36) n = n % 37;
      numFinal = n < 10 ? "0" + n : n.toString();
    }

    const nueva = { loteria: lot, numero: numFinal, monto: parseFloat(mon), horas: [...selectedHours].sort() };
    
    if (editingIndex !== null) {
      const temp = [...currentJugadas]; temp[editingIndex] = nueva;
      setCurrentJugadas(temp); setEditingIndex(null);
    } else {
      setCurrentJugadas([...currentJugadas, nueva]);
    }
    setNum(""); setMon(""); setSelectedHours([]);
  };

  // Link de WhatsApp dinámico
  const phoneRaw = selectedAgencia?.whatsapp?.toString() || "";
  const phoneClean = phoneRaw.includes("wa.link") ? phoneRaw : `https://wa.me/${phoneRaw.replace(/\D/g, '')}?text=${encodeURIComponent(generarTicketTexto())}`;

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-primary italic uppercase tracking-widest">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-10 text-left">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 space-y-4 shadow-inner text-left">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Wallet size={14}/> Mis Datos para cobrar Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-background font-bold text-xs" />
            <div className="grid grid-cols-2 gap-2">
                <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-background font-bold text-xs" />
                <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-background font-bold text-xs" />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">Paso 1: Selecciona Agencia Aliada</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-lg' : 'bg-card border-border'}`}>
                  {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover border" alt="logo" />}
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {selectedAgencia && (
            <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase italic space-y-1 shadow-sm animate-in fade-in">
              <p className="text-emerald-600 text-[8px] uppercase tracking-widest">🏦 Pagar a Agencia:</p>
              <p>{selectedAgencia?.banco_nombre || '---'} | {selectedAgencia?.banco_cedula || '---'} | {selectedAgencia?.banco_telefono || '---'}</p>
            </div>
          )}

          <Card className={`border-2 rounded-3xl p-5 space-y-4 shadow-xl ${editingIndex !== null ? 'border-amber-500 bg-amber-50' : 'border-primary/20'}`}>
            <Select value={lot} onValueChange={setLot}><SelectTrigger className="font-black h-11 uppercase"><SelectValue placeholder="Lotería" /></SelectTrigger><SelectContent className="font-bold"><SelectItem value="Lotto Activo">Lotto Activo</SelectItem><SelectItem value="La Granjita">La Granjita</SelectItem><SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem><SelectItem value="Lotto Rey">Lotto Rey</SelectItem><SelectItem value="Guacharito">Guacharito</SelectItem><SelectItem value="Selva Plus">Selva Plus</SelectItem></SelectContent></Select>
            <div className="grid grid-cols-2 gap-2"><Input placeholder="An
