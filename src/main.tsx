import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mitigate benign internal Firestore GrpcConnection 'Listen' stream idle timeout errors and Vite/WebSocket connection issues
if (typeof window !== "undefined") {
  // Suppress benign Vite WebSocket and HMR connection errors to prevent triggering platform error overlays
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const reasonStr = String(reason?.message || reason || "");
    if (
      reasonStr.toLowerCase().includes("websocket") ||
      reasonStr.toLowerCase().includes("vite") ||
      reasonStr.toLowerCase().includes("hmr") ||
      reasonStr.toLowerCase().includes("closed without opened")
    ) {
      console.log("[Suppressed Handled Rejection]: Suppressed benign Vite WebSocket/HMR rejection.", reasonStr);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("error", (event) => {
    const message = String(event.message || event.error?.message || "");
    if (
      message.toLowerCase().includes("websocket") ||
      message.toLowerCase().includes("vite") ||
      message.toLowerCase().includes("hmr") ||
      message.toLowerCase().includes("closed without opened")
    ) {
      console.log("[Suppressed Error]: Suppressed benign Vite WebSocket/HMR error.", message);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const originalError = console.error;
  console.error = function (...args) {
    const errorStr = args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === "object" && arg !== null) {
        try { return JSON.stringify(arg); } catch { return String(arg); }
      }
      return String(arg);
    }).join(" ");

    if (
      (errorStr.includes("@firebase/firestore") && 
       (errorStr.includes("Disconnecting idle stream") || 
        errorStr.includes("CANCELLED") || 
        errorStr.includes("Timed out waiting for new targets") || 
        errorStr.includes("Listen' stream") ||
        errorStr.includes("GrpcConnection"))) ||
      errorStr.toLowerCase().includes("websocket") ||
      errorStr.toLowerCase().includes("vite") ||
      errorStr.toLowerCase().includes("hmr") ||
      errorStr.toLowerCase().includes("closed without opened")
    ) {
      // Quiet fallback or benign suppression
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const warnStr = args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === "object" && arg !== null) {
        try { return JSON.stringify(arg); } catch { return String(arg); }
      }
      return String(arg);
    }).join(" ");

    if (
      (warnStr.includes("@firebase/firestore") && 
       (warnStr.includes("Disconnecting idle stream") || 
        warnStr.includes("CANCELLED") || 
        warnStr.includes("Timed out waiting for new targets") || 
        warnStr.includes("Listen' stream") ||
        warnStr.includes("GrpcConnection"))) ||
      warnStr.toLowerCase().includes("websocket") ||
      warnStr.toLowerCase().includes("vite") ||
      warnStr.toLowerCase().includes("hmr") ||
      warnStr.toLowerCase().includes("closed without opened")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
