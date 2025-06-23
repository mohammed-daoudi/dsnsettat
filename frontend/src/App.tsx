import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Submissions from "@/pages/Submissions";
import SubmitWork from "@/pages/SubmitWork";
import AdminLogs from "@/pages/AdminLogs";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/submissions" element={
                <ProtectedRoute>
                  <Layout>
                    <Submissions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/my-submissions" element={
                <ProtectedRoute>
                  <Layout>
                    <Submissions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/submit" element={
                <ProtectedRoute>
                  <Layout>
                    <SubmitWork />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/logs" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <AdminLogs />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/submissions" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Submissions />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Future routes */}
              <Route path="/review" element={
                <ProtectedRoute>
                  <Layout>
                    <Submissions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute>
                  <Layout>
                    <Submissions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/ip-rights" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
