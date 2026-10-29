import { redirect } from "react-router";
import { getCurrentUser } from "../api/auth.api";

const workspaceLoader = async () => {
  const user = await getCurrentUser();

  return user ? { user } : redirect("/login");
};

export default workspaceLoader;