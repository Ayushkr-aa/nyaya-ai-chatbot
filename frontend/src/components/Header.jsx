import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="emblem-wrap">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Emblem of India"
            className="emblem"
          />
        </div>
        <div className="header-text">
          <span className="header-hi">भारत सरकार | Government of India</span>
          <h1 className="header-title">Nyaya AI</h1>
          <span className="header-sub">Department of Justice &nbsp;·&nbsp; Ministry of Law and Justice</span>
        </div>
        <div className="header-badge">
          <span className="badge-dot" />
          System Live
        </div>
      </div>
      <div className="saffron-line" />
    </header>
  );
}
