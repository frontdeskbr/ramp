/* eslint-disable @typescript-eslint/no-var-requires */
/* @ts-expect-error Deno import is valid in Supabase Edge Functions */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function gerarPixCopiaCola(valor: string) {
  // Simula um código PIX copia e cola
  return `00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${valor.replace(",", ".")}5802BR5920NOME DO RECEBEDOR6009SAO PAULO62070503***6304ABCD`;
}

function gerarQrImage(pix: string) {
  // Usa api.qrserver.com para gerar QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pix)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amountBRL } = await req.json();
    if (!amountBRL) {
      return new Response(JSON.stringify({ ok: false, error: "Valor não informado" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const pixCopiaCola = gerarPixCopiaCola(amountBRL);
    const qrImage = gerarQrImage(pixCopiaCola);

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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Erro interno" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});