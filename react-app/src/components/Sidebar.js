import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Overview',        icon: '🏠', desc: 'Platform overview' },
  { id: 'log-collection', label: 'Log Collection',   icon: '📡', desc: 'Collect logs from sources' },
  { id: 'log-parsing',    label: 'Log Parsing',      icon: '🔍', desc: 'Parse & normalize logs' },
  { id: 'alerting',       label: 'Alerting',         icon: '🔔', desc: 'Real-time alert engine' },
  { id: 'reporting',      label: 'Reporting',        icon: '📊', desc: 'Reports & dashboards' },
  { id: 'compliance',     label: 'Compliance',       icon: '✅', desc: 'Regulatory compliance' },
  { id: 'correlation',    label: 'Correlation',      icon: '🔗', desc: 'Event correlation' },
];

function Sidebar({ activeView, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Features</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <div className="sidebar-item-text">
              <span className="sidebar-label">{item.label}</span>
              <span className="sidebar-desc">{item.desc}</span>
            </div>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-version">ELA Visualizer v1.0</div>
        <div className="sidebar-build">Training Platform</div>
      </div>
    </aside>
  );
}

export default Sidebar;
