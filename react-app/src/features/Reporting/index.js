import { useState } from 'react';
import './Reporting.css';

const CATEGORIES = [
  {
    id: 'security',
    icon: '🔐',
    label: 'Security Reports',
    color: '#e74c3c',
    reports: [
      { id: 'logon-activity', name: 'User Logon Activity', desc: 'Successful and failed logon events across all devices, grouped by user and time.' },
      { id: 'failed-logins',  name: 'Failed Login Attempts', desc: 'All failed authentication events with source IP, user, and device details.' },
      { id: 'priv-changes',   name: 'Privilege Changes', desc: 'Account privilege escalation, group membership changes, and admin rights modifications.' },
      { id: 'after-hours',    name: 'After-Hours Activity', desc: 'Login and access activity outside business hours (8 PM – 6 AM, weekends).' },
    ],
  },
  {
    id: 'compliance',
    icon: '✅',
    label: 'Compliance Reports',
    color: '#f39c12',
    reports: [
      { id: 'pci-rpt',   name: 'PCI DSS – Access Control Review', desc: 'Report of all access to cardholder data systems per PCI DSS Requirement 8.' },
      { id: 'hipaa-rpt', name: 'HIPAA – PHI Access Audit', desc: 'User access to systems containing Protected Health Information (PHI).' },
      { id: 'sox-rpt',   name: 'SOX – Financial System Logons', desc: 'Logon activity on financial systems for Sarbanes-Oxley internal control review.' },
      { id: 'gdpr-rpt',  name: 'GDPR – Personal Data Access', desc: 'Access logs for systems containing EU citizen personal data.' },
    ],
  },
  {
    id: 'operational',
    icon: '⚙️',
    label: 'Operational Reports',
    color: '#3498db',
    reports: [
      { id: 'device-status', name: 'Device Log Collection Status', desc: 'Health report of all log sources: last received time, log volume, collection gaps.' },
      { id: 'top-events',    name: 'Top Event Trends', desc: 'Most frequent event IDs and categories over the selected period.' },
      { id: 'log-volume',    name: 'Log Volume Analysis', desc: 'Daily/weekly log ingestion volumes per device, with anomaly detection.' },
      { id: 'disk-space',    name: 'Storage Utilization', desc: 'ELA database size trends, retention policy status, and projected storage needs.' },
    ],
  },
  {
    id: 'audit',
    icon: '📋',
    label: 'Audit Trail Reports',
    color: '#9b59b6',
    reports: [
      { id: 'user-audit',   name: 'User Activity Audit Trail', desc: 'Comprehensive per-user audit trail: logins, file access, privilege use, configuration changes.' },
      { id: 'admin-audit',  name: 'Admin Actions Audit', desc: 'All administrative actions performed by privileged accounts.' },
      { id: 'file-audit',   name: 'File Integrity Monitoring', desc: 'Changes to critical files and directories: creates, deletes, modifications.' },
      { id: 'config-audit', name: 'Configuration Change Audit', desc: 'System and network device configuration changes with before/after comparison.' },
    ],
  },
];

const SAMPLE_DATA = {
  'logon-activity': [
    { user: 'jdoe@corp.com',    successLogins: 47, failedLogins: 2,  devices: 3, lastLogin: '2024-01-15 17:32' },
    { user: 'alice@corp.com',   successLogins: 31, failedLogins: 0,  devices: 2, lastLogin: '2024-01-15 16:10' },
    { user: 'bob@corp.com',     successLogins: 12, failedLogins: 8,  devices: 1, lastLogin: '2024-01-15 14:05' },
    { user: 'svc-backup',       successLogins: 24, failedLogins: 0,  devices: 5, lastLogin: '2024-01-15 02:00' },
    { user: 'unknown',          successLogins: 0,  failedLogins: 54, devices: 1, lastLogin: '2024-01-15 10:22' },
  ],
  'failed-logins': [
    { datetime: '2024-01-15 10:00:31', user: 'unknown',        srcIp: '10.10.0.99',   device: 'WINDC01', attempts: 54, reason: 'Bad password' },
    { datetime: '2024-01-15 09:30:12', user: 'admin',          srcIp: '10.0.0.99',    device: 'LNXSRV01', attempts: 12, reason: 'Bad password' },
    { datetime: '2024-01-15 08:15:44', user: 'bob@corp.com',   srcIp: '192.168.5.10', device: 'WINDC01',  attempts: 8,  reason: 'Account locked' },
    { datetime: '2024-01-15 07:45:00', user: 'sa',             srcIp: '203.0.113.5',  device: 'WINDB01',  attempts: 32, reason: 'Bad password' },
  ],
  'device-status': [
    { device: 'WINDC01',   type: 'Windows DC',    lastLog: '1 min ago',   logsToday: '12,450', status: 'Active' },
    { device: 'LNXSRV01',  type: 'Linux Server',  lastLog: '2 min ago',   logsToday: '4,220',  status: 'Active' },
    { device: 'FW01',      type: 'Firewall',       lastLog: '30 sec ago',  logsToday: '31,100', status: 'Active' },
    { device: 'WINDB01',   type: 'SQL Server',     lastLog: '3 hours ago', logsToday: '1,050',  status: 'Warning' },
    { device: 'OLDSVR02',  type: 'Windows Server', lastLog: '2 days ago',  logsToday: '0',      status: 'Offline' },
  ],
};

function getDefaultData(reportId) {
  return SAMPLE_DATA[reportId] || SAMPLE_DATA['device-status'];
}

function renderTable(reportId, data) {
  if (!data || data.length === 0) return null;
  const keys = Object.keys(data[0]);
  return (
    <table className="rpt-table">
      <thead>
        <tr>{keys.map(k => <th key={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={row.status === 'Offline' ? 'row-danger' : row.status === 'Warning' ? 'row-warn' : row.failedLogins > 5 || row.attempts > 10 ? 'row-warn' : ''}>
            {keys.map(k => (
              <td key={k} className={k === 'status' ? `status-${(row[k] || '').toLowerCase()}` : ''}>
                {row[k]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Reporting() {
  const [selCat,    setSelCat]    = useState('security');
  const [selReport, setSelReport] = useState(null);
  const [genState,  setGenState]  = useState('idle'); // idle | generating | done
  const [progress,  setProgress]  = useState(0);
  const [dateRange, setDateRange] = useState('last7');
  const [reportData, setReportData] = useState(null);

  const cat = CATEGORIES.find(c => c.id === selCat);
  const report = cat?.reports.find(r => r.id === selReport);

  const handleCat = (id) => { setSelCat(id); setSelReport(null); setGenState('idle'); setProgress(0); setReportData(null); };

  const generate = () => {
    if (!selReport) return;
    setGenState('generating');
    setProgress(0);
    setReportData(null);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.floor(Math.random() * 18) + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setProgress(100);
        setTimeout(() => {
          setGenState('done');
          setReportData(getDefaultData(selReport));
        }, 200);
      }
      setProgress(p);
    }, 120);
  };

  const reset = () => { setGenState('idle'); setProgress(0); setReportData(null); };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">📊</span> Reporting</div>
        <div className="feature-desc">
          ELA ships with 1000+ pre-built reports covering security, compliance, operations, and audit.
          Select a category and report template, then generate a preview.
        </div>
      </div>

      <div className="rpt-layout">
        {/* Left: Categories + Reports */}
        <div className="rpt-sidebar">
          <div className="step-label">① Select category</div>
          <div className="rpt-categories">
            {CATEGORIES.map(c => (
              <button key={c.id} className={`rpt-cat-btn ${selCat === c.id ? 'active' : ''}`}
                style={{ '--cc': c.color }} onClick={() => handleCat(c.id)}>
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          {cat && (
            <>
              <div className="step-label" style={{ marginTop: '1.5rem' }}>② Select report</div>
              <div className="rpt-report-list">
                {cat.reports.map(r => (
                  <button key={r.id}
                    className={`rpt-report-item ${selReport === r.id ? 'active' : ''}`}
                    onClick={() => { setSelReport(r.id); setGenState('idle'); setProgress(0); setReportData(null); }}>
                    <div className="rpt-report-name">{r.name}</div>
                    <div className="rpt-report-desc">{r.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Config + Output */}
        <div className="rpt-main">
          {!selReport ? (
            <div className="rpt-placeholder">
              <div className="rpt-placeholder-icon">📊</div>
              <div className="rpt-placeholder-text">Select a report template to get started</div>
            </div>
          ) : (
            <>
              <div className="card rpt-config-card">
                <div className="rpt-config-header">
                  <div>
                    <div className="rpt-report-title">{report?.name}</div>
                    <div className="rpt-report-subdesc">{report?.desc}</div>
                  </div>
                  <span className="rpt-cat-badge" style={{ background: `${cat?.color}22`, color: cat?.color, border: `1px solid ${cat?.color}55` }}>
                    {cat?.icon} {cat?.label}
                  </span>
                </div>

                <div className="rpt-config-row">
                  <div className="al-field">
                    <label className="al-label">Date Range</label>
                    <select className="al-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                      <option value="today">Today</option>
                      <option value="last7">Last 7 Days</option>
                      <option value="last30">Last 30 Days</option>
                      <option value="last90">Last 90 Days</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  <div className="al-field">
                    <label className="al-label">Device Group</label>
                    <select className="al-select">
                      <option>All Devices</option>
                      <option>Domain Controllers</option>
                      <option>Web Servers</option>
                      <option>Firewalls</option>
                      <option>Databases</option>
                    </select>
                  </div>
                  <div className="al-field">
                    <label className="al-label">Output Format</label>
                    <select className="al-select">
                      <option>PDF</option>
                      <option>CSV</option>
                      <option>HTML</option>
                    </select>
                  </div>
                </div>

                <div className="al-buttons">
                  <button className="btn btn-primary" onClick={generate} disabled={genState === 'generating'}>
                    {genState === 'generating' ? '⟳ Generating…' : '📊 Generate Report'}
                  </button>
                  {genState !== 'idle' && <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>}
                </div>

                {genState === 'generating' && (
                  <div className="rpt-progress-wrap">
                    <div className="rpt-progress-bar" style={{ width: `${progress}%` }} />
                    <div className="rpt-progress-label">Processing logs… {progress}%</div>
                  </div>
                )}
              </div>

              {genState === 'done' && reportData && (
                <div className="rpt-output fade-in">
                  <div className="rpt-output-header">
                    <div className="rpt-output-title">
                      <span className="rpt-output-badge">REPORT PREVIEW</span>
                      {report?.name}
                    </div>
                    <div className="rpt-output-meta">
                      Generated: {new Date().toLocaleString()} &nbsp;·&nbsp; {reportData.length} rows
                    </div>
                  </div>
                  <div className="rpt-table-wrap">
                    {renderTable(selReport, reportData)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reporting;
