import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePix = async () => {
    if (!amount) {
      toast.error("Por favor, insira um valor");
      return;
    }

    setIsLoading(true);
    setDebugInfo("Iniciando requisição...");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch('https://trvgqfnvoymwgxtlkpvi.supabase.co/functions/v1/pix-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amountBRL: amount }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(`Erro na resposta: ${response.status} - ${errorText}`);
        toast.error(`Erro: ${response.statusText}`);
        return;
      }

      const responseText = await response.text();
      setDebugInfo(`Resposta bruta: ${responseText}`);

      try {
        const data = JSON.parse(responseText);

        if (data.ok) {
          setQrCode(data.qrImage);
          setPixCode(data.pixCopiaCola);
          toast.success("PIX gerado com sucesso!");
        } else {
          toast.error(data.error || "Erro ao gerar PIX");
        }
      } catch (parseError) {
        setDebugInfo(`Erro ao parsear JSON: ${parseError}`);
        toast.error("Erro ao processar resposta");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDebugInfo(`Erro completo: ${errorMessage}`);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Tempo limite excedido. Tente novamente.");
      } else {
        toast.error("Erro ao conectar com o serviço de PIX");
      }
      
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX copiado!");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerador de PIX</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor do PIX (ex: 250,00)"
            className="w-full"
          />
          <Button 
            onClick={generatePix} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Gerando..." : "Gerar PIX"}
          </Button>

          {debugInfo && (
            <div className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">
              <pre>{debugInfo}</pre>
            </div>
          )}

          {qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={qrCode} 
                alt="QR Code PIX" 
                className="w-48 h-48 object-contain"
              />
              <div className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={copyPixCode}
                >
                  Copiar Código PIX
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};