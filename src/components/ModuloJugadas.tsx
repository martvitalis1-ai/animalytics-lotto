import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Wallet, Landmark, Info, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

// DICCIONARIO DE ANIMALES (0-36 y 00)
const ANIMALES: Record<string, string> = {
  "0": "DELFÍN", "00": "BALLENA", "1": "CARNERO", "2": "TORO", "3": "CIEMPIÉS", "4": "ALACRÁN",
  "5": "LEÓN", "6": "RANA", "7": "PERICO", "8": "RATÓN", "9": "ÁGUILA", "10": "TIGRE",
  "11": "GATO", "12": "CABALLO", "13": "MONO", "14": "PALOMA", "15": "ZORRO", "16": "OSO",
  "17": "PAVO", "18": "BURRO", "19": "CHIVO", "20": "COCHINO", "21": "GALLO", "22": "CAMELLO",
  "23": "CEBRA", "24": "IGUANA", "25": "GALLINA", "26": "VACA", "27": "PERRO", "28": "ZAMURO",
  "29": "ELEFANTE", "30": "CAIMÁN", "31": "LAPA", "32": "ARDILLA", "33": "PESCADO", "34": "VENADO",
  "35": "JIRAFA", "36": "CULEBRA"
};

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");

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
        const local = localStorage.getItem('tickets_history_v_final');
        if (local) setSavedTickets(JSON.parse(local));
      } catch (e) { 
        console.error("Error cargando bunker:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, []);

  const agregarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) {
      return toast.error("Faltan datos en la jugada");
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

    setCurrentJugadas(prev => [...prev, nueva]);
    setNum(""); 
    setMon(""); 
    setSelectedHours([]);
    toast.success("Añadida al ticket");
  };

  const urlWhatsApp = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";

    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    let texto = `*SOLICITUD DE JUGADA - ANIMALYTICS*\n`;
    texto += `----------------------------\n`;
    texto += `🏦 *MIS DATOS PARA COBRAR:*\n`;
    texto += `Banco: ${userBanco}\nPM: ${userPM}\nCI: ${userCedula}\n`;
    texto += `----------------------------\n\n`;

    currentJugadas.forEach((j) => {
      texto += `📍 *${j.loteria.toUpperCase()}*\n`;
      texto += `Animal: *${j.numero} - ${j.animal}*\n`;
      texto += `Sorteos: ${j.horas.join(", ")}\n`;
      texto += `Monto: ${j.monto} Bs x sorteo\n`;
      texto += `----------\n`;
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * (curr.horas?.length || 0)), 0);
    texto += `\n*TOTAL A PAGAR:* ${total.toFixed(2)} Bs\n`;
    texto += `----------------------------\n`;
    texto += `_Envio comprobante de pago._`;

    return `https://wa.me/${tlf}?text=${encodeURIComponent(texto)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  const registrarYEnviar = () => {
    localStorage.setItem('u_pm_banco', userBanco);
    localStorage.setItem('u_pm_tlf', userPM);
    localStorage.setItem('u_pm_cedula', userCedula);
    
    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * (curr.horas?.length || 0)), 0);
    const ticket = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      agenciaNombre: selectedAgencia?.nombre,
      fecha: new Date().toISOString(),
      total,
      jugadas: currentJugadas
    };
    const nuevoHistorial = [ticket, ...savedTickets];
    setSavedTickets(nuevoHistorial);
    localStorage.setItem('tickets_history_v_final', JSON.stringify(nuevoHistorial));
  };

  if (loading) return <div className="p-20 text-center font-black text-primary italic">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-8 text-left bg-slate-50 min-h-screen text-slate-900">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* PANEL DE CONTROL (IZQUIERDO) */}
        <div className="space-y-6">
          {/* TUS DATOS (ALTA VISIBILIDAD) */}
          <Card className="p-5 bg-slate-900 text-white border-none shadow-xl rounded-[2rem] space-y-4">
            <label className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-2"><Wallet size={14}/> 1. Tus Datos de Cobro</label>
            <Input 
              value={userBanco} 
              onChange={e => setUserBanco(e.target.value)} 
              placeholder="Tu Banco" 
              className="bg-slate-800 border-none font-bold text-white placeholder:text-slate-500" 
            />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tu Tlf Pago Móvil" className="bg-slate-800 border-none font-bold text-white placeholder:text-slate-500" />
              <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-slate-800 border-none font-bold text-white placeholder:text-slate-500" />
            </div>
          </Card>

          {/* SELECCIÓN AGENCIA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Landmark size={14}/> 2. Elige tu Agencia</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button 
                  key={ag.id} 
                  onClick={() => setSelectedAgencia(ag)} 
                  className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase border-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* DATOS DE PAGO DE LA AGENCIA (CORREGIDO) */}
          {selectedAgencia && (
            <div className="p-5 bg-white border-2 border-emerald-500 rounded-[2rem] space-y-2 shadow-sm animate-in zoom-in-95 duration-300">
              <p className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">🏦 Pagar a esta Agencia:</p>
              <div className="grid grid-cols-1 gap-1 text-[13px] font-black text-slate-800 uppercase italic">
                <p className="bg-slate-100 p-2 rounded-lg border border-slate-200">{selectedAgencia.banco_nombre || 'BANCO NO DISPONIBLE'}</p>
                <div className="flex gap-2">
                  <p className="flex-1 bg-slate-100 p-2 rounded-lg border border-slate-200">Tlf: {selectedAgencia.banco_telefono || '---'}</p>
                  <p className="flex-1 bg-slate-100 p-2 rounded-lg border border-slate-200">ID: {selectedAgencia.banco_cedula || '---'}</p>
                </div>
              </div>
            </div>
          )}

          {/* FORMULARIO JUGADA */}
          <Card className="p-6 space-y-4 border-none shadow-2xl rounded-[2.5rem] bg-white">
            <Select value={lot} onValueChange={setLot}>
              <SelectTrigger className="font-black h-12 uppercase bg-slate-100 border-none text-slate-900"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
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
              <Input placeholder="Nº" value={num} onChange={e => setNum(e.target.value)} className="h-14 font-black text-center text-4xl bg-slate-100 border-none text-slate-900" />
              <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-14 font-black text-center text-4xl bg-slate-100 border-none text-slate-900" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Elige los Sorteos:</label>
              <div className="grid grid-cols-3 gap-2">
                {DRAW_TIMES.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}
                    className={`h-11 text-[11px] font-black rounded-xl border-2 transition-all ${selectedHours.includes(t) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-100 border-transparent text-slate-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={agregarJugada} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl transition-all active:scale-95"><Plus className="mr-2"/> Añadir al Ticket</Button>
          </Card>
        </div>

        {/* COLUMNA DERECHA: TICKET VIRTUAL */}
        <div className="relative">
          <div className="bg-white p-8 font-mono shadow-2xl rounded-sm border-t-[20px] border-emerald-600 min-h-[600px] flex flex-col text-slate-900">
            <div className="text-center border-b-2 border-dashed border-slate-200 pb-5 mb-8">
              <h3 className="font-black text-3xl uppercase tracking-tighter">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
              <p className="text-[10px] font-black opacity-30 mt-1">ANIMALYTICS PRO TICKET</p>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[450px] pr-2">
              {currentJugadas.map((j, i) => (
                <div key={i} className="border-b border-slate-100 pb-4 flex justify-between items-start animate-in fade-in duration-500">
                  <div className="text-left space-y-1">
                    <p className="font-black uppercase text-emerald-600 text-xs tracking-widest">{j.loteria}</p>
                    <p className="font-black text-slate-900 text-xl">#{j.numero} - {j.animal}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">{j.horas.join(" | ")}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <span className="font-black text-lg">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 p-1 bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              {currentJugadas.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-24">
                  <ReceiptText size={80}/>
                  <p className="font-black uppercase tracking-[0.3em] text-xl">Ticket Vacío</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t-4 border-double border-slate-900 pt-6 flex justify-between font-black text-4xl italic text-slate-900 tracking-tighter">
              <span>TOTAL:</span>
              <span className="underline decoration-emerald-500 decoration-4">{currentJugadas.reduce((acc, curr) => acc + (curr.monto * (curr.horas?.length || 0)), 0).toFixed(2)} Bs</span>
            </div>

            <a 
              href={urlWhatsApp} 
              onClick={registrarYEnviar}
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full h-24 bg-[#25D366] hover:bg-[#1fae53] text-white mt-10 rounded-[2rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 ${urlWhatsApp === "#" ? 'opacity-20 pointer-events-none' : 'hover:scale-[1.02]'}`}
            >
              <Send size={30} /> ENVIAR TICKET
            </a>
            
            {currentJugadas.length > 0 && (
              <button onClick={() => setCurrentJugadas([])} className="mt-8 text-[11px] uppercase font-black text-red-500/30 hover:text-red-500 mx-auto transition-colors">❌ BORRAR TODO EL TICKET</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
      </div>
    </div>
  );
}
