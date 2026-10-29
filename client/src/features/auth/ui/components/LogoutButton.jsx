import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutUser } from "../../api/auth.api";
import "./LogoutButton.css";

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await logoutUser();
      window.location.replace("/login");
    } catch {
      setError("Logout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="workspace-logout"
        onClick={handleLogout}
        disabled={loading}
        aria-busy={loading}
      >
        <LogOut size={18} aria-hidden="true" />
        {loading ? "Logging out…" : "Log out"}
      </button>

      {error && (
        <p className="workspace-logout-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default LogoutButton;