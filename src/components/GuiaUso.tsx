import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlayCircle, BookOpen } from "lucide-react";

export function GuiaUso() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: res } = await supabase.from('manual_guia').select('*').maybeSingle();
        if (res) setData(res);
      } catch (e) { console.error("Error en Guia:", e); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="glass-card border-2 border-primary/30 overflow-hidden shadow-2xl rounded-[2rem]">
        <CardHeader className="bg-muted/10 border-b border-primary/10 py-6 text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-black uppercase italic text-primary tracking-tighter">
            <PlayCircle className="w-8 h-8" /> {data?.titulo || "Manual de Usuario"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-black w-full flex items-center justify-center border-b-2 border-primary/10">
            {data?.video_url ? (
              <video controls className="w-full h-full object-contain">
                <source src={data.video_url} type="video/mp4" />
                Tu navegador no soporta video.
              </video>
            ) : (
              <p className="text-muted-foreground uppercase font-black text-[10px] italic">Esperando video en Supabase...</p>
            )}
          </div>
          <div className="p-8 space-y-4 text-left">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <BookOpen className="w-4 h-4" /> Instrucciones del Sistema
            </div>
            <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap italic text-foreground">
              {data?.explicacion || "Contenido en edición desde Supabase..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
