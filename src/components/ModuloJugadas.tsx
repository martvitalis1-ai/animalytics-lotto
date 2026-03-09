import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Plus, ReceiptText, AlertTriangle, Trash2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [jugada, setJugada] = useState<{loteria: string, numero: string, monto: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgencias = async () => {
      try {
        const { data } = await supabase.from('agencias').select('*').eq('activa', true);
        if (data) setAgencias(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAgencias();
  }, []);

  const agregarOActualizarLinea = () => {
    if (!lot || !num || !mon) return toast.error("Completa los datos de la jugada");
    
    if (editingIndex !== null) {
      // Modo Edición: Actualizamos la línea existente
      const nuevaJugada = [...jugada];
      nuevaJugada[editingIndex] = { loteria: lot, numero: num, monto: mon };
      setJugada(nuevaJugada);
      setEditingIndex(null);
      toast.success("Jugada actualizada");
    } else {
      // Modo Normal: Añadimos nueva línea
      setJugada([...jugada, { loteria: lot, numero: num, monto: mon }]);
    }
    
    // Limpiamos campos
    setNum(""); setMon("");
  };

  const prepararEdicion = (index: number) => {
    const item = jugada[index];
    setLot(item.loteria);
    setNum(item.numero);
    setMon(item.monto);
    setEditingIndex(index);
    toast.info("Editando jugada...");
  };

  const eliminarLinea = (index: number) => {
    setJugada(jugada.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const enviarWhatsApp = () => {
    if (!selectedAgencia || jugada.length === 0) return;
    let ticket = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A----------------------------%0A*Agencia:* ${selectedAgencia.nombre}%0A*Fecha:* ${new Date().toLocaleDateString()}%0A----------------------------%0A`;
    let total = 0;
    jugada.forEach(j => {
      ticket += `📍 ${j.loteria.toUpperCase()}%0A   Animal: *#${j.numero}* - Monto: ${j.monto}%0A`;
      total += parseFloat(j.monto);
    });
    ticket += `----------------------------%0A*TOTAL:* ${total.toFixed(2)} Bs%0A----------------------------%0A_Enviado desde App Animalytics._`;
    window.open(`https://wa.me/${selectedAgencia.whatsapp}?text=${ticket}`, '_blank');
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase italic text-primary">Cargando Agencias Autorizadas...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-black italic uppercase text-primary text-center">💰 Enviar Jugada</h2>
      <div className="grid md:grid-cols-2 gap-6 text-left">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">1. Elige tu Agencia:</label>
          <div className="grid grid-cols-2 gap-2">
            {agencias.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10 shadow-md' : 'bg-card border-border hover:border-primary/20'}`}>
                {ag.logo_url && <img src={ag.logo_url} className="w-6 h-6 rounded-full object-cover" />}
                <span className="font-black text-[10px] uppercase truncate">{ag.nombre}</span>
              </button>
            ))}
          </div>

          <Card className={`p-4 border-2 transition-colors ${editingIndex !== null ? 'border-amber-500 bg-amber-500/5' : 'border-primary/20'}`}>
            <div className="space-y-3">
              <Select value={lot} onValueChange={setLot}>
                <SelectTrigger className="font-bold"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
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
                <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="font-black text-center" />
                <Input placeholder="Monto" type="number" value={mon} onChange={e => setMon(e.target.value)} className="font-black text-center" />
              </div>
              <Button onClick={agregarOActualizarLinea} className={`w-full font-black uppercase italic ${editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                {editingIndex !== null ? <RotateCcw className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingIndex !== null ? "Actualizar Jugada" : "Añadir al Ticket"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">2. Revisa tu Ticket:</label>
          <div className="bg-white text-black p-6 font-mono shadow-2xl rounded-sm border-t-8 border-primary relative min-h-[300px]">
            <div className="text-center mb-4">
              {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-10 h-10 mx-auto mb-2 rounded-full border" />}
              <h3 className="font-black text-lg uppercase">{selectedAgencia?.nombre || "TICKET"}</h3>
              <p className="text-[10px] opacity-70 uppercase font-bold">Animalytics Pro</p>
            </div>
            <div className="space-y-2 text-[11px] border-y-2 border-dashed border-slate-200 py-4">
              {jugada.map((j, i) => (
                <div key={i} className={`flex justify-between items-center p-1 rounded ${editingIndex === i ? 'bg-amber-100' : ''}`}>
                  <div className="flex gap-2 items-center flex-1">
                    <span className="font-bold">{j.loteria.substring(0,5)}.</span>
                    <span className="bg-slate-100 px-1 rounded font-black">#{j.numero}</span>
                    <span className="font-black">{parseFloat(j.monto).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => prepararEdicion(i)} className="p-1 hover:text-blue-600"><Pencil size={14}/></button>
                    <button onClick={() => eliminarLinea(i)} className="p-1 hover:text-red-600"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
              {jugada.length === 0 && <p className="text-center opacity-30 italic py-4">Sin jugadas</p>}
            </div>
            <div className="mt-4 flex justify-between font-black text-sm uppercase">
              <span>TOTAL:</span>
              <span className="text-emerald-700">{jugada.reduce((acc, curr) => acc + parseFloat(curr.monto || "0"), 0).toFixed(2)} Bs</span>
            </div>
          </div>
          <Button disabled={!selectedAgencia || jugada.length === 0} onClick={enviarWhatsApp} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-black italic rounded-2xl shadow-xl">
            <Send className="mr-2 h-5 w-5" /> ENVIAR A WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  );
}
