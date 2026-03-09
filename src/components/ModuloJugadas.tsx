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
        toast.error("Error: ¿Creaste la tabla 'agencias' en Supabase?");
      } finally {
        setLoading(false);
      }
    };
    fetchAgencias();
  }, []);

  const agregarLinea = () => {
    if (!lot || !num || !mon) return toast.error("Completa los datos");
    setJugada([...jugada, { loteria: lot, numero: num, monto: mon }]);
    setNum(""); setMon("");
  };

  const enviarWhatsApp = () => {
    if (!selectedAgencia || jugada.length === 0) return;
    let ticketTexto = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A----------------------------%0A*Agencia:* ${selectedAgencia.nombre}%0A*Fecha:* ${new Date().toLocaleDateString()}%0A----------------------------%0A`;
    let total = 0;
    jugada.forEach(j => {
      ticketTexto += `📍 ${j.loteria.toUpperCase()}%0A   Animal: *#${j.numero}* - Monto: ${j.monto}%0A`;
      total += parseFloat(j.monto);
    });
    ticketTexto += `----------------------------%0A*TOTAL A PAGAR:* ${total.toFixed(2)}%0A----------------------------%0A_Orden enviada desde la App._`;
    window.open(`https://wa.me/${selectedAgencia.whatsapp}?text=${ticketTexto}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center font-bold animate-pulse">Cargando Agencias...</div>;

  if (agencias.length === 0) return (
    <div className="p-10 text-center bg-amber-50 rounded-2xl border-2 border-amber-200 m-4">
      <AlertTriangle className="mx-auto w-12 h-12 text-amber-500 mb-4" />
      <h3 className="font-black text-amber-800">SIN AGENCIAS DISPONIBLES</h3>
      <p className="text-sm text-amber-600">El administrador debe agregar agencias desde el panel Admin.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-black italic uppercase text-primary text-center">💰 Enviar Jugada</h2>
      <div className="grid md:grid-cols-2 gap-6 text-left">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">1. Elige tu Agencia:</label>
          <div className="grid grid-cols-2 gap-2">
            {agencias.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`p-3 border-2 rounded-xl flex items-center gap-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-md' : 'bg-card border-border'}`}>
                {ag.logo_url && <img src={ag.logo_url} className="w-8 h-8 rounded-md object-cover" />}
                <span className="font-bold text-[10px] uppercase truncate">{ag.nombre}</span>
              </button>
            ))}
          </div>
          <Card className="p-4 border-2 border-primary/20">
            <div className="space-y-3">
              <Select onValueChange={setLot}>
                <SelectTrigger className="h-10 font-bold"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                  <SelectItem value="La Granjita">La Granjita</SelectItem>
                  <SelectItem value="Guácharo">Guácharo Activo</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="font-bold" />
                <Input placeholder="Monto" type="number" value={mon} onChange={e => setMon(e.target.value)} className="font-bold" />
              </div>
              <Button onClick={agregarLinea} className="w-full font-black uppercase italic"><Plus className="mr-2 h-4 w-4" /> Añadir jugada</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">2. Vista previa del Ticket:</label>
          <div className="bg-white text-black p-6 font-mono shadow-2xl rounded-sm border-t-8 border-primary relative">
            <div className="text-center mb-4">
              <h3 className="font-black text-lg uppercase">{selectedAgencia?.nombre || "TICKET"}</h3>
              <p className="text-[10px] opacity-70 uppercase">Animalytics Pro</p>
            </div>
            <div className="space-y-2 text-xs border-y border-dashed border-black/20 py-4">
              {jugada.map((j, i) => (
                <div key={i} className="flex justify-between">
                  <span>{j.loteria} - #{j.numero}</span>
                  <span className="font-bold">{parseFloat(j.monto).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between font-black text-sm uppercase">
              <span>TOTAL:</span>
              <span>{jugada.reduce((acc, curr) => acc + parseFloat(curr.monto || "0"), 0).toFixed(2)} Bs</span>
            </div>
          </div>
          <Button disabled={!selectedAgencia || jugada.length === 0} onClick={enviarWhatsApp} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-black italic rounded-2xl shadow-xl">
            <Send className="mr-2 h-5 w-5" /> ENVIAR POR WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  );
}
