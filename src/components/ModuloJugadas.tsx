import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Wallet, Landmark, Info, ReceiptText } from "lucide-react";
import { toast } from "sonner";

// IMPORTANTE: Fallback por si la constante falla
const HORARIOS_DEFAULT = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];

const ANIMALES: Record<string, string> = {
  "0": "DELFIN", "00": "BALLENA", "1": "CARNERO", "2": "TORO", "3": "CIEMPIES", "4": "ALACRAN",
  "5": "LEON", "6": "RANA", "7": "PERICO", "8": "RATON", "9": "AGUILA", "10": "TIGRE",
  "11": "GATO", "12": "CABALLO", "13": "MONO", "14": "PALOMA", "15": "ZORRO", "16": "OSO",
  "17": "PAVO", "18": "BURRO", "19": "CHIVO", "20": "COCHINO", "21": "GALLO", "22": "CAMELLO",
  "23": "CEBRA", "24": "IGUANA", "25": "GALLINA", "26": "VACA", "27": "PERRO", "28": "ZAMURO",
  "29": "ELEFANTE", "30": "CAIMAN", "31": "LAPA", "32": "ARDILLA", "33": "PESCADO", "34": "VENADO",
  "35": "JIRAFA", "36": "CULEBRA"
};

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Usuario con carga segura
  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  // Formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
        
        // Carga segura de localStorage
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
      } catch (e) {
        console.error("Error inicializando:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const agregarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Completa todos los campos");
    }
    let n = num.trim();
    if (n !== "0" && n !== "00") n = n.padStart(2, '0');
    
    const nueva = { 
      loteria: lot, 
      numero: n, 
      animal: ANIMALES[n] || "ANIMAL", 
      monto: parseFloat(mon), 
      horas: [...selectedHours] 
    };

    setCurrentJugadas([...currentJugadas, nueva]);
    setNum(""); setMon(""); setSelectedHours([]);
    toast.success("Añadido");
  };

  const urlWhatsApp = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";

    const tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    const numDestino = tlf.startsWith('58') ? tlf : '58' + tlf.replace(/^0/, '');

    let msg = `SOLICITUD DE JUGADA\n`;
    msg += `--------------------------\n`;
    msg += `DATOS DE COBRO:\n`;
    msg += `BANCO: ${userBanco}\nPM: ${userPM}\nCI: ${userCedula}\n`;
    msg += `--------------------------\n\n`;

    currentJugadas.forEach((j) => {
      msg += `${j.loteria.toUpperCase()}\n`;
      msg += `Animal: ${j.numero} - ${j.animal}\n`;
      msg += `Sorteos: ${j.horas.join(", ")}\n`;
      msg += `Monto: ${j.monto} Bs\n`;
      msg += `----------\n`;
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * (curr.horas?.length || 0)), 0);
    msg += `\nTOTAL A PAGAR: ${total.toFixed(2)} Bs`;

    return `https://wa.me/${numDestino}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black text-slate-800">CARGANDO...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="grid lg:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          {/* 1. DATOS DE USUARIO - FORZADO COLOR CLARO */}
          <div className="p-5 bg-slate-900 rounded-[2rem] shadow-xl space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase">1. Tus Datos de Cobro</p>
            <Input 
              value={userBanco} 
              onChange={e => { setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value); }}
              placeholder="Tu Banco" 
              className="bg-slate-800 border-none text-white font-bold placeholder:text-slate-500" 
            />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => { setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value); }} placeholder="Tu Teléfono" className="bg-slate-800 border-none text-white font-bold" />
              <Input value={userCedula} onChange={e => { setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value); }} placeholder="Tu Cédula" className="bg-slate-800 border-none text-white font-bold" />
            </div>
          </div>

          {/* 2. SELECCIÓN DE AGENCIA */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400">2. Selecciona Agencia</p>
            <div className="flex flex-wrap gap-2">
              {(agencias || []).map(ag => (
                <button 
                  key={ag.id} 
                  onClick={() => setSelectedAgencia(ag)} 
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* 3. DATOS DE PAGO AGENCIA - ALTO CONTRASTE */}
          {selectedAgencia && (
            <div className="p-5 bg-white border-2 border-emerald-500 rounded-[2rem] shadow-lg animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">🏦 Datos de Pago de la Agencia:</p>
              <div className="space-y-1 text-slate-900 font-black uppercase italic">
                <p className="text-sm bg-slate-50 p-2 rounded-lg">{selectedAgencia.banco_nombre || 'BANCO NO DEFINIDO'}</p>
                <div className="flex gap-2 text-[12px]">
                  <p className="flex-1 bg-slate-50 p-2 rounded-lg text-center">Tlf: {selectedAgencia.banco_telefono || '---'}</p>
                  <p className="flex-1 bg-slate-50 p-2 rounded-lg text-center">ID: {selectedAgencia.banco_cedula || '---'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. FORMULARIO JUGADA */}
          <Card className="p-6 space-y-4 border-none shadow-2xl rounded-[2.5rem] bg-white">
            <Select value={lot} onValueChange={setLot}>
              <SelectTrigger className="font-black bg-slate-100 border-none text-slate-900"><SelectValue placeholder="Lotería" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lotto Activo">Lotto Activo</SelectItem>
                <SelectItem value="La Granjita">La Granjita</SelectItem>
                <SelectItem value="Guácharo Activo">Guácharo Activo</SelectItem>
                <SelectItem value="Lotto Rey">Lotto Rey</SelectItem>
                <SelectItem value="Guacharito">Guacharito</SelectItem>
                <SelectItem value="Selva Plus">Selva Plus</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-12 font-black text-center text-3xl bg-slate-100 border-none text-slate-900" />
              <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-12 font-black text-center text-3xl bg-slate-100 border-none text-slate-900" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {HORARIOS_DEFAULT.map(t => (
                <button 
                  key={t} 
                  onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}
                  className={`h-10 text-[10px] font-black rounded-xl border-2 transition-all ${selectedHours.includes(t) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-100 border-transparent text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button onClick={agregarJugada} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg"><Plus className="mr-2"/> Añadir Jugada</Button>
          </Card>
        </div>

        {/* TICKET (DERECHA) */}
        <div className="bg-white p-6 md:p-8 font-mono shadow-2xl rounded-sm border-t-[20px] border-emerald-600 min-h-[550px] flex flex-col text-slate-900">
          <div className="text-center border-b-2 border-dashed border-slate-200 pb-5 mb-6">
            <h3 className="font-black text-2xl uppercase">{selectedAgencia?.nombre || "TICKET"}</h3>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto max-h-[400px]">
            {currentJugadas.map((j, i) => (
              <div key={i} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div className="text-left">
                  <p className="font-black uppercase text-emerald-600 text-[11px] tracking-widest">{j.loteria}</p>
                  <p className="font-black text-xl">#{j.numero} - {j.animal}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{j.horas.join(" | ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">{(j.monto * j.horas.length).toFixed(2)} Bs</p>
                  <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
            {currentJugadas.length === 0 && <p className="text-center py-20 opacity-20 font-black uppercase tracking-widest">Ticket Vacío</p>}
          </div>

          <div className="mt-8 border-t-4 border-double border-slate-900 pt-6 flex justify-between font-black text-3xl italic">
            <span>TOTAL:</span>
            <span>{currentJugadas.reduce((acc, curr) => acc + (curr.monto * (curr.horas?.length || 0)), 0).toFixed(2)} Bs</span>
          </div>

          <a 
            href={urlWhatsApp} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-full h-20 bg-[#25D366] text-white mt-8 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 ${urlWhatsApp === "#" ? 'opacity-20 pointer-events-none' : ''}`}
          >
            <Send size={28} /> ENVIAR TICKET
          </a>
        </div>

      </div>
    </div>
  );
}
