import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getTitle = (hash: string) => {
  if (hash.includes("sign_up")) return "Registrar";
  if (hash.includes("forgotten_password")) return "Recuperar senha";
  if (hash.includes("magic_link")) return "Entrar com link mágico";
  if (hash.includes("update_password")) return "Atualizar senha";
  return "Entrar";
};

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState(getTitle(window.location.hash));

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  useEffect(() => {
    const onHashChange = () => setTitle(getTitle(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;