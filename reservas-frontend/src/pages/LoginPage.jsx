import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "1rem"
      }}
    >
      <h1>Sistema de Reserva de Aulas</h1>

      <button onClick={login}>
        Iniciar sesión
      </button>
    </div>
  );
}