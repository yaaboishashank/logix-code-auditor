import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, Plus, X } from "lucide-react";
import WorkspaceSidebar from "./WorkspaceSidebar";

const titles = {
  "/workspace": "Overview",
  "/workspace/new-scan": "New scan",
  "/workspace/history": "Scan history",
  "/workspace/settings": "Settings",
};

const WorkspaceHeader = () => {
  const { pathname, search } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname, search]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header
      className="workspace-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isMenuOpen) {
          event.preventDefault();
          closeMenu();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsMenuOpen(false);
        }
      }}
    >
      <button
        ref={menuButtonRef}
        type="button"
        className="workspace-menu-toggle"
        aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMenuOpen}
        aria-controls="workspace-navigation-menu"
        onClick={() => setIsMenuOpen((previous) => !previous)}
      >
        {isMenuOpen ? (
          <X aria-hidden="true" />
        ) : (
          <Menu aria-hidden="true" />
        )}

        <span>Workspace</span>
      </button>

      <div className="workspace-heading">
        <h1>{titles[pathname.replace(/\/$/, "")] || "Workspace"}</h1>
      </div>

      <Link
        to="/workspace/new-scan"
        className="ui-button workspace-new-scan"
        aria-label="New scan"
        onClick={() => setIsMenuOpen(false)}
      >
        <Plus aria-hidden="true" />
        <span>New scan</span>
      </Link>

      <div
        id="workspace-navigation-menu"
        className="workspace-mobile-menu"
        hidden={!isMenuOpen}
        onClick={(event) => {
          if (event.target.closest("a")) {
            setIsMenuOpen(false);
          }
        }}
      >
        <WorkspaceSidebar />
      </div>
    </header>
  );
};

export default WorkspaceHeader;