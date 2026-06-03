import { useState, useEffect, useRef } from 'react';
import './Correlation.css';

const SCENARIOS = [
  {
    id: 'brute-force',
    icon: '🔨',
    name: 'Brute Force Attack',
    color: '#e74c3c',
    rule: {
      name: 'Brute Force Detection',
      condition: '5+ failed logins from same source IP within 2 minutes, followed by a success',
      severity: 'Critical',
    },
    events: [
      { id: 1, time: '10:00:31', src: '10.10.0.99', dst: 'WINDC01',    type: 'FAILED_LOGIN',  desc: 'Failed login: user "administrator" — bad password (attempt 1)',   match: false, key: false },
      { id: 2, time: '10:00:37', src: '10.10.0.99', dst: 'WINDC01',    type: 'FAILED_LOGIN',  desc: 'Failed login: user "administrator" — bad password (attempt 2)',   match: false, key: false },
      { id: 3, time: '10:00:43', src: '10.10.0.99', dst: 'WINDC01',    type: 'FAILED_LOGIN',  desc: 'Failed login: user "administrator" — bad password (attempt 3)',   match: false, key: false },
      { id: 4, time: '10:00:48', src: '192.168.1.5', dst: 'LNXWEB01',  type: 'INFO',          desc: 'Normal SSH login: jdoe from 192.168.1.5 — success',               match: false, key: false },
      { id: 5, time: '10:00:51', src: '10.10.0.99', dst: 'WINDC01',    type: 'FAILED_LOGIN',  desc: 'Failed login: user "administrator" — bad password (attempt 4)',   match: false, key: false },
      { id: 6, time: '10:00:55', src: '10.10.0.99', dst: 'WINDC01',    type: 'FAILED_LOGIN',  desc: 'Failed login: user "administrator" — bad password (attempt 5) ⚠ THRESHOLD', match: true, key: false },
      { id: 7, time: '10:01:02', src: '10.10.0.99', dst: 'WINDC01',    type: 'SUCCESS_LOGIN', desc: 'Successful login: user "administrator" from 10.10.0.99 — RULE FIRES 🔴', match: true, key: true },
    ],
    incident: {
      title: 'Brute Force Attack — Account Compromised',
      severity: 'Critical',
      srcIp: '10.10.0.99',
      dstDevice: 'WINDC01',
      attacker: 'Unknown (external)',
      target: 'administrator@corp.com',
      timeline: '10:00:31 – 10:01:02',
      recommendation: 'Lock the account immediately. Block 10.10.0.99 at the firewall. Review all actions taken by "administrator" after 10:01:02.',
    },
  },
  {
    id: 'data-exfil',
    icon: '📤',
    name: 'Data Exfiltration',
    color: '#e67e22',
    rule: {
      name: 'Data Exfiltration Detection',
      condition: 'Large data volume transferred to external IP after access to sensitive file share',
      severity: 'Critical',
    },
    events: [
      { id: 1, time: '14:20:10', src: 'WKSTN-42',      dst: 'FILESVR01', type: 'FILE_ACCESS',  desc: 'User jdoe accessed \\\\FILESVR01\\Finance — 350 files opened', match: false, key: false },
      { id: 2, time: '14:21:05', src: 'WKSTN-42',      dst: 'FILESVR01', type: 'FILE_ACCESS',  desc: 'User jdoe copied 4.2 GB from \\\\FILESVR01\\Finance to C:\\Temp', match: false, key: false },
      { id: 3, time: '14:22:00', src: '192.168.1.42',  dst: '185.44.0.1', type: 'NET_FLOW',   desc: 'Outbound connection: 192.168.1.42 → 185.44.0.1:443 (unknown entity)', match: false, key: false },
      { id: 4, time: '14:22:15', src: '192.168.1.42',  dst: '185.44.0.1', type: 'LARGE_XFER', desc: 'Data transfer: 1.8 GB sent to 185.44.0.1 over 4 minutes ⚠', match: true, key: false },
      { id: 5, time: '14:26:44', src: '192.168.1.42',  dst: '185.44.0.1', type: 'LARGE_XFER', desc: 'Transfer complete: 4.1 GB total exfiltrated to external IP — RULE FIRES 🔴', match: true, key: true },
    ],
    incident: {
      title: 'Suspected Data Exfiltration — Finance Files',
      severity: 'Critical',
      srcIp: '192.168.1.42 (WKSTN-42)',
      dstDevice: '185.44.0.1 (External)',
      attacker: 'Insider: jdoe@corp.com',
      target: '\\\\FILESVR01\\Finance (4.1 GB)',
      timeline: '14:20:10 – 14:26:44',
      recommendation: 'Isolate WKSTN-42 immediately. Suspend jdoe account. Block 185.44.0.1 at firewall. Engage legal and HR for insider threat investigation.',
    },
  },
  {
    id: 'ransomware',
    icon: '🔒',
    name: 'Ransomware Activity',
    color: '#9b59b6',
    rule: {
      name: 'Ransomware Behavior Detection',
      condition: 'Mass file rename/encrypt pattern + shadow copy deletion + unusual process activity',
      severity: 'Critical',
    },
    events: [
      { id: 1, time: '23:14:00', src: 'FILESVR01', dst: 'FILESVR01', type: 'PROCESS',     desc: 'Suspicious process started: cmd.exe spawned by powershell.exe (PID 5544)', match: false, key: false },
      { id: 2, time: '23:14:05', src: 'FILESVR01', dst: 'FILESVR01', type: 'FILE_CHANGE', desc: 'Mass file modification: 120 files renamed to .locked in C:\\Documents', match: false, key: false },
      { id: 3, time: '23:14:08', src: 'FILESVR01', dst: 'FILESVR01', type: 'FILE_CHANGE', desc: '250 more files renamed to .locked in \\\\FILESVR01\\Users ⚠ THRESHOLD', match: true, key: false },
      { id: 4, time: '23:14:12', src: 'FILESVR01', dst: 'FILESVR01', type: 'CMD_EXEC',    desc: 'vssadmin.exe delete shadows /all /quiet — Shadow copies being deleted! ⚠', match: true, key: false },
      { id: 5, time: '23:14:15', src: 'FILESVR01', dst: 'FILESVR01', type: 'FILE_CREATE', desc: 'README_DECRYPT.txt created in 40+ directories — RULE FIRES 🔴', match: true, key: true },
    ],
    incident: {
      title: 'Active Ransomware Attack Detected',
      severity: 'Critical',
      srcIp: 'FILESVR01 (local process)',
      dstDevice: 'FILESVR01 + network shares',
      attacker: 'Ransomware process (PID 5544)',
      target: 'All file shares (370+ files encrypted)',
      timeline: '23:14:00 – 23:14:15',
      recommendation: 'IMMEDIATE: Isolate FILESVR01 from network. Stop the malicious process. Do NOT pay ransom. Restore from last clean backup. Engage IR team.',
    },
  },
  {
    id: 'insider',
    icon: '🕵️',
    name: 'Insider Threat',
    color: '#3498db',
    rule: {
      name: 'Privileged Insider Activity',
      condition: 'Admin account active outside business hours + bulk data access + audit log cleared',
      severity: 'High',
    },
    events: [
      { id: 1, time: '02:15:33', src: '192.168.1.10', dst: 'WINDC01',   type: 'LOGIN',       desc: 'Admin login at 2:15 AM: sysadmin@corp.com from internal workstation', match: false, key: false },
      { id: 2, time: '02:16:00', src: 'WKSTN-ADMIN',  dst: 'FILESVR01', type: 'FILE_ACCESS', desc: 'Accessed HR confidential share: 80 employee records downloaded', match: false, key: false },
      { id: 3, time: '02:18:44', src: 'WKSTN-ADMIN',  dst: 'WINDB01',   type: 'DB_QUERY',    desc: 'Bulk SQL export: SELECT * FROM employees (4,500 rows) to CSV', match: true, key: false },
      { id: 4, time: '02:20:10', src: 'WKSTN-ADMIN',  dst: 'WINDC01',   type: 'AUDIT',       desc: 'Security audit log CLEARED on WINDC01 by sysadmin — RULE FIRES 🔴', match: true, key: true },
    ],
    incident: {
      title: 'Insider Threat — Privileged Data Access + Log Tampering',
      severity: 'High',
      srcIp: 'WKSTN-ADMIN (192.168.1.10)',
      dstDevice: 'WINDC01, FILESVR01, WINDB01',
      attacker: 'Insider: sysadmin@corp.com',
      target: 'HR records + Employee DB (4,500 rows)',
      timeline: '02:15:33 – 02:20:10',
      recommendation: 'Suspend sysadmin account. Preserve all remaining logs immediately. Engage HR and legal. Review all privileged account activities over the past 30 days.',
    },
  },
];

const TYPE_COLOR = {
  FAILED_LOGIN: '#e74c3c', SUCCESS_LOGIN: '#e74c3c',
  FILE_ACCESS: '#3498db', LARGE_XFER: '#e67e22', NET_FLOW: '#9b59b6',
  FILE_CHANGE: '#f39c12', CMD_EXEC: '#e74c3c', FILE_CREATE: '#e74c3c',
  PROCESS: '#9b59b6', DB_QUERY: '#3498db', AUDIT: '#e74c3c',
  LOGIN: '#3498db', INFO: '#2ecc71',
};

function Correlation() {
  const [selScenario, setSelScenario] = useState(null);
  const [simState,    setSimState]    = useState('idle');
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [incident,    setIncident]    = useState(null);
  const evEndRef = useRef(null);

  useEffect(() => {
    if (evEndRef.current) evEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [visibleEvents]);

  const scenario = SCENARIOS.find(s => s.id === selScenario);

  const handleScenario = (id) => {
    setSelScenario(id);
    setSimState('idle');
    setVisibleEvents([]);
    setIncident(null);
  };

  const runSim = () => {
    if (!scenario || simState === 'running') return;
    setVisibleEvents([]);
    setIncident(null);
    setSimState('running');
    let idx = 0;
    const events = scenario.events;

    const next = () => {
      if (idx >= events.length) {
        setSimState('done');
        return;
      }
      const ev = events[idx++];
      setVisibleEvents(prev => [...prev, ev]);
      if (ev.key) {
        setIncident(scenario.incident);
        setSimState('done');
        return;
      }
      const delay = ev.match ? 700 : 450;
      setTimeout(next, delay);
    };

    setTimeout(next, 300);
  };

  const reset = () => {
    setSimState('idle');
    setVisibleEvents([]);
    setIncident(null);
  };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">🔗</span> Event Correlation</div>
        <div className="feature-desc">
          ELA's correlation engine analyzes events across multiple sources in real-time to detect
          multi-stage attack patterns. Select a scenario and run the simulation.
        </div>
      </div>

      {/* Scenario selector */}
      <div className="step-label">① Select an attack scenario</div>
      <div className="cor-scenarios">
        {SCENARIOS.map(s => (
          <button key={s.id}
            className={`cor-scenario-card ${selScenario === s.id ? 'selected' : ''}`}
            style={{ '--sc': s.color }}
            onClick={() => handleScenario(s.id)}>
            <div className="cor-sc-icon">{s.icon}</div>
            <div className="cor-sc-name">{s.name}</div>
          </button>
        ))}
      </div>

      {scenario && (
        <div className="cor-layout">
          {/* Left: Rule + Timeline */}
          <div className="cor-left">
            {/* Correlation Rule */}
            <div className="card cor-rule-card">
              <div className="card-title">Active Correlation Rule</div>
              <div className="cor-rule-name">{scenario.rule.name}</div>
              <div className="cor-rule-cond">{scenario.rule.condition}</div>
              <div className="cor-rule-sev">
                Severity: <span className={`al-sev-badge sev-${scenario.rule.severity.toLowerCase()}`}>{scenario.rule.severity}</span>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="cor-sim-controls">
              <button className="btn btn-primary" onClick={runSim} disabled={simState === 'running'}>
                {simState === 'running' ? '⟳ Simulating…' : '▶ Run Simulation'}
              </button>
              {simState !== 'idle' && <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>}
            </div>

            {/* Event Timeline */}
            <div className="step-label">② Event timeline</div>
            <div className="cor-timeline">
              {visibleEvents.length === 0 && simState === 'idle' && (
                <div className="cor-timeline-empty">Events will appear here during simulation</div>
              )}
              {visibleEvents.map((ev, i) => (
                <div key={ev.id} className={`cor-event ${ev.match ? 'ev-match' : ''} ${ev.key ? 'ev-key' : ''} row-anim`}>
                  <div className="cor-ev-time">{ev.time}</div>
                  <div className="cor-ev-node">
                    <div className={`cor-ev-dot ${ev.key ? 'dot-key' : ev.match ? 'dot-match' : 'dot-normal'}`} />
                    {i < visibleEvents.length - 1 && <div className="cor-ev-line" />}
                  </div>
                  <div className="cor-ev-body">
                    <div className="cor-ev-type" style={{ color: TYPE_COLOR[ev.type] || '#aaa' }}>{ev.type.replace(/_/g, ' ')}</div>
                    <div className="cor-ev-desc">{ev.desc}</div>
                    <div className="cor-ev-src">{ev.src} → {ev.dst}</div>
                  </div>
                  {ev.match && !ev.key && <div className="cor-ev-match-badge">MATCH</div>}
                  {ev.key && <div className="cor-ev-key-badge">🔴 RULE FIRED</div>}
                </div>
              ))}
              <div ref={evEndRef} />
            </div>
          </div>

          {/* Right: Incident */}
          <div className="cor-right">
            <div className="card cor-engine-card">
              <div className="card-title">Correlation Engine Status</div>
              <div className={`cor-engine-status ${simState === 'running' ? 'status-running' : simState === 'done' && incident ? 'status-fired' : 'status-idle'}`}>
                <div className="cor-engine-dot" />
                <span>
                  {simState === 'idle'    ? 'Waiting for simulation'
                  : simState === 'running' ? 'Evaluating events in real-time…'
                  : incident              ? 'Rule FIRED — Incident created'
                  : 'Simulation complete'}
                </span>
              </div>
              <div className="cor-match-progress">
                <div className="cor-match-label">Pattern matches</div>
                <div className="cor-match-bar">
                  <div className="cor-match-fill"
                    style={{ width: `${Math.min(100, (visibleEvents.filter(e => e.match).length / scenario.events.filter(e => e.match).length) * 100)}%` }} />
                </div>
                <div className="cor-match-count">
                  {visibleEvents.filter(e => e.match).length} / {scenario.events.filter(e => e.match).length} matching events
                </div>
              </div>
            </div>

            {incident && (
              <div className="cor-incident-panel fade-in">
                <div className="cor-incident-header">
                  <div className="cor-incident-icon">🚨</div>
                  <div>
                    <div className="cor-incident-label">SECURITY INCIDENT</div>
                    <div className="cor-incident-title">{incident.title}</div>
                  </div>
                </div>
                <div className={`al-sev-badge sev-${incident.severity.toLowerCase()}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>
                  {incident.severity}
                </div>
                <div className="cor-incident-details">
                  {[
                    ['Source', incident.srcIp],
                    ['Target', incident.dstDevice],
                    ['Actor', incident.attacker],
                    ['Affected', incident.target],
                    ['Timeline', incident.timeline],
                  ].map(([k, v]) => (
                    <div key={k} className="cor-inc-row">
                      <span className="cor-inc-key">{k}</span>
                      <span className="cor-inc-val">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="cor-recommendation">
                  <div className="cor-rec-label">⚡ Recommended Action</div>
                  <div className="cor-rec-text">{incident.recommendation}</div>
                </div>
              </div>
            )}

            {!incident && simState !== 'idle' && (
              <div className="card cor-waiting">
                <div className="cor-waiting-dots">
                  <span /><span /><span />
                </div>
                <div className="cor-waiting-text">Monitoring event pattern…</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Correlation;
