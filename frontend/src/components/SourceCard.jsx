import { useState } from "react";
import "./SourceCard.css";

export default function SourceCard({ sources }) {
  const [expanded, setExpanded] = useState(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-container">
      <div className="sources-label">📜 Sources</div>
      <div className="sources-list">
        {sources.map((src, i) => (
          <div
            key={i}
            className={`source-card ${expanded === i ? "expanded" : ""}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="source-header">
              <span className="source-act">{src.act}</span>
              <span className="source-section">{src.section}</span>
            </div>
            {expanded === i && (
              <div className="source-excerpt">{src.excerpt}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
