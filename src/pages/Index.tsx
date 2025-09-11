import { PixGenerator } from "@/components/PixGenerator";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Gerador de PIX Instantâneo
        </h1>
        <PixGenerator />
      </div>
    </div>
  );
};

export default Index;