import { useState } from "react";
import CaptchaPage from "./components/CaptchaPage";
import ChatPage from "./components/ChatPage";
import Header from "./components/Header";
import "./App.css";

export default function App() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        {!verified ? (
          <CaptchaPage onVerified={() => setVerified(true)} />
        ) : (
          <ChatPage />
        )}
      </main>
      <footer className="app-footer">
        <p>© 2026 Nyaya AI | Department of Justice, Government of India &nbsp;|&nbsp; Official Judicial Help Portal</p>
      </footer>
    </div>
  );
}
