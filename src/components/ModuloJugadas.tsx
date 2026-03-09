import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Wallet, Landmark, Info } from "lucide-react";
import { toast } from "sonner";
import { DRAW_TIMES } from '@/lib/constants';

// DICCIONARIO MAESTRO DE ANIMALES
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
    let n = num.trim();
    if (n !== "0" && n !== "00") n = n.padStart(2, '0');
    
    const nueva = { loteria: lot, numero: n, animal: ANIMALES[n] || "ANIMAL", monto: parseFloat(mon), horas: [...selectedHours] };
    setCurrentJugadas([...currentJugadas, nueva]);
    setNum(""); setMon(""); setSelectedHours([]);
    toast.success("Añadida al ticket");
  };

  const urlWhatsApp = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";

    let tlf = selectedAgencia.whatsapp.toString().replace(/\D/g, '');
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    let texto = `*SOLICITUD DE JUGADA - ANIMALYTICS*\n`;
    texto += `----------------------------\n`;
    texto += `🏦 *DATOS DE PAGO:*\n`;
    texto += `*Banco:* ${userBanco}\n*Tlf:* ${userPM}\n*CI:* ${userCedula}\n`;
    texto += `----------------------------\n\n`;

    currentJugadas.forEach((j) => {
      texto += `📍 *${j.loteria.toUpperCase()}*\n`;
      texto += `Animal: *${j.numero} - ${j.animal}*\n`;
      texto += `Sorteos: ${j.horas.join(", ")}\n`;
      texto += `Monto: ${j.monto} Bs x sorteo\n`;
      texto += `----------\n`;
    });

    const total = currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0);
    texto += `\n*TOTAL A PAGAR:* ${total.toFixed(2)} Bs\n`;
    texto += `----------------------------\n`;
    texto += `_Envío captura de pago adjunta._`;

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
    setSavedTickets([ticket, ...savedTickets]);
    localStorage.setItem('tickets_history_v_final', JSON.stringify([ticket, ...savedTickets]));
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-8 text-left">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="space-y-6">
          <Card className="p-5 bg-slate-900 text-white border-none shadow-2xl rounded-3xl space-y-4">
            <label className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-2"><Wallet size={14}/> 1. Tus Datos para cobrar Premios</label>
            <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Banco donde recibes" className="bg-slate-800 border-none font-bold" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tu Teléfono" className="bg-slate-800 border-none font-bold" />
              <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-slate-800 border-none font-bold" />
            </div>
          </Card>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Landmark size={14}/> 2. Selecciona la Agencia</label>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase border-2 transition-all ${selectedAgencia?.id === ag.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {ag.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* DATOS DE PAGO DE LA AGENCIA SELECCIONADA */}
          {selectedAgencia && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl space-y-1 shadow-sm animate-in fade-in slide-in-from-left-4">
              <p className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1"><Info size={12}/> Pagar a la Agencia:</p>
              <div className="text-[12px] font-bold text-slate-700">
                <p>🏦 {selectedAgencia.banco_nombre || 'BANCO NO REGISTRADO'}</p>
                <p>📞 {selectedAgencia.banco_telefono || 'S/N'} | 🆔 {selectedAgencia.banco_cedula || 'S/C'}</p>
              </div>
            </div>
          )}

          <Card className="p-6 space-y-4 border-2 border-slate-200 shadow-xl rounded-[35px] bg-white">
            <Select value={lot} onValueChange={setLot}>
              <SelectTrigger className="font-black h-12 uppercase bg-slate-50 border-none"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
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
              <div className="space-y-1">
                <label className="text-[9px] font-black ml-2 uppercase opacity-40">Número</label>
                <Input placeholder="0 - 36" value={num} onChange={e => setNum(e.target.value)} className="h-14 font-black text-center text-3xl bg-slate-50 border-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black ml-2 uppercase opacity-40">Monto Bs</label>
                <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-14 font-black text-center text-3xl bg-slate-50 border-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black ml-1 uppercase opacity-40">Selecciona Sorteos:</label>
              <ScrollArea className="h-32 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <div className="grid grid-cols-3 gap-2">
                  {DRAW_TIMES.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])}
                      className={`h-10 text-[10px] font-bold rounded-xl border-2 transition-all ${selectedHours.includes(t) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <Button onClick={agregarJugada} className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black uppercase rounded-2xl text-lg shadow-xl"><Plus className="mr-2"/> Añadir al Ticket</Button>
          </Card>
        </div>

        {/* COLUMNA DERECHA: TICKET VISUAL */}
        <div className="relative">
          <div className="bg-white p-8 font-mono shadow-2xl rounded-sm border-t-[18px] border-emerald-500 min-h-[550px] flex flex-col">
            <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6">
              <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-800">{selectedAgencia?.nombre || "NUEVO TICKET"}</h3>
              <p className="text-[9px] font-black opacity-30 italic">Animalytics Pro v3.0</p>
            </div>
            
            <div className="flex-1 space-y-5 overflow-y-auto max-h-[400px]">
              {currentJugadas.map((j, i) => (
                <div key={i} className="text-xs border-b border-slate-100 pb-3 flex justify-between items-center group">
                  <div className="text-left">
                    <p className="font-black uppercase text-emerald-600 text-[13px]">{j.loteria}</p>
                    <p className="font-black text-slate-800 text-lg">#{j.numero} - {j.animal}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{j.horas.join(" | ")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] opacity-40 font-bold uppercase">Subtotal</p>
                       <p className="font-black text-slate-900">{(j.monto * j.horas.length).toFixed(2)} Bs</p>
                    </div>
                    <button onClick={() => setCurrentJugadas(currentJugadas.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              {currentJugadas.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-2 py-20">
                  <ReceiptText size={64}/>
                  <p className="font-black uppercase tracking-[0.2em]">Ticket Vacío</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t-4 border-double border-slate-900 pt-5 flex justify-between font-black text-3xl italic text-slate-900">
              <span className="tracking-tighter">TOTAL:</span>
              <span>{currentJugadas.reduce((acc, curr) => acc + (curr.monto * curr.horas.length), 0).toFixed(2)} Bs</span>
            </div>

            <a 
              href={urlWhatsApp} 
              onClick={registrarYEnviar}
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full h-20 bg-[#25D366] hover:bg-[#20ba5a] text-white mt-10 rounded-[25px] font-black text-xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${urlWhatsApp === "#" ? 'opacity-30 pointer-events-none' : 'hover:scale-[1.02]'}`}
            >
              <Send size={26} /> ENVIAR A LA AGENCIA
            </a>
            
            {currentJugadas.length > 0 && (
              <button onClick={() => setCurrentJugadas([])} className="mt-6 text-[10px] uppercase font-black text-red-500/40 hover:text-red-500 mx-auto transition-colors">❌ Borrar todo el ticket</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
