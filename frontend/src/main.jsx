import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from 'virtual:pwa-register'
import App from "./App";
import "./index.css";

// Register Service Worker for PWA
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
);
