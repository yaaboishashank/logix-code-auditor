import { redirect } from "react-router";
import { getCurrentUser } from "../api/auth.api";

const guestLoader = async () => {
  const user = await getCurrentUser();

  return user ? redirect("/workspace") : null;
};

export default guestLoader;