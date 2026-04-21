import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const Index = lazy(() => import("./pages/Index.tsx"));
const Projects = lazy(() => import("./pages/Projects.tsx"));
const Resume = lazy(() => import("./pages/Resume.tsx"));
const Research = lazy(() => import("./pages/Research.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const AppDevelopment = lazy(() => import("./pages/AppDevelopment.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const routerBase =
  typeof window !== "undefined" && (window.location.pathname === "/dist" || window.location.pathname.startsWith("/dist/"))
    ? "/dist"
    : "/";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <BrowserRouter basename={routerBase}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/cv" element={<Resume />} />
          <Route path="/resume" element={<Navigate replace to="/cv" />} />
          <Route path="/research" element={<Research />} />
          <Route path="/about" element={<About />} />
          <Route path="/cv/app-development" element={<AppDevelopment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
