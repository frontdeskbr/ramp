import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "https://api.4p.finance/v1";
const API_KEY = "VCtEZPZKKc33BvoN3hq1O1JacCr7RM8K8zylcx83";

interface Chain {
  chainIdHex: string;
  chainId: number;
  chainName: string;
  enable: boolean;
}

interface Token {
  enable: boolean;
  chainid: number;
  ChainName: string;
  chainidhex: string;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
}

interface TokensResponse {
  http_code: number;
  success: boolean;
  info: {
    result: string;
    message: string;
    data: {
      tokens: {
        [symbol: string]: {
          enable: boolean;
          chainid: number;
          ChainName: string;
          chainidhex: string;
          symbol: string;
          name: string;
          decimals: number;
          address: string;
          logoURI: string;
        };
      };
    };
  };
}

export const PixGenerator: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  };

  const fetchTokens = async (chainId: string) => {
    try {
      setIsLoading(true);
      logDebug(`Buscando tokens para rede ${chainId}...`);
      
      const response = await fetch(`${BASE_URL}/currencies/${chainId}`, {
        method: 'GET',
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logDebug(`Erro da resposta: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokensResponse = await response.json();
      const tokensArray = Object.entries(data.info.data.tokens)
        .filter(([_, token]) => token.enable)
        .map(([symbol, token]) => ({
          ...token,
          symbol: symbol
        }));

      setTokens(tokensArray);
      
      if (tokensArray.length > 0) {
        setSelectedToken(tokensArray[0].symbol);
      }
    } catch (error) {
      logDebug(`Erro detalhado: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Erro ao buscar tokens: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same...

  return (
    <Card className="w-full max-w-md mx-auto">
      {/* Component JSX remains the same */}
    </Card>
  );
};