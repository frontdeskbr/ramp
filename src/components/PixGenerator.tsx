import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("250,00");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);

  const generatePix = async () => {
    try {
      // Simula geração de PIX
      const pixCodigoBase = "00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540";
      const valorFormatado = amount.replace(",", ".");
      const pixCompleto = `${pixCodigoBase}${valorFormatado}5802BR5920NOME DO RECEBEDOR6009SAO PAULO62070503***6304ABCD`;
      
      // Gera QR Code usando API pública
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCompleto)}`;

      setQrCode(qrCodeUrl);
      setPixCode(pixCompleto);

      toast.success("PIX gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PIX");
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