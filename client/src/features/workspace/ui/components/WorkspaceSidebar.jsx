import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  AudioLines,
  LayoutDashboard,
  ScanLine,
  History,
  Settings,
  ArrowLeft,
} from "lucide-react";

import LogoutButton from "../../../auth/ui/components/LogoutButton";

const WorkspaceSidebar = () => {
  const { pathname, search } = useLocation();

  const currentScanId =
    pathname === "/workspace"
      ? new URLSearchParams(search).get("scan") || ""
      : "";

  const [lastScanId, setLastScanId] = useState(currentScanId);

  useEffect(() => {
    if (currentScanId) {
      setLastScanId(currentScanId);
    }
  }, [currentScanId]);

  const activeScanId = currentScanId || lastScanId;

  const overviewPath = activeScanId
    ? `/workspace?scan=${encodeURIComponent(activeScanId)}`
    : "/workspace";

  const linkClass = ({ isActive }) => (isActive ? "is-active" : "");

  return (
    <aside className="workspace-sidebar">
      <Link to="/" className="workspace-logo" aria-label="LOGIX home">
        <AudioLines aria-hidden="true" />
        LOGIX
      </Link>

      <nav className="workspace-nav" aria-label="Workspace navigation">
        <NavLink to={overviewPath} end className={linkClass}>
          <LayoutDashboard aria-hidden="true" />
          Overview
        </NavLink>

        <NavLink to="/workspace/new-scan" className={linkClass}>
          <ScanLine aria-hidden="true" />
          New scan
        </NavLink>

        <NavLink to="/workspace/history" className={linkClass}>
          <History aria-hidden="true" />
          Scan history
        </NavLink>

        <NavLink to="/workspace/settings" className={linkClass}>
          <Settings aria-hidden="true" />
          Settings
        </NavLink>

        <div style={{ marginTop: "auto" }}>
          <LogoutButton />
        </div>
      </nav>

      <Link to="/" className="workspace-home">
        <ArrowLeft aria-hidden="true" />
        Back to website
      </Link>
    </aside>
  );
};

export default WorkspaceSidebar;