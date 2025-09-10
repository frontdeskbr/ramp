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

interface ConversionResponse {
  info: {
    data: {
      quote: {
        [key: string]: {
          price: number;
        }
      }
    }
  }
}

interface TransactionResponse {
  info: {
    data: {
      tid: number;
      address_smart_contract: string;
    }
  }
}

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [transactionDetails, setTransactionDetails] = useState<{
    tid: number;
    addressSmartContract: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchChains();
  }, []);

  useEffect(() => {
    if (selectedChain) {
      fetchCurrencies();
    }
  }, [selectedChain]);

  const fetchChains = async () => {
    try {
      const response = await fetch(`${BASE_URL}/chains`, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = await response.json();
      const chainsArray: Chain[] = Object.entries(data.info.data.chains)
        .map(([key, value]) => ({
          chainId: key,
          ...(value as Chain)
        }))
        .filter(chain => chain.enable);

      setChains(chainsArray);
      
      const polygonChain = chainsArray.find(chain => chain.chainName === "Polygon");
      if (polygonChain) {
        setSelectedChain(polygonChain.chainId);
      }
    } catch (error) {
      toast.error("Erro ao buscar redes blockchain");
      console.error(error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/currencies/${parseInt(selectedChain)}`, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = await response.json();
      const currenciesArray: Currency[] = Object.entries(data.info.data.tokens)
        .map(([key, value]) => ({
          symbol: key,
          ...(value as Currency)
        }))
        .filter(currency => currency.enable);

      setCurrencies(currenciesArray);
      
      const maticCurrency = currenciesArray.find(currency => currency.symbol === "MATIC");
      if (maticCurrency) {
        setSelectedCurrency(maticCurrency.symbol);
      }
    } catch (error) {
      toast.error("Erro ao buscar moedas");
      console.error(error);
    }
  };

  const convertPrice = async () => {
    if (!amount || !selectedCurrency) {
      toast.error("Selecione um valor e uma moeda");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/transaction/price_conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          id: 2783,
          amount: amount.replace(',', '.'),
          convert: selectedCurrency,
          currency_from_symbol: 'BRL'
        })
      });
      
      const data: ConversionResponse = await response.json();
      const convertedValue = data.info.data.quote[selectedCurrency].price.toFixed(4);
      
      setConvertedAmount(convertedValue);
      toast.success(`Valor convertido: ${convertedValue} ${selectedCurrency}`);
    } catch (error) {
      toast.error("Erro ao converter valor");
      console.error(error);
    }
  };

  const createTransaction = async () => {
    if (!convertedAmount) {
      toast.error("Primeiro converta o valor");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/transaction/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          transaction: {
            transaction_data: {
              buyer_name: "Cliente",
              buyer_email: "cliente@exemplo.com",
              total_discount: 0,
              amount_brl: Math.round(parseFloat(amount.replace(',', '.')) * 100),
              amount_crypto: convertedAmount,
              chain_id: selectedChain,
              currency_symbol: selectedCurrency,
              custom_id: `TX_${Date.now()}`,
              notification_url: "https://seudominio.com/webhook"
            },
            transaction_items: [
              {
                description: "Transação Cripto",
                quantity: 1,
                discount: 0,
                amount: Math.round(parseFloat(amount.replace(',', '.')) * 100)
              }
            ]
          }
        })
      });
      
      const data: TransactionResponse = await response.json();
      
      setTransactionDetails({
        tid: data.info.data.tid,
        addressSmartContract: data.info.data.address_smart_contract
      });
      
      toast.success("Transação criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar transação");
      console.error(error);
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
                  {chain.chainName}
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

          <Button 
            onClick={convertPrice} 
            className="w-full"
            disabled={!amount || !selectedCurrency}
          >
            Converter Valor
          </Button>

          {convertedAmount && (
            <div className="text-center">
              <p>Valor convertido: {convertedAmount} {selectedCurrency}</p>
            </div>
          )}

          <Button 
            onClick={createTransaction} 
            className="w-full"
            disabled={!convertedAmount || isLoading}
          >
            {isLoading ? "Criando Transação..." : "Criar Transação"}
          </Button>

          {transactionDetails && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p>TID: {transactionDetails.tid}</p>
              <p>Endereço do Contrato: {transactionDetails.addressSmartContract}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};