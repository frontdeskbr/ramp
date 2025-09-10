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

  useEffect(() => {
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

        const data = await response.json();
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
        logDebug(`Erro detalhado: ${error instanceof Error ? error.message : String(error)}`);
        toast.error(`Erro ao buscar redes: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChains();
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      if (!selectedChain) return;

      try {
        setIsLoading(true);
        logDebug(`Buscando moedas para chain: ${selectedChain}`);
        
        const response = await fetch(`${BASE_URL}/currencies/${selectedChain}`, {
          method: 'GET',
          headers: { 
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });

        logDebug(`URL da requisição: ${BASE_URL}/currencies/${selectedChain}`);
        logDebug(`Status da resposta de moedas: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          logDebug(`Erro da resposta de moedas: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logDebug(`Dados de moedas parseados: ${JSON.stringify(data, null, 2)}`);

        const currenciesArray: Currency[] = Object.entries(data)
          .filter(([_, value]) => (value as any).enabled)
          .map(([key, value]) => ({
            symbol: key,
            name: (value as any).name || key,
            address: (value as any).address || '',
            decimals: (value as any).decimals || 0,
            enabled: (value as any).enabled
          }));

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, [selectedChain]);

  const handleGenerateTransaction = async () => {
    if (!amount || !selectedChain || !selectedCurrency) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      logDebug(`Gerando transação: ${amount} ${selectedCurrency} na rede ${selectedChain}`);

      const response = await fetch(`${BASE_URL}/generate-transaction`, {
        method: 'POST',
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          chain: selectedChain,
          currency: selectedCurrency
        })
      });

      logDebug(`URL da requisição: ${BASE_URL}/generate-transaction`);
      logDebug(`Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        logDebug(`Erro da resposta: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logDebug(`Dados da transação: ${JSON.stringify(data, null, 2)}`);

      setQrCode(data.qrCode);
      toast.success("Transação gerada com sucesso!");
    } catch (error) {
      logDebug(`Erro detalhado: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Erro ao gerar transação: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Selecione a Rede</label>
            <select 
              value={selectedChain} 
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading || chains.length === 0}
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} ({chain.id})
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
              disabled={isLoading || currencies.length === 0}
            >
              {currencies.map(currency => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handleGenerateTransaction}
            className="w-full"
            disabled={isLoading || !amount || !selectedChain || !selectedCurrency}
          >
            {isLoading ? "Gerando..." : "Gerar Transação"}
          </Button>

          {qrCode && (
            <div className="mt-4 text-center">
              <img 
                src={qrCode} 
                alt="QR Code da Transação" 
                className="mx-auto max-w-full h-auto"
              />
            </div>
          )}

          {/* Debug area */}
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};