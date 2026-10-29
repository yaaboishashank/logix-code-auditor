import { createBrowserRouter, RouterProvider } from "react-router";

import AuthLayout from "../app/layout/AuthLayout";
import WorkspaceLayout from "../app/layout/WorkspaceLayout";

import LandingPage from "../features/landing/ui/pages/LandingPage";
import LoginPage from "../features/auth/ui/pages/LoginPage";
import RegisterPage from "../features/auth/ui/pages/RegisterPage";
import SessionStatus from "../features/auth/ui/components/SessionStatus";
import workspaceLoader from "../features/auth/loaders/workspace.loader";

import OverviewPage from "../features/workspace/ui/pages/OverviewPage";
import NewScanPage from "../features/workspace/ui/pages/NewScanPage";
import ScanHistoryPage from "../features/workspace/ui/pages/ScanHistoryPage";
import SettingsPage from "../features/workspace/ui/pages/SettingsPage";
import NotFoundPage from "../shared/ui/pages/NotFoundPage";
import guestLoader from "../features/auth/loaders/guest.loader";
import { AuthProvider } from "../features/auth/context/AuthContext";
import ManualLoginPage from "../features/auth/ui/pages/ManualLoginPage";

const workspaceChildren = [
    { index: true, element: <OverviewPage /> },
    { path: "new-scan", element: <NewScanPage /> },
    { path: "history", element: <ScanHistoryPage /> },
    { path: "settings", element: <SettingsPage /> },
];

const previewRoutes = import.meta.env.DEV
    ? [
        {
            path: "/preview/workspace",
            element: <WorkspaceLayout />,
            children: workspaceChildren,
        },
    ]
    : [];

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthProvider>
                <LandingPage />
            </AuthProvider>
        ),
    },
    {
        element: <AuthLayout />,
        loader: guestLoader,
        hydrateFallbackElement: <SessionStatus />,
        errorElement: <SessionStatus error />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
        ],
    },
    {
        id: "workspace",
        path: "/workspace",
        loader: workspaceLoader,
        element: <WorkspaceLayout />,
        hydrateFallbackElement: <SessionStatus />,
        errorElement: <SessionStatus error />,
        children: workspaceChildren,
    },
    ...previewRoutes,
    {
        path: "*",
        element: <NotFoundPage />,
    },
    {
        path: "/auth/manual-login",
        element: <ManualLoginPage />,
    },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;