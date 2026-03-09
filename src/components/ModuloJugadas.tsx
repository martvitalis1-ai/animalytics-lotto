import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Send, ReceiptText, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [jugada, setJugada] = useState<{loteria: string, numero: string, monto: string}[]>([]);
  
  // Estados para la línea actual
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('agencias').select('*').eq('activa', true);
      if (data) setAgencias(data);
    };
    fetch();
  }, []);

  const agregarLinea = () => {
    if (!lot || !num || !mon) return toast.error("Faltan datos");
    setJugada([...jugada, { loteria: lot, numero: num, monto: mon }]);
    setNum(""); setMon("");
  };

  const enviarWhatsApp = () => {
    if (!selectedAgencia || jugada.length === 0) return;

    let ticketTexto = `*TICKET DE JUGADA - ANIMALYTICS PRO*%0A`;
    ticketTexto += `----------------------------%0A`;
    ticketTexto += `*Agencia:* ${selectedAgencia.nombre}%0A`;
    ticketTexto += `*Fecha:* ${new Date().toLocaleDateString()}%0A`;
    ticketTexto += `----------------------------%0A`;
    
    let total = 0;
    jugada.forEach(j => {
      ticketTexto += `📍 ${j.loteria.toUpperCase()}%0A`;
      ticketTexto += `   Animal: *#${j.numero}* - Monto: ${j.monto}%0A`;
      total += parseFloat(j.monto);
    });

    ticketTexto += `----------------------------%0A`;
    ticketTexto += `*TOTAL A PAGAR:* ${total.toFixed(2)}%0A`;
    ticketTexto += `----------------------------%0A`;
    ticketTexto += `_Por favor confirme mi jugada._`;

    const url = `https://wa.me/${selectedAgencia.whatsapp}?text=${ticketTexto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-black italic uppercase text-primary">💰 Enviar Jugada</h2>
      
      <div className="grid md:grid-cols-2 gap-6 text-left">
        {/* Lado Izquierdo: Selección y Formulario */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase">1. Elige tu Agencia:</label>
          <div className="grid grid-cols-2 gap-2">
            {agencias.map(ag => (
              <button 
                key={ag.id} 
                onClick={() => setSelectedAgencia(ag)}
                className={`p-3 border-2 rounded-xl flex items-center gap-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                {ag.logo_url && <img src={ag.logo_url} className="w-8 h-8 rounded-md shadow-sm" />}
                <span className="font-bold text-xs">{ag.nombre}</span>
              </button>
            ))}
          </div>

          <Card className="p-4 border-2 border-primary/20">
            <div className="space-y-3">
              <Select onValueChange={setLot}>
                <SelectTrigger><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lotto_activo">Lotto Activo</SelectItem>
                  <SelectItem value="la_granjita">La Granjita</SelectItem>
                  <SelectItem value="guacharo">Guácharo Activo</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} />
                <Input placeholder="Monto" type="number" value={mon} onChange={e => setMon(e.target.value)} />
              </div>
              <Button onClick={agregarLinea} className="w-full font-bold">
                <Plus className="w-4 h-4 mr-2" /> Añadir a mi ticket
              </Button>
            </div>
          </Card>
        </div>

        {/* Lado Derecho: El Ticket Visual */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase">2. Vista previa del Ticket:</label>
          <div className="bg-[#fdfdfd] text-black p-6 font-mono shadow-xl rounded-sm border-t-8 border-primary relative overflow-hidden">
            <div className="text-center mb-4">
              {selectedAgencia?.logo_url && <img src={selectedAgencia.logo_url} className="w-12 h-12 mx-auto mb-2 grayscale" />}
              <h3 className="font-black text-lg">{selectedAgencia?.nombre || "SELECCIONE AGENCIA"}</h3>
              <p className="text-[10px] opacity-70 italic">Ticket de Pronóstico Animalytics</p>
            </div>
            
            <div className="space-y-2 text-xs border-y border-dashed border-black/20 py-4">
              {jugada.map((j, i) => (
                <div key={i} className="flex justify-between">
                  <span>{j.loteria.substring(0,8)} - #{j.numero}</span>
                  <span className="font-bold">{parseFloat(j.monto).toFixed(2)}</span>
                </div>
              ))}
              {jugada.length === 0 && <p className="text-center opacity-30">Ticket vacío</p>}
            </div>

            <div className="mt-4 flex justify-between font-black text-sm">
              <span>TOTAL:</span>
              <span>{jugada.reduce((acc, curr) => acc + parseFloat(curr.monto || "0"), 0).toFixed(2)} Bs</span>
            </div>

            <div className="mt-6 text-[8px] text-center opacity-50 uppercase">
              Este ticket es una orden de envío vía WhatsApp. <br/> Confirme el pago con su agente.
            </div>
          </div>

          <Button 
            disabled={!selectedAgencia || jugada.length === 0}
            onClick={enviarWhatsApp}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-black italic rounded-2xl"
          >
            <Send className="mr-2" /> ENVIAR A WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  );
}
