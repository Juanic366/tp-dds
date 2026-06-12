import { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:3000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión guardada
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Iniciar login
  const login = () => {
    window.location.href =
      "http://localhost:3000/auth/login";
  };

  // Guardar token y obtener usuario
  const saveToken = async (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el usuario");
      }

      const data = await response.json();

      setUser(data.usuario);
      localStorage.setItem(
        "user",
        JSON.stringify(data.usuario)
      );
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  // Cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!token;

  const isAdmin =
    user?.roles?.includes("admin") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        saveToken,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider"
    );
  }

  return context;
}