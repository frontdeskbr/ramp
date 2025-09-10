import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";
const BASE_URL = "https://api.4p.finance/v1";

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

        logDebug(`Status da resposta: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        logDebug(`Resposta bruta: ${text}`);

        const data = JSON.parse(text);
        logDebug(`Dados parseados: ${JSON.stringify(data, null, 2)}`);

        // Verificação detalhada da estrutura da resposta
        if (!data.info || !data.info.data || !data.info.data.chains) {
          throw new Error("Estrutura de dados de redes inválida");
        }

        const chainsArray: Chain[] = Object.entries(data.info.data.chains)
          .map(([key, value]) => ({
            chainId: key,
            ...(value as Chain)
          }))
          .filter(chain => chain.enable);

        logDebug(`Redes processadas: ${JSON.stringify(chainsArray, null, 2)}`);

        setChains(chainsArray);
        
        const polygonChain = chainsArray.find(chain => chain.chainName === "Polygon");
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

  useEffect(() => {
    const fetchCurrencies = async () => {
      if (!selectedChain) return;

      try {
        logDebug(`Buscando moedas para chain: ${selectedChain}`);
        
        const response = await fetch(`${BASE_URL}/currencies/${parseInt(selectedChain)}`, {
          method: 'GET',
          headers: { 
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });

        logDebug(`Status da resposta de moedas: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        logDebug(`Resposta bruta de moedas: ${text}`);

        const data = JSON.parse(text);
        logDebug(`Dados de moedas parseados: ${JSON.stringify(data, null, 2)}`);

        // Verificação detalhada da estrutura da resposta
        if (!data.info || !data.info.data || !data.info.data.tokens) {
          throw new Error("Estrutura de dados de moedas inválida");
        }

        const currenciesArray: Currency[] = Object.entries(data.info.data.tokens)
          .map(([key, value]) => ({
            symbol: key,
            ...(value as Currency)
          }))
          .filter(currency => currency.enable);

        logDebug(`Moedas processadas: ${JSON.stringify(currenciesArray, null, 2)}`);

        setCurrencies(currenciesArray);
        
        const maticCurrency = currenciesArray.find(currency => currency.symbol === "MATIC");
        if (maticCurrency) {
          setSelectedCurrency(maticCurrency.symbol);
        } else if (currenciesArray.length > 0) {
          setSelectedCurrency(currenciesArray[0].symbol);
        }
      } catch (error) {
        logDebug(`Erro detalhado de moedas: ${error instanceof Error ? error.message : String(error)}`);
        toast.error(`Erro ao buscar moedas: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchCurrencies();
  }, [selectedChain]);

  // Resto do código permanece o mesmo...

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