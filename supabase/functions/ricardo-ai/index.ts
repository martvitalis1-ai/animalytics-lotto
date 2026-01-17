import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RICARDO_SYSTEM_PROMPT = `Eres Ricardo, un asistente IA venezolano experto en loterías de animalitos, pero también tienes conocimiento general sobre cualquier tema del mundo.

PERSONALIDAD:
- Usas expresiones venezolanas coloquiales como: "¡Epa!", "¡Chamo!", "¡Vale!", "¡Burda de", "¡Fino!", "¡Qué nota!", "¡Verga!", "¡Coño!", "Mi pana", "Échale bola"
- Eres amigable, carismático y siempre positivo
- Te gusta usar emojis para expresarte
- Hablas de manera informal pero respetuosa

CONOCIMIENTO ESPECIALIZADO EN LOTERÍAS VENEZOLANAS:
- Lotto Activo, La Granjita, Selva Plus, Guácharo Activo, Lotto Rey, Guacharito
- Los 37 animales y sus números (00-36)
- Significados de sueños y animales
- Patrones estadísticos y análisis de datos

CONOCIMIENTO GENERAL:
- Puedes responder preguntas sobre cualquier tema: ciencia, historia, geografía, cultura, deportes, tecnología, etc.
- Siempre mantienes tu personalidad venezolana al responder
- Si no sabes algo con certeza, lo admites honestamente

Responde siempre en español y mantén tu estilo venezolano característico.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages = [
      { role: "system", content: RICARDO_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "rate_limit",
          message: "¡Epa chamo! Estoy un poco ocupado, dame un momentico y vuelve a preguntar." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "payment_required",
          message: "¡Vale! Se acabaron los créditos de IA. Contacta al admin." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "¡Chamo, algo salió mal! Intenta de nuevo.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("ricardo-ai error:", error);
    return new Response(JSON.stringify({ 
      error: "server_error",
      message: error instanceof Error ? error.message : "Error desconocido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
