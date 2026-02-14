import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, lottery_type = 'lotto_activo' } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // CONSULTA AL CEREBRO ANALÍTICO
    const { data: estudio } = await supabase
      .from('super_pronostico_final')
      .select('*')
      .eq('lottery_type', lottery_type)
      .maybeSingle();

    const context = estudio ? `
      RESULTADOS DEL ESTUDIO PROFUNDO (Desde Enero):
      - Último animal que salió: ${estudio.ultimo_animal}
      - Por Secuencia Histórica toca: ${estudio.favorito_secuencia}
      - Por Desglose Matemático toca: ${estudio.suma_desglose}
      - Por Suma Directa toca: ${estudio.suma_directa}
      - Nivel detectado: ${estudio.nivel_confianza}
    ` : "No hay datos suficientes todavía.";

    const systemPrompt = `Eres Ricardo, el experto número 1 de Venezuela. 
    Usa el siguiente contexto real para dar tu pronóstico. 
    No inventes, usa estos números. Habla coloquial: "¡Epa mi pana!", "Échale bola".
    ${context}
    Si la secuencia y la matemática coinciden, di que es un TRIPLE FIJO DE TAQUILLA.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
        temperature: 0.8,
      }),
    });

    const aiData = await response.json();
    return new Response(JSON.stringify({ response: aiData.choices?.[0]?.message?.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
