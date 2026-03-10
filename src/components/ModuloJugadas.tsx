import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, Plus, CheckCircle2, Info, Instagram, MessageCircle, Settings, Save, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

// --- LOGOS GITHUB ---
const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
const LOTERIAS = [
  { id: "Lotto Activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "La Granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "Guácharo Activo", label: "GUÁCHARO", img: `${IMG_BASE}logo-guacharo.png` },
  { id: "Guacharito", label: "GUACHARITO", img: `${IMG_BASE}logo-guacharito.png` },
  { id: "Lotto Rey", label: "LOTTO REY", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "Selva Plus", label: "SELVA PLUS", img: `${IMG_BASE}logo-selva-plus.png` },
];

// --- DICCIONARIO MAESTRO ---
const ANIMALS_MASTER: any = { '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA', '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO', '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };
const ANIMAL_EMOJIS: any = { "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐚", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣" };

const HORAS_PUNTO = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
const HORAS_MEDIA = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"];

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminIg, setAdminIg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("Lotto Activo");
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");

  useEffect(() => { fetchAgencias(); }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').eq('activa', true);
    if (data) setAgencias(data);
    setLoading(false);
  };

  // --- LÓGICA DE FILTRADO DE NÚMEROS (IMPORTANTE) ---
  const filteredNumbers = useMemo(() => {
    const allKeys = ["00", "0", ...Array.from({length: 99}, (_, i) => (i + 1).toString())];
    return allKeys.filter(n => {
      if (selectedLot === "Guacharito") return true; // Hasta 99
      if (selectedLot === "Guácharo Activo") return n === "00" || parseInt(n) <= 75; // Hasta 75
      return n === "00" || parseInt(n) <= 36; // Lotto Activo, Granjita, Selva, Rey: Hasta 36
    });
  }, [selectedLot]);

  const horasAMostrar = useMemo(() => (selectedLot === "Guacharito" || selectedLot === "Lotto Rey") ? HORAS_MEDIA : HORAS_PUNTO, [selectedLot]);

  const agregarJugada = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Selecciona animal y sorteos");
    setCurrentJugadas([...currentJugadas, {
      loteria: selectedLot, numero: selectedNum, animal: ANIMALS_MASTER[selectedNum], monto: parseFloat(monto), horas: [...selectedHours]
    }]);
    setSelectedNum(null);
  };

  // --- SUBIR IMAGEN DESDE GALERÍA ---
  const handleUploadImage = async (e: any) => {
    if (!selectedAgencia) return toast.error("Selecciona una agencia primero");
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `pub_${selectedAgencia.id}_${Date.now()}`;
    const { data, error } = await supabase.storage.from('agencias').upload(fileName, file);

    if (error) {
      toast.error("Error al subir imagen");
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
    
    const { error: dbError } = await supabase
      .from('agencias')
      .update({ publicidad_url: publicUrl, instagram_url: adminIg })
      .eq('id', selectedAgencia.id);

    if (!dbError) {
      toast.success("¡Agencia Actualizada!");
      fetchAgencias();
      setSelectedAgencia({ ...selectedAgencia, publicidad_url: publicUrl });
    }
    setIsUploading(false);
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '');
    tlf = tlf.startsWith('58') ? tlf : '58' + tlf.replace(/^0/, '');
    let msg = `SOLICITUD DE JUGADA\n--------------------------\nDATOS DE COBRO:\nBANCO: ${userBanco}\nTLF: ${userPM}\nCI: ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => {
      msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nSorteos: ${j.horas.join(", ")}\nBs ${j.monto}\n----------\n`;
    });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white">Sincronizando Búnker...</div>;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 pb-40">
      
      {/* 1. SECTOR AGENCIA + ADMIN */}
      <div className="w-full bg-[#0F172A] p-6 lg:p-8 text-white shadow-2xl rounded-b-[4rem] mb-8 relative">
        <p className="text-[10px] font-black uppercase text-emerald-400 mb-4 text-center tracking-[0.4em]">PASO 1: SELECCIONA TU AGENCIA</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {agencias.map(ag => (
            <button key={ag.id} onClick={() => { setSelectedAgencia(ag); setAdminIg(ag.instagram_url || ""); }} className={`flex items-center gap-3 px-10 py-4 rounded-3xl font-black uppercase text-[12px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              {selectedAgencia?.id === ag.id && <CheckCircle2 size={18} />} {ag.nombre}
            </button>
          ))}
          <Button onClick={() => setShowAdmin(!showAdmin)} variant="outline" className="border-amber-500 text-amber-500 rounded-3xl font-black uppercase text-xs h-14 px-6">
            <Settings size={20} className="mr-2"/> Panel Admin
          </Button>
        </div>

        {showAdmin && selectedAgencia && (
          <Card className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-[2.5rem] shadow-2xl border-none text-slate-900 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="font-black uppercase italic">🛠️ Ajustes de {selectedAgencia.nombre}</h3>
                <button onClick={() => setShowAdmin(false)}><X size={24}/></button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Instagram (Link Completo)</label>
                   <Input value={adminIg} onChange={e => setAdminIg(e.target.value)} placeholder="https://instagram.com/..." className="bg-slate-100 border-none h-14 rounded-2xl" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagen Publicitaria (Desde Galería)</label>
                   <div className="relative h-20 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all">
                      <input type="file" accept="image/*" onChange={handleUploadImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex items-center gap-2 font-black uppercase text-xs text-slate-500">
                         {isUploading ? "Subiendo..." : <><Upload size={20}/> Toca para subir foto</>}
                      </div>
                   </div>
                </div>
                <Button onClick={handleSaveAdmin} className="w-full h-16 bg-emerald-600 font-black uppercase rounded-2xl"><Save className="mr-2"/> Guardar Configuración</Button>
             </div>
          </Card>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-[1fr_450px] gap-8 px-6">
        
        <div className="space-y-8">
          {/* PASO 1: DATOS COBRO */}
          <Card className="p-8 bg-emerald-600 text-white rounded-[3.5rem] shadow-2xl border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Wallet size={150}/></div>
             <div className="relative z-10 space-y-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">¿A dónde te enviamos el dinero cuando ganes?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40" />
                  <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Pago Móvil" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40" />
                  <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula" className="bg-white/20 border-none text-white h-16 rounded-3xl font-black text-xl placeholder:text-white/40" />
                </div>
             </div>
          </Card>

          {/* LOTERIAS */}
          <Card className="bg-white p-6 lg:p-10 rounded-[3rem] shadow-xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-2 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-40 grayscale-0'}`}>
                  <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-2xl' : 'border-slate-100'} overflow-hidden bg-black p-1.5 flex items-center justify-center`}>
                    <img src={lot.img} alt={lot.id} className="w-full h-full object-contain" crossOrigin="anonymous" onError={(e: any) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/126/126501.png"; }} />
                  </div>
                  <span className={`text-[9px] lg:text-[11px] font-black uppercase text-center ${selectedLot === lot.id ? 'text-emerald-600' : 'text-slate-500'}`}>{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* GRILLA ANIMALITOS (RANGOS DINÁMICOS) */}
          <Card className="p-8 lg:p-12 bg-white rounded-[3.5rem] shadow-2xl border-none">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredNumbers.map(n => (
                <button key={n} onClick={() => setSelectedNum(n)} className={`flex flex-col items-center justify-center p-3 rounded-[2rem] border-2 transition-all h-28 lg:h-36 ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-inner scale-110 z-10' : 'bg-[#F8FAFC] border-transparent text-slate-600 hover:bg-slate-200'}`}>
                  <span className="text-3xl lg:text-4xl mb-2">{ANIMAL_EMOJIS[n] || '🎟️'}</span>
                  <span className="text-[18px] lg:text-[22px] font-black text-slate-900 leading-none">{n}</span>
                  <div className="h-6 flex items-center justify-center w-full px-1">
                     <span className="text-[8px] lg:text-[10px] font-black uppercase text-slate-400 text-center leading-tight truncate">{ANIMALS_MASTER[n]}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* HORARIOS */}
          <Card className="p-8 bg-white rounded-[3rem] shadow-2xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {horasAMostrar.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-14 lg:h-16 rounded-2xl text-[12px] lg:text-[14px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#F8FAFC] border-transparent text-slate-500'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          <div className="lg:sticky lg:top-32 space-y-8">
            
            {/* PANEL REDES */}
            {selectedAgencia && (
              <Card className="p-8 bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col gap-4">
                 <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => selectedAgencia.instagram_url ? window.open(selectedAgencia.instagram_url, '_blank') : toast.error("Instagram no definido")} className="h-16 rounded-3xl font-black text-[10px] uppercase bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-lg">
                      <Instagram size={20} className="mr-2"/> Instagram
                    </Button>
                    <Button onClick={() => window.open(reclamoUrl, '_blank')} className="h-16 rounded-3xl font-black text-[10px] uppercase bg-amber-500 text-white shadow-lg">
                      <MessageCircle size={20} className="mr-2"/> Reclamos
                    </Button>
                 </div>
              </Card>
            )}

            {/* PANEL MONTO */}
            <Card className="p-10 bg-white rounded-[4rem] shadow-2xl border-none text-center">
              <label className="text-xs font-black uppercase opacity-40 italic text-slate-900 tracking-widest">Monto por Sorteo (Bs)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-24 text-center text-7xl font-black bg-slate-50 border-none rounded-[3rem] text-slate-900 shadow-inner" />
              <Button onClick={agregarJugada} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2.5rem] text-xl lg:text-2xl shadow-xl mt-8">
                <Plus size={32} className="mr-3" /> AÑADIR JUGADA
              </Button>
            </Card>

            {/* TICKET VIRTUAL */}
            <div className="bg-white p-8 lg:p-12 font-mono shadow-2xl rounded-[4rem] border-t-[18px] border-emerald-600 flex flex-col text-slate-900">
              <h4 className="text-center font-black uppercase text-xl border-b border-slate-100 pb-4 mb-8 italic">Resumen Ticket</h4>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] no-scrollbar">
                {currentJugadas.map((j, i) => (
                  <div key={i} className="border-b border-slate-50 pb-5 flex justify-between items-start text-left">
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{j.loteria}</p>
                      <p className="font-black text-xl italic text-slate-800 leading-none">#{j.numero} - {j.animal}</p>
                    </div>
                    <span className="font-black text-lg">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t-4 border-double border-slate-900 flex justify-between items-end font-black text-4xl italic mb-10 tracking-tighter">
                <span className="text-sm uppercase opacity-40">Total:</span>
                <span className="underline decoration-emerald-500 decoration-8">{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
              </div>
              <Button 
                onClick={() => {
                   if (!userPM || !userBanco || !userCedula) return toast.error("¡Faltan tus datos de pago arriba!");
                   window.open(msgUrl, '_blank');
                }}
                className={`w-full h-24 bg-emerald-600 text-white rounded-[3.5rem] font-black text-2xl shadow-xl active:scale-95 leading-none ${currentJugadas.length === 0 ? 'opacity-20 pointer-events-none grayscale' : ''}`}
              >
                <Send size={32} className="mr-3" /> ENVIAR A AGENCIA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PUBLICIDAD FINAL DINÁMICA */}
      {selectedAgencia?.publicidad_url && (
        <div className="max-w-[1600px] mx-auto mt-24 px-6 pb-20">
           <p className="text-[11px] font-black text-slate-400 uppercase text-center mb-8 tracking-[0.6em] italic">ESPACIO PUBLICITARIO</p>
           <div className="rounded-[5rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white">
              <img src={selectedAgencia.publicidad_url} alt="Publicidad" className="w-full h-auto object-contain max-h-[800px] mx-auto" />
           </div>
        </div>
      )}

    </div>
  );
}
