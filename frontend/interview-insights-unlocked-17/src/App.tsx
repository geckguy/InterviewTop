// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { AuthProvider } from "@/hooks/useAuth";
import PrivateRoute from "@/components/PrivateRoute";

import Index from "./pages/Index";
import Companies from "./pages/Companies";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
// import Explore from "./pages/Explore"; // Remove this import
import Search from "./pages/Search";
import ShareExperience from "./pages/ShareExperience";
import InterviewPost from "./pages/InterviewPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    console.error("Missing VITE_GOOGLE_CLIENT_ID environment variable!");
    // Optionally render an error message or prevent app load
}


const App = () => (
  <GoogleOAuthProvider clientId={googleClientId || "YOUR_CLIENT_ID_FALLBACK"}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* --- REMOVE EXPLORE ROUTE --- */}
            {/*
            <Route
              path="/explore"
              element={
                <PrivateRoute>
                  <Explore />
                </PrivateRoute>
              }
            />
             */}
             {/* --- END REMOVE EXPLORE ROUTE --- */}
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
            <Route
              path="/share-experience"
              element={
                <PrivateRoute>
                  <ShareExperience />
                </PrivateRoute>
              }
            />
            <Route
              path="/interview/:id"
              element={
                <PrivateRoute>
                  <InterviewPost />
                </PrivateRoute>
              }
            />

            {/* Catch‑all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;