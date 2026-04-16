import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const Index = lazy(() => import("./pages/Index.tsx"));
const Projects = lazy(() => import("./pages/Projects.tsx"));
const Resume = lazy(() => import("./pages/Resume.tsx"));
const Research = lazy(() => import("./pages/Research.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();
const routerBase =
  typeof window !== "undefined" && (window.location.pathname === "/dist" || window.location.pathname.startsWith("/dist/"))
    ? "/dist"
    : "/";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter basename={routerBase}>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/cv" element={<Resume />} />
              <Route path="/resume" element={<Navigate replace to="/cv" />} />
              <Route path="/research" element={<Research />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
