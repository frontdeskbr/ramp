import React, { useEffect } from "react";
import { useSession } from "@/components/SessionContextProvider";
import { useNavigate } from "react-router-dom";

export const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/login");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">Carregando...</span>
      </div>
    );
  }

  return <>{children}</>;
};