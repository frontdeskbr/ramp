import { MadeWithDyad } from "@/components/made-with-dyad";
import { PixGenerator } from "@/components/PixGenerator";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
      <h1 className="text-4xl font-bold mb-4">Gerador de QR Code PIX</h1>
      <p className="text-xl text-gray-600 mb-6">
        Gere um QR Code PIX para comprar SOL na 4p.finance
      </p>
      <PixGenerator />
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;