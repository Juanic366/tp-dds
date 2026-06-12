import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CallbackPage() {
  const { saveToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function procesarLogin() {
      await saveToken(token);
      navigate("/reservas");
    }

    procesarLogin();
  }, []);

  return <h2>Iniciando sesión...</h2>;
}