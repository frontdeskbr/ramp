import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "https://api.4p.finance/v1";
const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

interface Chain {
  chainIdHex: string;
  chainId: number;
  chainName: string;
  enable: boolean;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

interface ChainsResponse {
  http_code: number;
  success: boolean;
  info: {
    result: string;
    message: string;
    data: {
      chains: {
        [chainIdHex: string]: Chain;
      };
    };
  };
}

export const PixGenerator: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  };

  const fetchChains = async () => {
    try {
      setIsLoading(true);
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

      const data: ChainsResponse = await response.json();
      logDebug(`Dados parseados: ${JSON.stringify(data, null, 2)}`);

      // Transformar o objeto de chains em um array
      const chainsArray = Object.entries(data.info.data.chains)
        .filter(([_, chain]) => chain.enable)
        .map(([chainIdHex, chain]) => ({
          ...chain,
          chainIdHex
        }));

      logDebug(`Redes processadas: ${JSON.stringify(chainsArray, null, 2)}`);

      setChains(chainsArray);
      
      // Selecionar automaticamente a primeira rede ativa
      if (chainsArray.length > 0) {
        setSelectedChain(chainsArray[0].chainIdHex);
      }
    } catch (error) {
      logDebug(`Erro detalhado: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Erro ao buscar redes: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChains();
  }, []);

  const handleGenerateTransaction = () => {
    if (!amount || !selectedChain) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Lógica de geração de transação será implementada posteriormente
    toast.info(`Preparando transação de ${amount} na rede ${selectedChain}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerador de Transação Cripto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-100 p-2 rounded text-center">
            <p className="text-sm text-blue-800">
              Selecione uma rede suportada para sua transação
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">Selecione a Rede</label>
            <select 
              value={selectedChain || ''} 
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading || chains.length === 0}
            >
              {chains.map(chain => (
                <option key={chain.chainIdHex} value={chain.chainIdHex}>
                  {chain.chainName} ({chain.chainIdHex})
                </option>
              ))}
            </select>
          </div>

          {selectedChain && (
            <div className="bg-gray-100 p-3 rounded">
              <h3 className="font-semibold mb-2">Detalhes da Rede</h3>
              <p>Moeda Nativa: {chains.find(c => c.chainIdHex === selectedChain)?.nativeCurrency.name}</p>
              <p>Símbolo: {chains.find(c => c.chainIdHex === selectedChain)?.nativeCurrency.symbol}</p>
            </div>
          )}

          <Button 
            onClick={handleGenerateTransaction}
            className="w-full"
            disabled={isLoading || !amount || !selectedChain}
          >
            {isLoading ? "Carregando..." : "Gerar Transação"}
          </Button>

          {/* Debug area */}
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};