import "./LawyerCTA.css";

export default function LawyerCTA() {
  return (
    <div className="lawyer-cta">
      <div className="cta-icon">👨‍⚖️</div>
      <div className="cta-content">
        <div className="cta-title">Want to talk to a real lawyer?</div>
        <div className="cta-desc">
          Get FREE legal advice via video call through Tele Law at your nearest
          Common Service Centre.
        </div>
      </div>
      <a
        href="https://tele-law.in"
        target="_blank"
        rel="noopener noreferrer"
        className="cta-btn"
      >
        Connect via Tele Law →
      </a>
    </div>
  );
}
