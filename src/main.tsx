import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SplashScreen } from "./components/splash/SplashScreen";

const Root = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash on first visit of the session or PWA launch
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const lastVisit = sessionStorage.getItem('lastVisit');
    const now = Date.now();
    
    // Show splash if PWA or first session visit (within 30 min)
    if (isStandalone || !lastVisit || now - parseInt(lastVisit) > 30 * 60 * 1000) {
      sessionStorage.setItem('lastVisit', now.toString());
      return true;
    }
    return false;
  });

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return <App />;
};

createRoot(document.getElementById("root")!).render(<Root />);
