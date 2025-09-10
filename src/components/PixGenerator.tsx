import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);

  const generatePix = async () => {
    if (!amount) {
      toast.error("Por favor, insira um valor");
      return;
    }

    try {
      const response = await fetch('https://trvgqfnvoymwgxtlkpvi.supabase.co/functions/v1/pix-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amountBRL: amount })
      });

      const data = await response.json();

      if (data.ok) {
        setQrCode(data.qrImage);
        setPixCode(data.pixCopiaCola);
        toast.success("PIX gerado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao gerar PIX");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o serviço de PIX");
      console.error(error);
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
          >
            Gerar PIX
          </Button>

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