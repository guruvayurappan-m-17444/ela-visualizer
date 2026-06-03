import './Dashboard.css';

const FEATURE_CARDS = [
  {
    id: 'log-collection',
    icon: '📡',
    title: 'Log Collection',
    color: '#4f8cff',
    desc: 'Collect logs from 700+ sources — Windows, Linux, network devices, and cloud services — via agents, agentless WMI, Syslog, and APIs.',
    tags: ['Agent & Agentless', 'Syslog / SNMP', 'Cloud APIs', '700+ Sources'],
  },
  {
    id: 'log-parsing',
    icon: '🔍',
    title: 'Log Parsing',
    color: '#8b5cf6',
    desc: 'Automatically parse and normalize raw log data into structured fields. Supports 1000+ log formats with custom parser support.',
    tags: ['Auto Normalization', 'Custom Parsers', '1000+ Formats', 'Field Extraction'],
  },
  {
    id: 'alerting',
    icon: '🔔',
    title: 'Real-time Alerting',
    color: '#f87171',
    desc: 'Trigger instant alerts on event patterns, thresholds, and anomalies. Send notifications via email, SMS, or ticketing systems.',
    tags: ['Threshold Alerts', 'Anomaly Detection', 'Email / SMS', 'Severity Levels'],
  },
  {
    id: 'reporting',
    icon: '📊',
    title: 'Reporting',
    color: '#34d399',
    desc: 'Generate pre-built and custom reports for security, operations, and compliance. Schedule and auto-distribute in PDF or CSV.',
    tags: ['1000+ Reports', 'Custom Builder', 'Scheduled', 'PDF / CSV Export'],
  },
  {
    id: 'compliance',
    icon: '✅',
    title: 'Compliance',
    color: '#fbbf24',
    desc: 'Meet regulatory mandates with built-in compliance reports for PCI DSS, HIPAA, SOX, GDPR, NIST, and 30+ other standards.',
    tags: ['PCI DSS', 'HIPAA / SOX', 'GDPR / NIST', 'Audit Trails'],
  },
  {
    id: 'correlation',
    icon: '🔗',
    title: 'Event Correlation',
    color: '#6366f1',
    desc: 'Correlate events across multiple sources to detect multi-stage attack patterns. Automatically creates security incidents.',
    tags: ['Rule-based Engine', 'Attack Scenarios', 'Auto Incidents', 'MITRE ATT&CK'],
  },
];

const ARCH_NODES = [
  { icon: '🖥️', label: 'Sources', sub: 'Servers, Networks, Cloud', cls: 'src' },
  { icon: '📡', label: 'Collect', sub: 'Agent / Agentless / Syslog', cls: 'collect' },
  { icon: '⚡', label: 'ELA Engine', sub: 'Parse, Correlate, Alert', cls: 'ela' },
  { icon: '📊', label: 'Insights', sub: 'Reports, Dashboards', cls: 'insights' },
];

function Dashboard({ onNavigate }) {
  return (
    <div className="dashboard">
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-badge">Interactive Learning Platform</div>
          <h1 className="dash-title">
            ManageEngine <span className="dash-accent">EventLog Analyzer</span>
          </h1>
          <p className="dash-desc">
            Explore how EventLog Analyzer collects, parses, correlates, and analyzes log data
            across your IT infrastructure to deliver security intelligence, compliance reporting,
            and real-time threat detection.
          </p>
          <div className="dash-stats">
            <div className="dash-stat"><div className="ds-val">700+</div><div className="ds-lbl">Log Sources</div></div>
            <div className="dash-stat"><div className="ds-val">1000+</div><div className="ds-lbl">Report Templates</div></div>
            <div className="dash-stat"><div className="ds-val">30+</div><div className="ds-lbl">Compliance Standards</div></div>
            <div className="dash-stat"><div className="ds-val">Real-time</div><div className="ds-lbl">Alerting</div></div>
          </div>
        </div>
        <div className="dash-arch">
          <div className="arch-title">How ELA Works</div>
          <div className="arch-flow-col">
            {ARCH_NODES.map((node, i) => (
              <div key={node.label} className="arch-row">
                <div className={`arch-node-box arch-${node.cls}`}>
                  <span className="arch-node-emoji">{node.icon}</span>
                  <div className="arch-node-info">
                    <div className="arch-node-label">{node.label}</div>
                    <div className="arch-node-sub">{node.sub}</div>
                  </div>
                </div>
                {i < ARCH_NODES.length - 1 && (
                  <div className="arch-connector">
                    <div className="arch-connector-line" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-section-label">Explore All Features</div>
      <div className="dash-grid">
        {FEATURE_CARDS.map(card => (
          <button
            key={card.id}
            className="feat-card"
            style={{ '--fc-color': card.color }}
            onClick={() => onNavigate(card.id)}
          >
            <div className="feat-card-top">
              <span className="feat-card-icon">{card.icon}</span>
              <h3 className="feat-card-title">{card.title}</h3>
            </div>
            <p className="feat-card-desc">{card.desc}</p>
            <div className="feat-card-tags">
              {card.tags.map(t => <span key={t} className="feat-tag">{t}</span>)}
            </div>
            <div className="feat-card-cta">Explore →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
