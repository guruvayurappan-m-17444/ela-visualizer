import { useState } from 'react';
import './LogCollection.css';

const SOURCES = [
  {
    id: 'windows', icon: '🪟', name: 'Windows Servers', color: '#0078d4',
    desc: 'Windows Server, Domain Controllers, Workstations',
    methods: [
      {
        id: 'wmi', name: 'WMI / Agentless', icon: '🔌',
        desc: 'ELA remotely polls the Windows Event Log via WMI (Windows Management Instrumentation). No agent installation needed. Ideal for smaller environments.',
        pros: ['No agent installation', 'Centralized management', 'All standard Windows event logs'],
        cons: ['Requires WMI firewall rules', 'Slightly higher network usage', 'Admin credentials needed'],
      },
      {
        id: 'win-agent', name: 'Windows Agent', icon: '⚙️',
        desc: 'A lightweight ELA agent is installed on the target machine. It forwards logs in real-time over a persistent encrypted channel to the ELA server.',
        pros: ['Real-time forwarding', 'Lower bandwidth', 'Works across firewalls / NAT'],
        cons: ['Requires agent deployment', 'MSI rollout needed', 'Agent updates required'],
      },
    ],
    sampleLogs: [
      { time: '09:32:14', eventId: '4624', level: 'INFO',  desc: 'An account was successfully logged on',        source: 'WINDC01',    user: 'jdoe@corp.com' },
      { time: '09:32:18', eventId: '4648', level: 'INFO',  desc: 'A logon attempted using explicit credentials', source: 'WINDC01',    user: 'jdoe@corp.com' },
      { time: '09:33:01', eventId: '4625', level: 'WARN',  desc: 'An account failed to log on (Bad password)',   source: 'WINDC01',    user: 'unknown' },
      { time: '09:35:22', eventId: '4720', level: 'INFO',  desc: 'A user account was created',                  source: 'WINSRV01',   user: 'admin@corp.com' },
      { time: '09:36:05', eventId: '4732', level: 'WARN',  desc: 'A member was added to a security-enabled local group', source: 'WINSRV01', user: 'admin@corp.com' },
    ],
  },
  {
    id: 'linux', icon: '🐧', name: 'Linux / Unix', color: '#e8a020',
    desc: 'RHEL, Ubuntu, CentOS, Debian, AIX, Solaris',
    methods: [
      {
        id: 'syslog', name: 'Syslog Forwarding', icon: '📤',
        desc: 'Linux systems forward logs via the standard Syslog protocol (UDP/TCP 514). rsyslog or syslog-ng is configured to stream logs directly to the ELA server IP.',
        pros: ['Native to all Linux distros', 'Simple one-line config', 'Near real-time delivery'],
        cons: ['UDP can drop messages', 'No delivery acknowledgment', 'Plain text unless TLS added'],
      },
      {
        id: 'linux-agent', name: 'Linux Agent', icon: '⚙️',
        desc: 'ELA\'s Linux agent is installed on the host. It tails log files (/var/log/auth.log, secure, messages, custom paths) and forwards events over encrypted TLS.',
        pros: ['Encrypted channel', 'Custom log file monitoring', 'Guaranteed delivery'],
        cons: ['Root-level installation required', 'Per-host deployment', 'Version management'],
      },
    ],
    sampleLogs: [
      { time: '09:30:05', eventId: 'AUTH',  level: 'INFO', desc: 'Accepted password for root from 192.168.1.50 port 22 ssh2',            source: 'LNXSRV01', user: 'root' },
      { time: '09:30:12', eventId: 'AUTH',  level: 'WARN', desc: 'Failed password for admin from 10.0.0.99 port 54234 ssh2',             source: 'LNXSRV01', user: 'admin' },
      { time: '09:31:44', eventId: 'SUDO',  level: 'INFO', desc: 'jdoe : TTY=pts/0 ; PWD=/home/jdoe ; USER=root ; COMMAND=/bin/bash',    source: 'LNXSRV01', user: 'jdoe' },
      { time: '09:42:00', eventId: 'CRON',  level: 'INFO', desc: 'CRON[12541]: (root) CMD (/usr/local/sbin/backup.sh)',                  source: 'LNXSRV01', user: 'root' },
      { time: '09:45:33', eventId: 'USERADD',level:'WARN', desc: 'new user: name=attacker, UID=1001, GID=1001, dir=/home/attacker',      source: 'LNXSRV01', user: 'root' },
    ],
  },
  {
    id: 'network', icon: '🌐', name: 'Network Devices', color: '#2ecc71',
    desc: 'Cisco, Juniper, Fortinet, Palo Alto, F5, Check Point',
    methods: [
      {
        id: 'net-syslog', name: 'Syslog', icon: '📡',
        desc: 'Network devices natively emit Syslog messages. ELA receives these on UDP/TCP 514 and maps vendor-specific formats (Cisco IOS, PAN-OS, Fortinet, etc.) to normalized fields.',
        pros: ['Universal support', 'Zero agent needed', 'Real-time event delivery'],
        cons: ['UDP reliability concerns', 'Device-side config required', 'Vendor format variations'],
      },
      {
        id: 'snmp', name: 'SNMP Traps', icon: '🪤',
        desc: 'Devices send SNMP v1/v2c/v3 traps to ELA on critical events: link failures, CPU spikes, security violations. ELA decodes MIB OIDs and stores structured events.',
        pros: ['Instant event notification', 'Structured MIB data', 'No log file management'],
        cons: ['Traps only — not full log stream', 'MIB file management overhead', 'UDP delivery'],
      },
    ],
    sampleLogs: [
      { time: '09:28:30', eventId: 'FW-DENY', level: 'WARN', desc: 'Deny TCP 203.0.113.5:4444 → 10.0.0.5:80 rule "Block_Inbound"', source: 'FW01',      user: '-' },
      { time: '09:29:01', eventId: 'VPN',     level: 'INFO', desc: 'AnyConnect VPN: jdoe authenticated from 185.123.45.67',        source: 'ASA-FW',    user: 'jdoe' },
      { time: '09:31:15', eventId: 'ACL',     level: 'WARN', desc: 'ACL deny: icmp 192.168.100.20 → 172.16.0.0/16 (inbound)',     source: 'CORE-SW',   user: '-' },
      { time: '09:35:00', eventId: 'LINK',    level: 'INFO', desc: 'Interface GigabitEthernet0/1 changed state to up',             source: 'CORE-SW',   user: '-' },
      { time: '09:38:12', eventId: 'IDS',     level: 'CRIT', desc: 'Snort Alert: ET SCAN Nmap Scripting Engine detected',         source: 'IDS-SNORT', user: '-' },
    ],
  },
  {
    id: 'cloud', icon: '☁️', name: 'Cloud Services', color: '#9b59b6',
    desc: 'AWS CloudTrail, Azure AD, GCP Audit, Microsoft 365',
    methods: [
      {
        id: 'api-pull', name: 'Cloud API Pull', icon: '🔗',
        desc: 'ELA pulls audit logs directly from cloud provider APIs using service accounts / IAM roles. Supports AWS CloudTrail, Azure Activity Log, GCP Cloud Audit, M365 Unified Audit Log.',
        pros: ['No infrastructure changes', 'IAM-based auth (no passwords)', 'Full cloud activity coverage'],
        cons: ['API rate limits apply', 'Polling interval introduces lag', 'Per-tenant configuration'],
      },
      {
        id: 's3', name: 'S3 / Blob Storage', icon: '🪣',
        desc: 'Cloud services export logs to S3 buckets or Azure Blob storage. ELA periodically ingests these files — ideal for high-volume services like VPC Flow Logs or CloudFront.',
        pros: ['Handles massive log volumes', 'Cost-effective storage', 'Works for historical import'],
        cons: ['Not real-time (polling delay)', 'Requires bucket access policy', 'File format variations'],
      },
    ],
    sampleLogs: [
      { time: '09:20:11', eventId: 'CloudTrail', level: 'INFO', desc: 'ConsoleLogin: Success | IAM user: john.doe | MFA: true | IP: 203.0.113.10', source: 'AWS-US-EAST', user: 'john.doe' },
      { time: '09:22:48', eventId: 'CloudTrail', level: 'WARN', desc: 'CreateBucket: s3://corp-backups-test | Region: us-east-1 | By: terraform-svc', source: 'AWS-US-EAST', user: 'terraform-svc' },
      { time: '09:25:00', eventId: 'AzureAD',    level: 'WARN', desc: 'Sign-in blocked by Conditional Access: MFA required, Risk: High',           source: 'Azure-AD',   user: 'ext-contractor' },
      { time: '09:30:15', eventId: 'M365',        level: 'INFO', desc: 'FileAccessed: /SharePoint/Finance/Q4-Budget.xlsx by john.doe@corp.com',      source: 'M365',       user: 'john.doe' },
      { time: '09:32:44', eventId: 'GCP',         level: 'WARN', desc: 'SetIamPolicy: serviceAccount roles/owner granted to unknown@external.com',   source: 'GCP-PROD',   user: 'admin-gcp' },
    ],
  },
];

const PIPELINE = [
  { icon: '🖥️', label: 'Source Device' },
  { icon: '📡', label: 'Collector' },
  { icon: '🔄', label: 'ELA Parser' },
  { icon: '🗄️', label: 'Log Store' },
  { icon: '📊', label: 'Analysis' },
];

function LogCollection() {
  const [selSource, setSelSource]   = useState(null);
  const [selMethod, setSelMethod]   = useState(null);
  const [showLogs,  setShowLogs]    = useState(false);

  const source = SOURCES.find(s => s.id === selSource);
  const method = source?.methods.find(m => m.id === selMethod);

  const handleSource = (id) => {
    setSelSource(id);
    setSelMethod(null);
    setShowLogs(false);
  };

  const handleMethod = (id) => {
    setSelMethod(id);
    setShowLogs(false);
    setTimeout(() => setShowLogs(true), 600);
  };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">📡</span> Log Collection</div>
        <div className="feature-desc">
          EventLog Analyzer aggregates logs from 700+ source types across your infrastructure.
          Select a source type below to see how collection works end-to-end.
        </div>
      </div>

      {/* Step 1 */}
      <div className="step-label">① Select a log source</div>
      <div className="lc-sources-grid">
        {SOURCES.map(s => (
          <button
            key={s.id}
            className={`lc-source-card ${selSource === s.id ? 'selected' : ''}`}
            style={{ '--src': s.color }}
            onClick={() => handleSource(s.id)}
          >
            <div className="lc-src-icon">{s.icon}</div>
            <div className="lc-src-name">{s.name}</div>
            <div className="lc-src-desc">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Step 2 */}
      {source && (
        <div className="lc-section fade-in">
          <div className="step-label">② Choose collection method</div>
          <div className="lc-methods-grid">
            {source.methods.map(m => (
              <button
                key={m.id}
                className={`lc-method-card ${selMethod === m.id ? 'selected' : ''}`}
                onClick={() => handleMethod(m.id)}
              >
                <div className="lc-method-head">
                  <span className="lc-method-icon">{m.icon}</span>
                  <span className="lc-method-name">{m.name}</span>
                </div>
                <p className="lc-method-desc">{m.desc}</p>
                {selMethod === m.id && (
                  <div className="lc-pros-cons">
                    <div className="lc-pros">
                      <div className="lc-pc-label success">✓ Advantages</div>
                      {m.pros.map(p => <div key={p} className="lc-pc-item">• {p}</div>)}
                    </div>
                    <div className="lc-cons">
                      <div className="lc-pc-label warn">⚠ Considerations</div>
                      {m.cons.map(c => <div key={c} className="lc-pc-item">• {c}</div>)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Pipeline */}
      {method && (
        <div className="lc-section fade-in">
          <div className="step-label">③ Collection pipeline</div>
          <div className="lc-pipeline">
            {PIPELINE.map((node, i) => (
              <div key={node.label} className="lc-pipe-item">
                <div className={`lc-pipe-node ${i === 0 ? 'node-src' : i === PIPELINE.length - 1 ? 'node-out' : 'node-mid'}`}>
                  <div className="lc-pipe-icon">{node.icon}</div>
                  <div className="lc-pipe-label">{node.label}</div>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="lc-pipe-arrow">
                    <div className="lc-pipe-line" />
                    <div className="lc-pipe-dot" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Sample logs */}
      {showLogs && source && (
        <div className="lc-section fade-in">
          <div className="step-label">④ Sample collected events</div>
          <div className="lc-log-table">
            <div className="lc-log-header">
              <span>Time</span><span>Event ID</span><span>Level</span>
              <span className="col-wide">Description</span><span>Source</span><span>User</span>
            </div>
            {source.sampleLogs.map((log, i) => (
              <div
                key={i}
                className={`lc-log-row lc-row-anim log-lvl-${log.level.toLowerCase()}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="log-time">{log.time}</span>
                <span className="log-eid">{log.eventId}</span>
                <span className={`log-badge badge-${log.level === 'INFO' ? 'info' : log.level === 'CRIT' ? 'crit' : 'warn'}`}>
                  {log.level}
                </span>
                <span className="log-desc col-wide">{log.desc}</span>
                <span className="log-src">{log.source}</span>
                <span className="log-usr">{log.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogCollection;
