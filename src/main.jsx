import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'

import './index.css'  // ← must come after the font imports
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";

// ── Layouts ───────────────────────────────────────────────────
import Layout from "./shared/Layout/Layout.jsx";


// ── Pages (import as you build them) ─────────────────────────







import CampaignsPage from "./pages/campaigns/CampaignsPage.jsx";


import ProfilePage from "./pages/ProfilePage.jsx"
import AdminPage from "./pages/admin/AdminPage.jsx";
import OrgManagePage from "./pages/org/OrgManagePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";


// ── Route Guards ──────────────────────────────────────────────
import {
  ProtectedRoute,
  GuestRoute,
  AdminRoute,
  OrgAdminRoute,
} from "./components/guards/ProtectedRoute.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.jsx";
import AuthLayout from "./shared/Layout/Authlayout.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import CampaignDetailPage from "./pages/campaigns/CampaignDetailPage.jsx";
import OrganizationsPage from "./pages/organizations/OrganizationsPage.jsx";
import OrgDetailPage from "./pages/organizations/OrgDetailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";


// ── React Query Client ────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    // App is the root — holds providers and global wrappers
    element: <App />,
    path: "/",
    children: [
      // ── Layout (with Navbar + Footer) ──────────────────────
      {
        element: <Layout />,
        children: [
          // Public routes
          { index: true, element: <LandingPage /> },
          { path: "campaigns", element: <CampaignsPage /> },
          { path: "campaigns/:id", element: <CampaignDetailPage /> },
          { path: "organizations", element: <OrganizationsPage /> },
          { path: "organizations/:slug", element: <OrgDetailPage /> },

          // Protected routes — must be logged in
          {
            path: "dashboard",
            element: (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            ),
          },

          // Org admin routes
          {
            path: "org/manage",
            element: (
              <OrgAdminRoute>
                <OrgManagePage />
              </OrgAdminRoute>
            ),
          },

          // Super admin routes
          {
            path: "admin",
            element: (
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            ),
          },
        ],
      },

      // ── AuthLayout (no Navbar/Footer) ──────────────────────
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: (
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            ),
          },
          {
            path: "register",
            element: (
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            ),
          },
          {
            path: "forgot-password",
            element: (
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            ),
          },
          {
            path: "reset-password",
            element: (
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            ),
          },
        ],
      },

      // ── Standalone pages (no layout at all) ────────────────
      { path: "verify-email", element: <VerifyEmailPage /> },

      // ── 404 ───────────────────────────────────────────────
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// ── Root render ───────────────────────────────────────────────
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
