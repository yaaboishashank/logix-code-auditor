import { useAuth } from "../context/AuthContext";

const useIsGuest = () => {
  const { user, isLoading } = useAuth();

  return !isLoading && user === null;
};

export default useIsGuest;