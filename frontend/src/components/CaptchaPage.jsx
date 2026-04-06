import { useState, useEffect, useRef } from "react";
import "./CaptchaPage.css";

const API = "http://localhost:8000";

export default function CaptchaPage({ onVerified }) {
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const startTime = useRef(Date.now());

  const fetchCaptcha = async () => {
    setStatus("loading");
    setAnswer("");
    setMessage("");
    try {
      const res = await fetch(`${API}/captcha/generate`);
      const data = await res.json();
      setCaptchaId(data.captcha_id);
      setCaptchaImg(data.image);
      startTime.current = Date.now();
      setStatus("idle");
    } catch {
      setMessage("Could not load CAPTCHA. Is the backend running?");
      setStatus("error");
    }
  };

  useEffect(() => { fetchCaptcha(); }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!answer.trim()) { setMessage("Please enter the CAPTCHA text."); return; }
    setStatus("loading");
    const timeTaken = (Date.now() - startTime.current) / 1000;
    try {
      const res = await fetch(`${API}/captcha/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captcha_id: captchaId, user_answer: answer, time_taken: timeTaken }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage("Verified! Redirecting...");
        setTimeout(onVerified, 1200);
      } else {
        setStatus("error");
        setMessage("Incorrect CAPTCHA. Please try again.");
        fetchCaptcha();
      }
    } catch {
      setStatus("error");
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="captcha-wrapper">
      <div className="captcha-card">
        <div className="captcha-icon">🔐</div>
        <h2 className="captcha-title">Security Verification</h2>
        <p className="captcha-desc">
          Please complete the CAPTCHA below to access the DoJ Judicial Help Portal.
          Our ML system ensures only genuine users proceed.
        </p>

        <div className="captcha-img-wrap">
          {captchaImg ? (
            <img src={captchaImg} alt="CAPTCHA" className="captcha-img" />
          ) : (
            <div className="captcha-placeholder">Loading...</div>
          )}
        </div>

        <button className="refresh-btn" onClick={fetchCaptcha} type="button" title="Refresh CAPTCHA">
          ↺ Refresh
        </button>

        <form onSubmit={handleVerify} className="captcha-form">
          <input
            className="captcha-input"
            type="text"
            placeholder="Enter text shown above"
            value={answer}
            onChange={(e) => setAnswer(e.target.value.toUpperCase())}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className={`verify-btn ${status}`}
            type="submit"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "Verifying..." : status === "success" ? "✓ Verified" : "Verify & Continue →"}
          </button>
        </form>

        {message && (
          <p className={`captcha-msg ${status}`}>{message}</p>
        )}

        <div className="captcha-ml-note">
          <span className="ml-chip">🤖 ML-Powered</span>
          Behavioral analysis active — bot attempts are blocked automatically.
        </div>
      </div>
    </div>
  );
}
