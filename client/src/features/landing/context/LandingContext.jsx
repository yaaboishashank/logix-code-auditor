import { createContext, useCallback, useContext } from "react";
import { useNavigate } from "react-router";

const LandingContext = createContext(null);

export const LandingProvider = ({ children }) => {
  const navigate = useNavigate();
  const openWorkspace = useCallback(() => navigate("/login"), [navigate]);

  return (
    <LandingContext.Provider value={openWorkspace}>
      {children}
    </LandingContext.Provider>
  );
};

export const useWorkspaceEntry = () => useContext(LandingContext);