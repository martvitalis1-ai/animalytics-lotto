import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlayCircle, BookOpen, AlertCircle } from "lucide-react";

export function GuiaUso() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGuia = async () => {
      try {
        // Consultamos la tabla manual_guia que creaste en SQL
        const { data: guia, error: fetchError } = await supabase
          .from('manual_guia')
          .select('*')
          .single();
        
        if (fetchError) throw fetchError;
        if (guia) setData(guia);
      } catch (err) {
        console.error("Error cargando la guía:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchGuia();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando Guía Maestra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
        <p className="text-sm font-bold uppercase">No se pudo cargar la guía. Verifica la tabla 'manual_guia' en Supabase.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <Card className="glass-card border-2 border-primary/30 overflow-hidden shadow-2xl rounded-[2rem]">
        <CardHeader className="bg-muted/10 border-b border-primary/10 py-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase italic text-primary tracking-tighter">
            <PlayCircle className="w-8 h-8 text-primary" /> {data?.titulo || "Guía de Entrenamiento"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* REPRODUCTOR DE VIDEO DE SUPABASE */}
          <div className="aspect-video bg-black w-full shadow-inner relative flex items-center justify-center border-b-2 border-primary/10">
            {data?.video_url ? (
              <video 
                controls 
                className="w-full h-full object-contain"
                poster="/placeholder.svg"
              >
                <source src={data.video_url} type="video/mp4" />
                Tu navegador no soporta el reproductor de video.
              </video>
            ) : (
              <div className="text-center p-10">
                <PlayCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase text-muted-foreground">Esperando carga de video...</p>
              </div>
            )}
          </div>

          {/* EXPLICACIÓN EN TEXTO */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-xs">
              <BookOpen className="w-4 h-4" /> Instrucciones del Sistema
            </div>
            
            <div className="bg-muted/30 p-6 rounded-2xl border-2 border-primary/5 shadow-inner">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap font-bold text-sm md:text-base italic">
                {data?.explicacion || "No hay texto explicativo disponible todavía."}
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">
                Sigue estas instrucciones al pie de la letra para maximizar tus aciertos. El sistema se actualiza diariamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
          Actualizado: {data?.fecha_actualizacion ? new Date(data.fecha_actualizacion).toLocaleDateString() : 'Recientemente'}
        </span>
      </div>
    </div>
  );
}
