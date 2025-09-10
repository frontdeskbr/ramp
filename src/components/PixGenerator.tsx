import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "https://ramp-production-789f.up.railway.app/v1";
const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";

interface Chain {
  chainId: string;
  chainName: string;
  enable: boolean;
  chainIdHex: string;
}

interface Currency {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  enable: boolean;
}

export const PixGenerator: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  };

  useEffect(() => {
    const fetchChains = async () => {
      try {
        logDebug("Iniciando busca de redes...");
        
        const response = await fetch(`${BASE_URL}/chains`, {
          method: 'GET',
          headers: { 
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });

        logDebug(`URL da requisição: ${BASE_URL}/chains`);
        logDebug(`Status da resposta: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          logDebug(`Erro da resposta: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        logDebug(`Resposta bruta: ${text}`);

        const data = JSON.parse(text);
        logDebug(`Dados parseados: ${JSON.stringify(data, null, 2)}`);

        // Log detalhado da estrutura da resposta
        logDebug(`Estrutura da resposta: ${Object.keys(data)}`);

        // Ajuste na lógica de processamento das chains
        const chainsArray: Chain[] = Object.entries(data)
          .filter(([key, value]) => typeof value === 'object' && (value as any).enable)
          .map(([key, value]) => ({
            chainId: key,
            chainName: (value as any).chainName || key,
            enable: (value as any).enable,
            chainIdHex: (value as any).chainIdHex || ''
          }));

        logDebug(`Redes processadas: ${JSON.stringify(chainsArray, null, 2)}`);

        setChains(chainsArray);
        
        const polygonChain = chainsArray.find(chain => chain.chainName.toLowerCase().includes("polygon"));
        if (polygonChain) {
          setSelectedChain(polygonChain.chainId);
        } else if (chainsArray.length > 0) {
          setSelectedChain(chainsArray[0].chainId);
        }
      } catch (error) {
        logDebug(`Erro detalhado: ${error instanceof Error ? error.message : String(error)}`);
        toast.error(`Erro ao buscar redes: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchChains();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerador de Transação Cripto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor em BRL (ex: 250,00)"
            className="w-full"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Selecione a Rede</label>
            <select 
              value={selectedChain} 
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {chains.map(chain => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.chainName} ({chain.chainId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Selecione a Moeda</label>
            <select 
              value={selectedCurrency} 
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {currencies.map(currency => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Debug area */}
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};