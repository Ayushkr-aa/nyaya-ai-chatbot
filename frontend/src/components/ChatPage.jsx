import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceCard from "./SourceCard";
import LawyerCTA from "./LawyerCTA";
import "./ChatPage.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Namaste! 🙏 Welcome to **Nyaya AI**.\n\nI'm your intelligent legal assistant for the **Department of Justice**. I can help you understand Indian laws (IPC, CrPC, Constitution), your fundamental rights, and court procedures.\n\nAsk me anything in **English or Hindi** — for example:\n- \"What is Section 302 of IPC?\"\n- \"मेरे मौलिक अधिकार क्या हैं?\"\n- \"How do I check my case status on eCourts?\"\n\nHow may I help you today?",
      time: new Date(),
      sources: [],
      follow_ups: [
        "What is Section 302 of IPC?",
        "What are my rights if arrested?",
        "How to check case status on eCourts?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [language, setLanguage] = useState("en");
  const [showLawyerCTA, setShowLawyerCTA] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "hi" || language === "hinglish" || language === "auto" ? "hi-IN" : "en-IN";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText, time: new Date() },
    ]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: sessionId,
          language,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.response,
          time: new Date(),
          sources: data.sources || [],
          follow_ups: data.follow_ups || [],
        },
      ]);

      if (data.show_lawyer_cta) {
        setShowLawyerCTA(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Could not reach the Nyaya AI server. Please check your connection or ensure the backend service is active.",
          time: new Date(),
          sources: [],
          follow_ups: [],
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: `📎 Uploaded: ${file.name}`,
        time: new Date(),
      },
    ]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("session_id", sessionId);
      formData.append("language", language);

      const res = await fetch(`${API}/api/chat/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.response,
          time: new Date(),
          sources: data.sources || [],
          follow_ups: data.follow_ups || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Could not process the uploaded file. Please try again.",
          time: new Date(),
          sources: [],
          follow_ups: [],
        },
      ]);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmtTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const langLabel = language === "hi" ? "हिं" : language === "en" ? "EN" : "Auto";

  return (
    <div className="chat-wrapper">
      <div className="chat-card">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-avatar">⚖️</div>
          <div>
            <div className="chat-name">Nyaya AI</div>
            <div className="chat-status">
              <span className="status-dot" /> Online · RAG-Powered Legal
              Assistant
            </div>
          </div>
          <div className="header-controls">
            <div className="rag-badge">RAG-Inference</div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              {msg.role === "bot" && <div className="msg-avatar">⚖</div>}
              <div className="msg-bubble-wrap">
                <div className="msg-bubble">
                  {msg.role === "bot" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <SourceCard sources={msg.sources} />
                )}

                {/* Follow-up suggestions */}
                {msg.follow_ups && msg.follow_ups.length > 0 && (
                  <div className="msg-follow-ups">
                    {msg.follow_ups.map((f, j) => (
                      <button
                        key={j}
                        className="follow-up-chip"
                        onClick={() => sendMessage(f)}
                        disabled={loading}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                <span className="msg-time">{fmtTime(msg.time)}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-row bot">
              <div className="msg-avatar">⚖</div>
              <div className="msg-bubble typing">
                <span className="typing-text">Analyzing legal documents</span>
                <span className="typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          {/* Lawyer CTA */}
          {showLawyerCTA && <LawyerCTA />}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="language-selector">
            <button
              className={`lang-btn ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
            <button
              className={`lang-btn ${language === "hinglish" ? "active" : ""}`}
              onClick={() => setLanguage("hinglish")}
            >
              Hinglish
            </button>
            <button
              className={`lang-btn ${language === "hi" ? "active" : ""}`}
              onClick={() => setLanguage("hi")}
            >
              हिन्दी
            </button>
          </div>

          <div className="input-container">
            {/* Upload button */}
            <label className="upload-btn" title="Upload document (PDF/TXT)">
              📎
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleUpload}
                style={{ display: "none" }}
              />
            </label>

          {/* Voice button */}
          <button
            className={`voice-btn ${isListening ? "listening" : ""}`}
            onClick={toggleVoice}
            title={isListening ? "Stop listening" : "Voice input"}
            disabled={!recognitionRef.current}
          >
            {isListening ? "⏹" : "🎤"}
          </button>

          <textarea
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder={
              language === "hi"
                ? "अपना कानूनी सवाल यहाँ लिखें..."
                : "Ask about IPC, CrPC, Constitution, rights, court services..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            title="Send"
          >
            ➤
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
