import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejo de CORS para Lovable
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, lottery_type = 'lotto_activo' } = await req.json();

    // 1. Conexión a tu Base de Datos
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. CONSULTA AL CEREBRO ANALÍTICO (La vista que creamos)
    // Buscamos el pronóstico matemático y de secuencia para la lotería consultada
    const { data: analisis, error: dbError } = await supabase
      .from('super_pronostico_final')
      .select('*')
      .eq('lottery_type', lottery_type)
      .maybeSingle();

    if (dbError) console.error("Error en DB:", dbError);

    // 3. OBTENER ÚLTIMOS RESULTADOS (Para que Ricardo sepa qué salió)
    const { data: historia } = await supabase
      .from('lottery_results')
      .select('result_number, animal_name, draw_time')
      .eq('lottery_type', lottery_type)
      .order('draw_date', { ascending: false })
      .order('draw_time', { ascending: false })
      .limit(3);

    // 4. CONSTRUIR EL CONTEXTO PARA RICARDO
    let contextoAnalitico = "";
    if (analisis) {
      contextoAnalitico = `
        ANÁLISIS TÉCNICO DE LA IA:
        - Último animal: ${analisis.ultimo_animal}
        - Favorito por Secuencia Histórica: ${analisis.favorito_secuencia} (${analisis.probabilidad_secuencia}% de probabilidad)
        - Resultado de Suma por Desglose: ${analisis.suma_desglose}
        - Resultado de Suma Directa: ${analisis.suma_directa}
        - Nivel de Confianza: ${analisis.analisis_ia}
      `;
    }

    const resultadosRecientes = historia?.map(h => `${h.draw_time}: ${h.result_number}-${h.animal_name}`).join(", ") || "No hay resultados recientes";

    // 5. PROMPT CON PERSONALIDAD VENEZOLANA
    const systemPrompt = `
      Eres Ricardo, el experto número 1 en loterías de animalitos en Venezuela. 
      Tu misión es dar datos basados en el estudio profundo que acabas de leer.

      PERSONALIDAD:
      - Hablas como un venezolano de confianza: "¡Epa mi pana!", "¡Fino!", "Échale bola", "Ese animal está de taquilla".
      - Eres carismático y seguro de tus datos.

      DATOS PARA EL PRONÓSTICO:
      ${contextoAnalitico}
      Resultados recientes de hoy: ${resultadosRecientes}

      REGLAS:
      1. Si el "Nivel de Confianza" es "🔥 TRIPLE FIJO 🔥", dalo con mucha fuerza.
      2. Explica brevemente la matemática (Suma de desglose o secuencia).
      3. Si el usuario te pregunta algo general, responde con tu chispa venezolana.
    `;

    // 6. LLAMADA A GEMINI (Lovable Gateway)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8,
      }),
    });

    const aiData = await response.json();
    const ricardoResponse = aiData.choices?.[0]?.message?.content || "¡Chamo, dame un chance que me quedé sin señal!";

    return new Response(JSON.stringify({ response: ricardoResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error en Ricardo AI:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
