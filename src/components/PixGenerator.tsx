import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "https://ramp-production-789f.up.railway.app/v1";
const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";

interface Chain {
  id: string;
  name: string;
  enabled: boolean;
}

interface Currency {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  enabled: boolean;
}

export const PixGenerator: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  };

  const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
    try {
      logDebug(`Tentando buscar: ${url}`);
      
      const fullOptions = {
        ...options,
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const response = await fetch(url, fullOptions);
      
      logDebug(`Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        logDebug(`Erro da resposta: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logDebug(`Erro de fetch: ${error instanceof Error ? error.message : String(error)}`);
      
      // Detalhes adicionais de erro de rede
      if (error instanceof TypeError) {
        logDebug('Possíveis causas:');
        logDebug('- Sem conexão com a internet');
        logDebug('- Bloqueio por CORS');
        logDebug('- URL incorreta');
        logDebug('- Problemas no servidor');
      }

      throw error;
    }
  };

  useEffect(() => {
    const fetchChains = async () => {
      try {
        setIsLoading(true);
        logDebug("Iniciando busca de redes...");
        
        const data = await fetchWithErrorHandling(`${BASE_URL}/chains`);
        logDebug(`Dados parseados: ${JSON.stringify(data, null, 2)}`);

        const chainsArray: Chain[] = Object.entries(data)
          .filter(([_, value]) => (value as any).enabled)
          .map(([key, value]) => ({
            id: key,
            name: (value as any).name || key,
            enabled: (value as any).enabled
          }));

        logDebug(`Redes processadas: ${JSON.stringify(chainsArray, null, 2)}`);

        setChains(chainsArray);
        
        const polygonChain = chainsArray.find(chain => chain.name.toLowerCase().includes("polygon"));
        if (polygonChain) {
          setSelectedChain(polygonChain.id);
        } else if (chainsArray.length > 0) {
          setSelectedChain(chainsArray[0].id);
        }
      } catch (error) {
        toast.error(`Erro ao buscar redes: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChains();
  }, []);

  // Resto do código permanece o mesmo...

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerador de Transação Cripto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-100 p-2 rounded text-center">
            <p className="text-sm text-yellow-800">
              Se o carregamento falhar, verifique sua conexão ou tente novamente.
            </p>
          </div>

          <Input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor em BRL (ex: 250,00)"
            className="w-full"
            disabled={isLoading}
          />

          {/* Resto do componente permanece igual */}
        </div>
      </CardContent>
    </Card>
  );
};