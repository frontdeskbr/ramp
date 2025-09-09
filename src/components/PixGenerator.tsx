import React, { useState } from "react";
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

export const PixGenerator: React.FC = () => {
  const [amount, setAmount] = useState("250,00");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PixResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8080/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountBRL: amount }),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) {
        toast.success("PIX gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar PIX: " + (data.error || "Desconhecido"));
      }
    } catch (err: any) {
      toast.error("Erro de conexão com o backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 p-6">
      <h2 className="text-xl font-bold mb-4">Gerar QR PIX (4p.finance)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL (ex: 250,00)"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Gerando..." : "Gerar PIX"}
        </Button>
      </form>
      {result && (
        <div className="mt-6">
          {result.qrImage && (
            <img
              src={result.qrImage}
              alt="QR Code PIX"
              className="mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-gray-800"
              style={{ width: 220, height: 220 }}
            />
          )}
          {result.pixCopiaCola && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">PIX copia e cola:</label>
              <textarea
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 text-xs"
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
          {result.error && (
            <div className="text-red-500 mt-2">{result.error}</div>
          )}
        </div>
      )}
    </Card>
  );
};