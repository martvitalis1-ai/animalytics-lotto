// 1. Agrega estos estados al inicio de la función AdminPanelMaestro:
const [adsData, setAdsData] = useState<Record<string, string>>({});

// 2. Agrega este useEffect para cargar los banners apenas entres a la pestaña:
useEffect(() => {
  if (adminTab === 'publicidad') {
    fetchCurrentAds();
  }
}, [adminTab]);

const fetchCurrentAds = async () => {
  const { data } = await supabase.from('ads').select('*');
  const mapped = (data || []).reduce((acc: any, ad: any) => ({
    ...acc, [ad.id]: ad.image_url
  }), {});
  setAdsData(mapped);
};

// 3. Función para borrar publicidad:
const handleDeleteAd = async (slot: string) => {
  if (!confirm(`¿Seguro que quieres quitar la publicidad de ${slot.toUpperCase()}?`)) return;
  
  setLoading(true);
  try {
    const { error } = await supabase.from('ads').delete().eq('id', slot);
    if (error) throw error;
    
    toast.success("PUBLICIDAD ELIMINADA");
    fetchCurrentAds(); // Recargamos la vista
  } catch (e: any) {
    toast.error("Error: " + e.message);
  } finally {
    setLoading(false);
  }
};

// 4. Actualiza la función de subida para que refresque la vista:
const handleUploadAd = async (slot: string, file: File) => {
  setLoading(true);
  try {
    const fileName = `ads/${slot}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: upError } = await supabase.storage.from('ANIMALITOS').upload(fileName, file);
    if (upError) throw upError;

    const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
    
    const { error: dbError } = await supabase
      .from('ads')
      .upsert({ id: slot, image_url: urlData.publicUrl, updated_at: new Date() });

    if (dbError) throw dbError;
    
    toast.success(`BANNER ${slot.toUpperCase()} ACTUALIZADO`);
    fetchCurrentAds(); // 🛡️ Esto hace que veas el cambio de una vez
  } catch (e: any) {
    toast.error("Error: " + e.message);
  } finally {
    setLoading(false);
  }
};

// --- ABAJO EN EL RETURN, REEMPLAZA LA SECCIÓN adminTab === 'publicidad' ---

{adminTab === 'publicidad' && (
  <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-10 max-w-5xl mx-auto animate-in slide-in-from-bottom-4">
     <h3 className="font-black text-2xl md:text-3xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4">
       <Megaphone size={32} /> CONTROL DE BANNERS
     </h3>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { id: 'login', label: '1. Banner Inicio' },
          { id: 'ia', label: '2. Banner Sección IA' },
          { id: 'explosivo', label: '3. Banner Explosivos' },
          { id: 'deportes', label: '4. Banner Deportes' }
        ].map((slot) => (
          <div key={slot.id} className="space-y-4 p-6 border-4 border-slate-900 rounded-[2.5rem] bg-slate-50 relative group">
             <div className="flex justify-between items-center px-2">
                <label className="font-black text-[10px] uppercase text-slate-500">{slot.label}</label>
                {adsData[slot.id] && (
                   <button 
                    onClick={() => handleDeleteAd(slot.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                )}
             </div>
             
             <div className="relative h-40 w-full border-4 border-slate-900 rounded-3xl overflow-hidden bg-white shadow-inner">
                {adsData[slot.id] ? (
                  <>
                    {/* VISTA PREVIA DE LA PUBLICIDAD ACTUAL */}
                    <img src={adsData[slot.id]} className="w-full h-full object-cover" alt="Actual" />
                    
                    {/* CAPA PARA EDITAR/CAMBIAR */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                       <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-30" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadAd(slot.id, file);
                        }}
                       />
                       <Upload className="text-white mb-2" size={32} />
                       <span className="text-white font-black text-[10px] uppercase">Click para Cambiar</span>
                    </div>
                  </>
                ) : (
                  /* CUADRO PARA SUBIR SI ESTÁ VACÍO */
                  <div className="relative h-full w-full flex flex-col items-center justify-center border-4 border-dashed border-slate-200">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-30" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadAd(slot.id, file);
                      }}
                    />
                    <ImageIcon className="text-slate-200" size={40} />
                    <span className="text-slate-300 font-black text-[9px] uppercase mt-2">Sin publicidad asignada</span>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-white/90 z-40 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-2" />
                    <span className="text-[10px] font-black uppercase text-emerald-600 italic">Actualizando Bóveda...</span>
                  </div>
                )}
             </div>
          </div>
        ))}
     </div>
  </div>
)}
