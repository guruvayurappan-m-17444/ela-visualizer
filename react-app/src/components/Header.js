import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-icon">⚡</div>
        <div className="header-text">
          <span className="header-product">EventLog Analyzer</span>
          <span className="header-tagline">Interactive Learning Platform</span>
        </div>
      </div>
      <div className="header-right">
        <span className="header-me-badge">ManageEngine</span>
      </div>
    </header>
  );
}

export default Header;
