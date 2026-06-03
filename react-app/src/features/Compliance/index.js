import { useState } from 'react';
import './Compliance.css';

const STANDARDS = [
  {
    id: 'pci',
    name: 'PCI DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    icon: '💳',
    color: '#e74c3c',
    version: 'v4.0',
    requirements: [
      { id: 'req-1',  num: 'Req 1',  title: 'Install network security controls',     coverage: 'full',    ela: 'Firewall and network device log monitoring. Alerts on unauthorized access attempts.' },
      { id: 'req-2',  num: 'Req 2',  title: 'Vendor default passwords changed',      coverage: 'partial', ela: 'Login tracking with default username detection. Manual verification still needed.' },
      { id: 'req-7',  num: 'Req 7',  title: 'Restrict access to system components', coverage: 'full',    ela: 'Access control audit logs with user, resource, and time. Unauthorized access alerts.' },
      { id: 'req-8',  num: 'Req 8',  title: 'Identify users and authenticate access',coverage: 'full',    ela: 'Full authentication audit trail: logon, logoff, password changes, MFA events.' },
      { id: 'req-10', num: 'Req 10', title: 'Log and monitor all access to CDE',    coverage: 'full',    ela: 'Continuous log collection from CDE systems. Tamper-proof audit trail storage.' },
      { id: 'req-11', num: 'Req 11', title: 'Test security of systems regularly',    coverage: 'partial', ela: 'IDS/IPS log analysis and vulnerability scan result ingestion. Penetration test log review.' },
      { id: 'req-12', num: 'Req 12', title: 'Support security with policies',        coverage: 'none',    ela: 'Policy documentation is outside ELA scope. ELA provides evidence for policy compliance.' },
    ],
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    icon: '🏥',
    color: '#3498db',
    version: 'Security Rule',
    requirements: [
      { id: 'h-1', num: '164.308(a)(1)', title: 'Security Management Process',      coverage: 'full',    ela: 'Risk analysis support through log-based threat monitoring and incident detection.' },
      { id: 'h-2', num: '164.308(a)(5)', title: 'Security Awareness Training',      coverage: 'none',    ela: 'Training management is out of scope. ELA tracks access to PHI systems post-training.' },
      { id: 'h-3', num: '164.308(a)(6)', title: 'Security Incident Procedures',     coverage: 'full',    ela: 'Automated incident detection, alert escalation, and forensic log retention for ePHI access.' },
      { id: 'h-4', num: '164.312(b)',    title: 'Audit Controls',                   coverage: 'full',    ela: 'Comprehensive audit trail for all ePHI system access with pre-built HIPAA reports.' },
      { id: 'h-5', num: '164.312(c)',    title: 'Integrity Controls',               coverage: 'partial', ela: 'File integrity monitoring for ePHI files. Hash verification through FIM integration.' },
      { id: 'h-6', num: '164.312(d)',    title: 'Person Authentication',            coverage: 'full',    ela: 'Authentication event logging: success, failure, lockout, MFA bypass, password resets.' },
      { id: 'h-7', num: '164.316(b)',    title: 'Documentation Requirements',       coverage: 'full',    ela: 'All audit logs retained per HIPAA 6-year retention. Exportable for auditor review.' },
    ],
  },
  {
    id: 'sox',
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    icon: '📈',
    color: '#27ae60',
    version: 'Section 302/404',
    requirements: [
      { id: 's-1', num: 'Control 1', title: 'Access to Financial Systems',          coverage: 'full',    ela: 'All access to financial systems logged, reported, and alerted. Separation of duties monitoring.' },
      { id: 's-2', num: 'Control 2', title: 'Change Management',                   coverage: 'full',    ela: 'Configuration change logging for all financial system servers and databases.' },
      { id: 's-3', num: 'Control 3', title: 'Privileged Access Management',         coverage: 'full',    ela: 'Privileged account usage tracked. Real-time alerts on unauthorized admin actions.' },
      { id: 's-4', num: 'Control 4', title: 'Data Integrity',                       coverage: 'partial', ela: 'Database audit logs and file access monitoring. DLP integration for full coverage.' },
      { id: 's-5', num: 'Control 5', title: 'Audit Trail Retention',                coverage: 'full',    ela: 'Log retention policies configurable up to 7 years. Immutable archive storage support.' },
      { id: 's-6', num: 'Control 6', title: 'Incident Response',                    coverage: 'full',    ela: 'Automated alerts and workflows on financial system anomalies and security events.' },
    ],
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    icon: '🇪🇺',
    color: '#9b59b6',
    version: 'EU 2016/679',
    requirements: [
      { id: 'g-1', num: 'Art. 5',   title: 'Principles of Data Processing',         coverage: 'partial', ela: 'Data access logging supports accountability principle. Data minimization is organizational.' },
      { id: 'g-2', num: 'Art. 25',  title: 'Data Protection by Design',             coverage: 'partial', ela: 'Access control monitoring and privacy-related alerts. Full design is architectural.' },
      { id: 'g-3', num: 'Art. 30',  title: 'Records of Processing Activities',      coverage: 'full',    ela: 'Complete audit log of who accessed what personal data, when, and from where.' },
      { id: 'g-4', num: 'Art. 32',  title: 'Security of Processing',                coverage: 'full',    ela: 'Security event monitoring, breach detection, and real-time alerting for personal data systems.' },
      { id: 'g-5', num: 'Art. 33',  title: 'Breach Notification (72h)',             coverage: 'full',    ela: 'Automated breach detection and alerting. Logs provide evidence for breach timeline reporting.' },
      { id: 'g-6', num: 'Art. 35',  title: 'Data Protection Impact Assessment',    coverage: 'none',    ela: 'DPIA is a business process. ELA data access logs feed into DPIA risk assessments.' },
    ],
  },
  {
    id: 'nist',
    name: 'NIST CSF',
    fullName: 'NIST Cybersecurity Framework',
    icon: '🇺🇸',
    color: '#f39c12',
    version: 'v1.1',
    requirements: [
      { id: 'n-1', num: 'ID.AM',  title: 'Asset Management',                        coverage: 'partial', ela: 'Device inventory from log source registration. Full asset management needs CMDB integration.' },
      { id: 'n-2', num: 'PR.AC',  title: 'Identity Management & Access Control',    coverage: 'full',    ela: 'Complete authentication and authorization audit trail across all managed systems.' },
      { id: 'n-3', num: 'PR.DS',  title: 'Data Security',                            coverage: 'full',    ela: 'Data access monitoring, DLP event ingestion, encryption event tracking.' },
      { id: 'n-4', num: 'DE.AE',  title: 'Anomalies and Events',                    coverage: 'full',    ela: 'Real-time anomaly detection, threshold-based alerting, and behavioral analytics.' },
      { id: 'n-5', num: 'DE.CM',  title: 'Continuous Monitoring',                   coverage: 'full',    ela: '24x7 log monitoring from all infrastructure. Dashboards and real-time alert engine.' },
      { id: 'n-6', num: 'RS.RP',  title: 'Response Planning',                       coverage: 'partial', ela: 'Alert-triggered workflows and ticket creation. Full IR playbooks need SOAR integration.' },
      { id: 'n-7', num: 'RC.CO',  title: 'Recovery Communications',                 coverage: 'none',    ela: 'Recovery communications are organizational. ELA provides post-incident log evidence.' },
    ],
  },
];

const COVERAGE_LABELS = { full: 'Full Coverage', partial: 'Partial Coverage', none: 'Not Covered' };
const COVERAGE_COLORS = { full: 'var(--success)', partial: 'var(--warning)', none: 'var(--danger)' };

function coverageScore(reqs) {
  const total = reqs.length;
  const full = reqs.filter(r => r.coverage === 'full').length;
  const partial = reqs.filter(r => r.coverage === 'partial').length;
  return Math.round((full + partial * 0.5) / total * 100);
}

function Compliance() {
  const [selStd, setSelStd] = useState('pci');
  const [selReq, setSelReq] = useState(null);

  const std = STANDARDS.find(s => s.id === selStd);
  const req = std?.requirements.find(r => r.id === selReq);
  const score = std ? coverageScore(std.requirements) : 0;
  const full    = std?.requirements.filter(r => r.coverage === 'full').length || 0;
  const partial = std?.requirements.filter(r => r.coverage === 'partial').length || 0;
  const none    = std?.requirements.filter(r => r.coverage === 'none').length || 0;

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">✅</span> Compliance</div>
        <div className="feature-desc">
          ELA includes pre-built compliance reports and monitoring for 30+ regulatory standards.
          Select a standard to see how ELA maps to each requirement.
        </div>
      </div>

      {/* Standard selector */}
      <div className="step-label">① Select a compliance standard</div>
      <div className="cmp-std-tabs">
        {STANDARDS.map(s => (
          <button key={s.id}
            className={`cmp-std-tab ${selStd === s.id ? 'active' : ''}`}
            style={{ '--sc': s.color }}
            onClick={() => { setSelStd(s.id); setSelReq(null); }}>
            <span>{s.icon}</span>
            <div>
              <div className="cmp-std-name">{s.name}</div>
              <div className="cmp-std-ver">{s.version}</div>
            </div>
          </button>
        ))}
      </div>

      {std && (
        <div className="cmp-layout">
          {/* Requirements list */}
          <div className="cmp-left">
            <div className="step-label">② Requirements &amp; ELA Coverage</div>
            <div className="cmp-req-list">
              {std.requirements.map(r => (
                <button key={r.id}
                  className={`cmp-req-row ${selReq === r.id ? 'active' : ''} cov-${r.coverage}`}
                  onClick={() => setSelReq(selReq === r.id ? null : r.id)}>
                  <div className={`cmp-cov-dot dot-${r.coverage}`} />
                  <div className="cmp-req-info">
                    <div className="cmp-req-num">{r.num}</div>
                    <div className="cmp-req-title">{r.title}</div>
                  </div>
                  <div className={`cmp-cov-badge badge-${r.coverage}`}>
                    {r.coverage === 'full' ? '✓ Full' : r.coverage === 'partial' ? '~ Partial' : '✗ None'}
                  </div>
                </button>
              ))}
            </div>

            {req && (
              <div className="cmp-req-detail fade-in">
                <div className="cmp-detail-head">
                  <span className={`cmp-cov-badge badge-${req.coverage}`}>{COVERAGE_LABELS[req.coverage]}</span>
                  <span className="cmp-detail-num">{req.num}</span>
                </div>
                <div className="cmp-detail-title">{req.title}</div>
                <div className="cmp-detail-ela">
                  <div className="cmp-detail-ela-label">⚡ ELA Coverage</div>
                  <div className="cmp-detail-ela-text">{req.ela}</div>
                </div>
              </div>
            )}
          </div>

          {/* Coverage summary */}
          <div className="cmp-right">
            <div className="card cmp-summary-card">
              <div className="card-title">Coverage Summary</div>
              <div className="cmp-std-full-name">{std.fullName}</div>

              <div className="cmp-score-ring">
                <svg viewBox="0 0 100 100" className="cmp-ring-svg">
                  <circle cx="50" cy="50" r="40" className="cmp-ring-bg" />
                  <circle cx="50" cy="50" r="40" className="cmp-ring-fill"
                    style={{
                      strokeDasharray: `${score * 2.513} 251.3`,
                      stroke: std.color,
                    }}
                  />
                </svg>
                <div className="cmp-ring-label">
                  <div className="cmp-ring-pct" style={{ color: std.color }}>{score}%</div>
                  <div className="cmp-ring-sub">Coverage</div>
                </div>
              </div>

              <div className="cmp-coverage-breakdown">
                <div className="cmp-cov-row">
                  <div className="dot-full cmp-cov-dot" />
                  <span className="cmp-cov-label">Full Coverage</span>
                  <span className="cmp-cov-count" style={{ color: 'var(--success)' }}>{full}</span>
                </div>
                <div className="cmp-cov-row">
                  <div className="dot-partial cmp-cov-dot" />
                  <span className="cmp-cov-label">Partial Coverage</span>
                  <span className="cmp-cov-count" style={{ color: 'var(--warning)' }}>{partial}</span>
                </div>
                <div className="cmp-cov-row">
                  <div className="dot-none cmp-cov-dot" />
                  <span className="cmp-cov-label">Not Covered by ELA</span>
                  <span className="cmp-cov-count" style={{ color: 'var(--danger)' }}>{none}</span>
                </div>
              </div>

              <div className="cmp-note">
                Items not covered by ELA are typically policy-level or organizational controls
                that fall outside technical log monitoring scope.
              </div>
            </div>

            <div className="card cmp-ela-value">
              <div className="card-title">What ELA Provides</div>
              {[
                { icon: '📋', text: 'Pre-built compliance reports for each requirement' },
                { icon: '⚡', text: 'Real-time alerts on compliance-critical events' },
                { icon: '🗄️', text: 'Tamper-proof log archive with configurable retention' },
                { icon: '🔍', text: 'Forensic search across years of audit log data' },
                { icon: '📤', text: 'Export evidence packets for auditor review' },
              ].map(item => (
                <div key={item.text} className="cmp-ela-item">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compliance;
