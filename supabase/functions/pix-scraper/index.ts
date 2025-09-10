import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve((req: Request) => {
  // Log de todos os headers recebidos
  console.log("Headers recebidos:", Object.fromEntries(req.headers));

  if (req.method === "OPTIONS") {
    console.log("Respondendo preflight OPTIONS");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  if (req.method !== "POST") {
    console.log(`Método não permitido: ${req.method}`);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "Método não permitido" 
    }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return (async () => {
    try {
      console.log("Recebendo requisição de PIX");
      
      const body = await req.json();
      console.log("Corpo da requisição:", JSON.stringify(body, null, 2));
      
      const { amountBRL } = body;
      
      if (!amountBRL) {
        console.error("Valor não informado");
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "Valor não informado" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log(`Gerando PIX para valor: ${amountBRL}`);

      const pixCopiaCola = `00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${amountBRL.replace(",", ".")}5802BR5920NOME DO RECEBEDOR6009SAO PAULO62070503***6304ABCD`;
      
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCopiaCola)}`;

      console.log("PIX gerado com sucesso");

      return new Response(
        JSON.stringify({
          ok: true,
          amountBRL,
          qrImage,
          pixCopiaCola,
          detalhes: {
            valor: amountBRL,
            recebedor: "NOME DO RECEBEDOR",
            cidade: "SAO PAULO",
          },
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } catch (e) {
      console.error("Erro na geração de PIX:", e);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "Erro interno: " + (e instanceof Error ? e.message : String(e)) 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }
      });
    }
  })();
});