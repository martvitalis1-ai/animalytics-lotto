import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Plus, ReceiptText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [jugada, setJugada] = useState<{loteria: string, numero: string, monto: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");

  useEffect(() => {
    const fetchAgencias = async () => {
      try {
        const { data, error } = await supabase.from('agencias').select('*').eq('activa', true);
        if (error) throw error;
        if (data) setAgencias(data);
      } catch (e: any) {
        console.error("Error cargando agencias:", e);
        toast.error("Error al conectar con el búnker.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgencias();
  }, []);

  const agregarLinea = () => {
    if (!lot || !num || !mon) return toast.error("Faltan datos de la jugada");
    setJugada([...jugada, { loteria: lot, numero: num, monto: mon }]);
    setNum(""); setMon("");
  };

  const quitarLinea = (index: number) => {
    setJugada(jugada.filter((_, i) => i !== index));
  };

  const enviarWhatsApp = () => {
    if (!selectedAgencia || jugada.length === 0) return;
    
    let ticketTexto = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A----------------------------%0A*Agencia:* ${selectedAgencia.nombre}%0A*Fecha:* ${new Date().toLocaleDateString()}%0A----------------------------%0A`;
    
    let total = 0;
    jugada.forEach(j => {
      ticketTexto += `📍 ${j.loteria.toUpperCase()}%0A   Animal: *#${j.numero}* - Monto: ${j.monto}%0A`;
      total += parseFloat(j.monto);
    });

    ticketTexto += `----------------------------%0A*TOTAL A PAGAR:* ${total.toFixed(2)} Bs%0A----------------------------%0A_Orden enviada desde mi App Animalytics Pro._`;

    window.open(`https://wa.me/${selectedAgencia.whatsapp}?text=${ticketTexto}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse uppercase italic text-primary">Cargando Agencias Autorizadas...</div>;

  if (agencias.length === 0) return (
    <div className="p-10 text-center bg-amber-50 rounded-2xl border-2 border-amber-200 m-4">
      <AlertTriangle className="mx-auto w-12 h-12 text-amber-500 mb-4" />
      <h3 className="font-black text-amber-800 uppercase italic">Sin agencias activas</h3>
      <p className="text-sm text-amber-600 font-bold">El administrador debe registrar agencias para recibir jugadas.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-black italic uppercase text-primary text-center tracking-tighter">💰 Enviar mi Jugada</h2>
      
      <div className="grid md:grid-cols-2 gap-8 text-left">
        {/* PARTE 1: SELECCIÓN Y DATOS */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">1. Selecciona tu Agencia:</label>
          <div className="grid grid-cols-2 gap-3">
            {agencias.map(ag => (
              <button 
                key={ag.id} 
                onClick={() => setSelectedAgencia(ag)} 
                className={`p-3 border-2 rounded-2xl flex items-center gap-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-card border-border hover:border-primary/30'}`}
              >
                <div className="bg-muted w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px]">AG</div>
                <span className="font-black text-[10px] uppercase truncate">{ag.nombre}</span>
              </button>
            ))}
          </div>

          <Card className="p-5 border-2 border-primary/20 rounded-3xl shadow-lg bg-card/50 backdrop-blur">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase ml-1">Seleccionar Lotería</label>
                <Select onValueChange={setLot}>
                  <SelectTrigger className="h-11 font-black text-xs uppercase border-primary/20">
                    <SelectValue placeholder="¿Qué vas a jugar?" />
                  </SelectTrigger>
                  <SelectContent className="font-bold uppercase">
                    <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                    <SelectItem value="La Granjita">La Granjita</SelectItem>
                    <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                    <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                    <SelectItem value="Guacharito">Guacharito</SelectItem>
                    <SelectItem value="Selva Plus">Selva Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-1">Nº Animal</label>
                  <Input placeholder="Ej: 07" value={num} onChange={e => setNum(e.target.value)} className="h-11 font-mono font-black text-center text-lg border-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-1">Monto (Bs)</label>
                  <Input placeholder="Monto" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-11 font-black text-center text-lg border-primary/20" />
                </div>
              </div>

              <Button onClick={agregarLinea} className="w-full h-11 font-black uppercase italic shadow-md transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> Añadir jugada
              </Button>
            </div>
          </Card>
        </div>

        {/* PARTE 2: VISTA PREVIA TICKET */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">2. Vista Previa del Ticket:</label>
          <div className="bg-[#ffffff] text-slate-900 p-8 font-mono shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm border-t-[12px] border-emerald-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10"><ReceiptText size={60} /></div>
            
            <div className="text-center mb-6">
              <h3 className="font-black text-xl uppercase tracking-tighter">{selectedAgencia?.nombre || "TICKET DE JUGADA"}</h3>
              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Generado en Animalytics Pro</p>
            </div>

            <div className="space-y-3 text-[11px] border-y-2 border-dashed border-slate-200 py-6">
              {jugada.map((j, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="font-bold">{j.loteria.toUpperCase()}</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></div>
                  <div className="flex gap-4 items-center">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-black text-primary">#{j.numero}</span>
                    <span className="font-black w-12 text-right">{parseFloat(j.monto).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {jugada.length === 0 && <p className="text-center opacity-30 italic py-4">Ticket vacío... añada sus jugadas.</p>}
            </div>

            <div className="mt-6 flex justify-between font-black text-lg tracking-tighter uppercase">
              <span>Total Ticket:</span>
              <span className="text-emerald-700">{jugada.reduce((acc, curr) => acc + parseFloat(curr.monto || "0"), 0).toFixed(2)} Bs</span>
            </div>

            <div className="mt-10 text-[7px] text-center opacity-40 uppercase font-bold leading-tight">
              ESTO NO ES UN TICKET DE COBRO. <br/> ES UNA SOLICITUD DE JUGADA VÍA WHATSAPP. <br/> PAGUE A SU AGENTE PARA VALIDAR.
            </div>
          </div>

          <Button 
            disabled={!selectedAgencia || jugada.length === 0} 
            onClick={enviarWhatsApp} 
            className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white text-lg font-black italic rounded-[1.5rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-3"
          >
            <Send className="h-6 w-6 fill-white" /> ENVIAR A WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  );
}
