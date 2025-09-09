import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type PixResult = {
  ok: boolean;
  amountBRL: string;
  qrImage: string | null;
  pixCopiaCola: string | null;
  detalhes: Record<string, string>;
  error?: string;
};

const DEFAULT_BACKEND_URL = "http://localhost:8080/scrape";
const BACKEND_URL_KEY = "pix_backend_url";

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("250,00");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PixResult | null>(null);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [backendUrlInput, setBackendUrlInput] = useState(DEFAULT_BACKEND_URL);
  const [testingBackend, setTestingBackend] = useState(false);

  // Carrega a URL do backend do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem(BACKEND_URL_KEY);
    if (saved) {
      setBackendUrl(saved);
      setBackendUrlInput(saved);
    }
  }, []);

  // Salva a URL do backend no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(BACKEND_URL_KEY, backendUrl);
  }, [backendUrl]);

  const handleBackendUrlChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = backendUrlInput.trim();
    setTestingBackend(true);
    // Testa conexão com o backend
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountBRL: "1,00" }),
      });
      if (!res.ok) throw new Error();
      setBackendUrl(url);
      toast.success("URL do backend salva e conexão bem-sucedida!");
    } catch {
      toast.error(
        "Não foi possível conectar ao backend nesta URL. Verifique se o backend está rodando, se a URL está correta e se o CORS está habilitado."
      );
    } finally {
      setTestingBackend(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountBRL: amount }),
      });
      if (!res.ok) {
        throw new Error("Falha ao conectar ao backend.");
      }
      const data = await res.json();
      setResult(data);
      if (data.ok) {
        toast.success("PIX gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar PIX: " + (data.error || "Desconhecido"));
      }
    } catch (err: any) {
      toast.error(
        "Erro de conexão com o backend. Verifique se o backend está rodando, se a URL está correta e se o CORS está habilitado: " +
          backendUrl
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Gerar QR PIX (4p.finance)</h2>
      <form onSubmit={handleBackendUrlChange} className="flex items-center gap-2 mb-4">
        <Input
          type="text"
          value={backendUrlInput}
          onChange={(e) => setBackendUrlInput(e.target.value)}
          placeholder="URL do backend (ex: http://localhost:8080/scrape)"
          className="text-xs"
        />
        <Button type="submit" variant="secondary" className="text-xs px-3 py-2" disabled={testingBackend}>
          {testingBackend ? "Testando..." : "Salvar URL"}
        </Button>
      </form>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL (ex: 250,00)"
          required
        />
        <Button type="submit" disabled={loading} className="shadow-none">
          {loading ? "Gerando..." : "Gerar PIX"}
        </Button>
      </form>
      {result && (
        <div className="mt-6">
          {result.qrImage && (
            <img
              src={result.qrImage}
              alt="QR Code PIX"
              className="mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-none"
              style={{ width: 220, height: 220 }}
            />
          )}
          {result.pixCopiaCola && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">PIX copia e cola:</label>
              <textarea
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 text-xs shadow-none"
                rows={2}
                value={result.pixCopiaCola}
                readOnly
              />
            </div>
          )}
          {result.detalhes && (
            <div className="mt-2 text-xs">
              <h3 className="font-semibold mb-1">Detalhes:</h3>
              <ul className="space-y-1">
                {Object.entries(result.detalhes).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-medium">{k}:</span> {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result?.error && (
            <div className="text-red-500 mt-2">{result.error}</div>
          )}
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        <span>
          Backend: <code>{backendUrl}</code>
        </span>
      </div>
    </Card>
  );
};