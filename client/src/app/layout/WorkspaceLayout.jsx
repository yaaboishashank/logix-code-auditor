import { useLayoutEffect } from "react";
import WorkspaceSidebar from "../../features/workspace/ui/components/WorkspaceSidebar";
import WorkspaceHeader from "../../features/workspace/ui/components/WorkspaceHeader";
import "../../features/workspace/workspace.css";
import { Outlet, useLocation } from "react-router";
import "../../features/workspace/workspace-layout.css";

const WorkspaceLayout = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <div className="workspace-layout">
            <WorkspaceSidebar />

            <div className="workspace-content">
                <WorkspaceHeader />
                <main className="workspace-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default WorkspaceLayout;