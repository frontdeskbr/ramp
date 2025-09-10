import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";
const BASE_URL = "https://api.4p.finance/v1";

interface Chain {
  chainId: string;
  chainName?: string;
  enable: boolean;
  chainIdHex: string;
}

interface Currency {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
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
        headers: {
          'x-api-key': API_KEY
        }
      });
      const data = await response.json();
      const chainsArray: Chain[] = Object.entries(data.info.data.chains).map(([key, value]) => ({
        chainId: key,
        ...(value as Chain)
      }));
      setChains(chainsArray);
      // Seleciona Polygon por padrão
      const polygonChain = chainsArray.find(chain => chain.chainName === "Polygon");
      if (polygonChain) {
        setSelectedChain(polygonChain.chainId);
      }
    } catch (error) {
      toast.error("Erro ao buscar redes");
      console.error(error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/currencies/${parseInt(selectedChain)}`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      const data = await response.json();
      const currenciesArray: Currency[] = Object.entries(data.info.data.tokens).map(([key, value]) => ({
        symbol: key,
        ...(value as Currency)
      }));
      setCurrencies(currenciesArray);
      // Seleciona MATIC por padrão
      const maticCurrency = currenciesArray.find(currency => currency.symbol === "MATIC");
      if (maticCurrency) {
        setSelectedCurrency(maticCurrency.symbol);
      }
    } catch (error) {
      toast.error("Erro ao buscar moedas");
      console.error(error);
    }
  };

  // Rest of the existing implementation...

  return (
    <Card className="w-full max-w-md mx-auto">
      {/* Existing JSX */}
    </Card>
  );
};