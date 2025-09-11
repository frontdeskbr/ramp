import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "https://api.4p.finance/v1";
const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePix = async () => {
    if (!amount) {
      toast.error("Por favor, insira um valor");
      return;
    }

    try {
      setIsLoading(true);
      
      // Gerar PIX usando a API
      const response = await fetch(`${BASE_URL}/transaction/create/`, {
        method: 'POST',
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction: {
            transaction_data: {
              amount_brl: Math.round(parseFloat(amount.replace(',', '.')) * 100),
              currency_symbol: "BRL",
              custom_id: `PIX_${Date.now()}`
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar PIX');
      }

      const data = await response.json();
      
      // Gerar QR Code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data.pixCopiaCola)}`;
      
      setQrCode(qrCodeUrl);
      toast.success("PIX gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PIX");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Gerador de PIX Instantâneo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor do PIX (ex: 50,00)"
              className="w-full"
              disabled={isLoading}
            />
            
            <Button 
              onClick={generatePix}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Gerando..." : "Gerar PIX"}
            </Button>

            {qrCode && (
              <div className="flex justify-center mt-4">
                <img 
                  src={qrCode} 
                  alt="QR Code PIX" 
                  className="max-w-full h-auto"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixGenerator;