import { useState } from 'react';
import './LogParsing.css';

const LOG_TYPES = [
  {
    id: 'win4624',
    label: 'Windows Security – Event 4624 (Logon)',
    icon: '🪟',
    raw: `Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          2024-01-15 09:32:14
Event ID:      4624
Task Category: Logon
Level:         Information
Keywords:      Audit Success
Computer:      WINDC01.corp.local

An account was successfully logged on.

Subject:
  Security ID:   SYSTEM
  Account Name:  WINDC01$
  Account Domain: CORP

New Logon:
  Security ID:   CORP\\jdoe
  Account Name:  jdoe
  Account Domain: CORP
  Logon ID:      0x3E7

Network Information:
  Workstation Name: WKSTN-42
  Source IP:    192.168.10.55
  Source Port:  51234

Logon Type:    2 (Interactive)
Process Name:  C:\\Windows\\System32\\winlogon.exe`,
    fields: [
      { name: 'datetime',         value: '2024-01-15 09:32:14',       color: '#3498db', label: 'Event Time' },
      { name: 'event_id',         value: '4624',                       color: '#e74c3c', label: 'Event ID' },
      { name: 'level',            value: 'Information',                color: '#2ecc71', label: 'Level' },
      { name: 'source_host',      value: 'WINDC01.corp.local',         color: '#9b59b6', label: 'Source Host' },
      { name: 'account_name',     value: 'jdoe',                       color: '#f39c12', label: 'Account Name' },
      { name: 'account_domain',   value: 'CORP',                       color: '#e67e22', label: 'Domain' },
      { name: 'logon_type',       value: '2 (Interactive)',            color: '#1abc9c', label: 'Logon Type' },
      { name: 'src_ip',           value: '192.168.10.55',              color: '#e74c3c', label: 'Source IP' },
      { name: 'workstation',      value: 'WKSTN-42',                   color: '#3498db', label: 'Workstation' },
      { name: 'process',          value: 'winlogon.exe',               color: '#9b59b6', label: 'Process' },
    ],
  },
  {
    id: 'linux-auth',
    label: 'Linux – SSH Authentication (syslog)',
    icon: '🐧',
    raw: `Jan 15 09:30:05 webserver01 sshd[8421]: Accepted password for admin from 10.0.0.50 port 54210 ssh2
Jan 15 09:30:05 webserver01 sshd[8421]: pam_unix(sshd:session): session opened for user admin by (uid=0)
Jan 15 09:30:07 webserver01 sshd[8421]: User admin logged in from 10.0.0.50`,
    fields: [
      { name: 'datetime',   value: 'Jan 15 09:30:05',     color: '#3498db', label: 'Event Time' },
      { name: 'hostname',   value: 'webserver01',          color: '#9b59b6', label: 'Hostname' },
      { name: 'process',    value: 'sshd',                 color: '#f39c12', label: 'Process' },
      { name: 'pid',        value: '8421',                 color: '#e67e22', label: 'PID' },
      { name: 'action',     value: 'Accepted password',    color: '#2ecc71', label: 'Action' },
      { name: 'username',   value: 'admin',                color: '#e74c3c', label: 'Username' },
      { name: 'src_ip',     value: '10.0.0.50',            color: '#1abc9c', label: 'Source IP' },
      { name: 'src_port',   value: '54210',                color: '#3498db', label: 'Source Port' },
      { name: 'protocol',   value: 'ssh2',                 color: '#9b59b6', label: 'Protocol' },
    ],
  },
  {
    id: 'apache',
    label: 'Apache – Web Access Log',
    icon: '🌐',
    raw: `192.168.1.100 - john [15/Jan/2024:09:22:11 +0000] "GET /api/users?role=admin HTTP/1.1" 200 4523 "https://corp.com/dashboard" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
10.0.0.15 - - [15/Jan/2024:09:22:45 +0000] "POST /api/login HTTP/1.1" 401 210 "-" "python-requests/2.28.0"
203.0.113.5 - - [15/Jan/2024:09:23:01 +0000] "GET /etc/passwd HTTP/1.1" 404 178 "-" "sqlmap/1.7.8"`,
    fields: [
      { name: 'client_ip',    value: '192.168.1.100',              color: '#e74c3c', label: 'Client IP' },
      { name: 'ident',        value: '-',                           color: '#7f8c8d', label: 'Ident' },
      { name: 'auth_user',    value: 'john',                        color: '#f39c12', label: 'Auth User' },
      { name: 'datetime',     value: '15/Jan/2024:09:22:11 +0000', color: '#3498db', label: 'Timestamp' },
      { name: 'http_method',  value: 'GET',                         color: '#2ecc71', label: 'HTTP Method' },
      { name: 'uri',          value: '/api/users?role=admin',       color: '#9b59b6', label: 'URI' },
      { name: 'http_version', value: 'HTTP/1.1',                    color: '#e67e22', label: 'HTTP Version' },
      { name: 'status_code',  value: '200',                         color: '#2ecc71', label: 'Status Code' },
      { name: 'response_size',value: '4523',                        color: '#1abc9c', label: 'Response Size' },
      { name: 'user_agent',   value: 'Mozilla/5.0 (Windows NT…)',  color: '#3498db', label: 'User Agent' },
    ],
  },
  {
    id: 'cisco',
    label: 'Cisco IOS – Firewall ACL Log',
    icon: '🔧',
    raw: `%ASA-4-106023: Deny tcp src outside:203.0.113.5/4444 dst inside:10.0.0.5/80 by access-group "ACL_OUTSIDE_IN" [0x0, 0x0]
%ASA-6-302013: Built inbound TCP connection 1234567 for outside:203.0.113.5/1025 (203.0.113.5/1025) to inside:10.0.0.10/443 (10.0.0.10/443)
%ASA-5-111008: User 'admin' executed the 'show running-config' command.`,
    fields: [
      { name: 'severity',      value: '4 (Warning)',               color: '#f39c12', label: 'Severity Level' },
      { name: 'message_id',    value: '106023',                    color: '#e74c3c', label: 'Message ID' },
      { name: 'action',        value: 'Deny',                      color: '#e74c3c', label: 'Action' },
      { name: 'protocol',      value: 'tcp',                       color: '#3498db', label: 'Protocol' },
      { name: 'src_interface', value: 'outside',                   color: '#9b59b6', label: 'Src Interface' },
      { name: 'src_ip',        value: '203.0.113.5',               color: '#e74c3c', label: 'Source IP' },
      { name: 'src_port',      value: '4444',                      color: '#e67e22', label: 'Source Port' },
      { name: 'dst_interface', value: 'inside',                    color: '#9b59b6', label: 'Dst Interface' },
      { name: 'dst_ip',        value: '10.0.0.5',                  color: '#2ecc71', label: 'Dest IP' },
      { name: 'dst_port',      value: '80',                        color: '#1abc9c', label: 'Dest Port' },
      { name: 'acl_name',      value: 'ACL_OUTSIDE_IN',            color: '#f39c12', label: 'ACL Name' },
    ],
  },
];

function LogParsing() {
  const [selType, setSelType]       = useState(null);
  const [parsedCount, setParsedCount] = useState(0);
  const [isParsing, setIsParsing]   = useState(false);
  const [done, setDone]             = useState(false);

  const logType = LOG_TYPES.find(l => l.id === selType);

  const handleSelect = (id) => {
    setSelType(id);
    setParsedCount(0);
    setIsParsing(false);
    setDone(false);
  };

  const runParse = () => {
    if (!logType || isParsing) return;
    setParsedCount(0);
    setDone(false);
    setIsParsing(true);
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setParsedCount(count);
      if (count >= logType.fields.length) {
        clearInterval(iv);
        setIsParsing(false);
        setDone(true);
      }
    }, 220);
  };

  const reset = () => { setParsedCount(0); setDone(false); setIsParsing(false); };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">🔍</span> Log Parsing</div>
        <div className="feature-desc">
          ELA automatically parses raw log data into structured, searchable fields using
          pre-built parsers for 1000+ formats. Select a log type to see parsing in action.
        </div>
      </div>

      {/* Log type selector */}
      <div className="step-label">① Select a log type</div>
      <div className="lp-type-grid">
        {LOG_TYPES.map(lt => (
          <button
            key={lt.id}
            className={`lp-type-card ${selType === lt.id ? 'selected' : ''}`}
            onClick={() => handleSelect(lt.id)}
          >
            <span className="lp-type-icon">{lt.icon}</span>
            <span className="lp-type-label">{lt.label}</span>
          </button>
        ))}
      </div>

      {logType && (
        <>
          {/* Raw log */}
          <div className="step-label">② Raw log (as received by ELA)</div>
          <div className="lp-raw-box">
            <div className="lp-raw-header">
              <span className="lp-raw-badge">RAW</span>
              <span className="lp-raw-title">{logType.label}</span>
            </div>
            <pre className="lp-raw-text">{logType.raw}</pre>
          </div>

          {/* Parse action */}
          <div className="step-label">③ Parse &amp; extract fields</div>
          <div className="lp-action-bar">
            <button className="btn btn-primary" onClick={runParse} disabled={isParsing}>
              {isParsing ? '⟳ Parsing…' : '▶ Run Parser'}
            </button>
            {parsedCount > 0 && (
              <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>
            )}
            {done && <span className="lp-done-badge">✓ {logType.fields.length} fields extracted</span>}
          </div>

          {/* Parsed output */}
          {parsedCount > 0 && (
            <div className="lp-parsed-grid">
              {logType.fields.slice(0, parsedCount).map((f, i) => (
                <div
                  key={f.name}
                  className="lp-field-card field-anim"
                  style={{ '--fc': f.color, animationDelay: '0ms' }}
                >
                  <div className="lp-field-name">{f.label}</div>
                  <div className="lp-field-key">{f.name}</div>
                  <div className="lp-field-value" style={{ color: f.color }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Normalized record */}
          {done && (
            <div className="lp-norm-box fade-in">
              <div className="lp-norm-header">
                <span className="lp-raw-badge success-badge">NORMALIZED</span>
                <span className="lp-raw-title">Structured record stored in ELA database</span>
              </div>
              <div className="lp-norm-table">
                {logType.fields.map(f => (
                  <div key={f.name} className="lp-norm-row">
                    <span className="lp-norm-key">{f.name}</span>
                    <span className="lp-norm-val" style={{ color: f.color }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LogParsing;
