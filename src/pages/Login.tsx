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

const localization = {
  variables: {
    sign_in: {
      email_label: "E-mail",
      password_label: "Senha",
      email_input_placeholder: "Seu e-mail",
      password_input_placeholder: "Sua senha",
      button_label: "Entrar",
      link_text: "Já tem uma conta? Entrar",
      loading_button_label: "Entrando...",
      social_provider_text: "Entrar com {{provider}}",
      link_text_forgot_password: "Esqueceu a senha?",
      link_text_magic_link: "Entrar com link mágico",
      no_account_text: "Não tem uma conta?",
      sign_up_link: "Registrar",
    },
    sign_up: {
      email_label: "E-mail",
      password_label: "Senha",
      email_input_placeholder: "Seu e-mail",
      password_input_placeholder: "Crie uma senha",
      button_label: "Registrar",
      loading_button_label: "Registrando...",
      link_text: "Não tem uma conta? Registrar",
      social_provider_text: "Registrar com {{provider}}",
      link_text_sign_in: "Já tem uma conta? Entrar",
    },
    forgotten_password: {
      email_label: "E-mail",
      email_input_placeholder: "Seu e-mail",
      button_label: "Enviar link de recuperação",
      loading_button_label: "Enviando...",
      link_text: "Voltar para o login",
    },
    magic_link: {
      email_input_label: "E-mail",
      email_input_placeholder: "Seu e-mail",
      button_label: "Enviar link mágico",
      loading_button_label: "Enviando...",
      link_text: "Voltar para o login",
    },
    update_password: {
      password_label: "Nova senha",
      password_input_placeholder: "Digite a nova senha",
      button_label: "Atualizar senha",
      loading_button_label: "Atualizando...",
    },
  },
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
          localization={localization}
        />
      </div>
    </div>
  );
};

export default Login;