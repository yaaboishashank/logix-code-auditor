import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let checking = false;

    const checkSession = async () => {
      if (checking) return;
      checking = true;

      try {
        const currentUser = await getCurrentUser();

        if (active) setUser(currentUser);
      } catch {
        // Keep the last verified user during a connection error.
      } finally {
        checking = false;
        if (active) setIsLoading(false);
      }
    };

    checkSession();
    window.addEventListener("focus", checkSession);

    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
    };
  }, []);

  const value = useMemo(
    () => ({ user, isLoading }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);