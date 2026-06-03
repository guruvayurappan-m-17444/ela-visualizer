import { useState, useEffect, useRef } from 'react';
import './Alerting.css';

const EVENT_TYPES = [
  { id: 'failed-login',  label: 'Failed Login Attempt',       icon: '🔐' },
  { id: 'priv-esc',      label: 'Privilege Escalation',       icon: '⬆️' },
  { id: 'file-delete',   label: 'Critical File Deletion',     icon: '🗑️' },
  { id: 'large-transfer',label: 'Large Data Transfer',        icon: '📤' },
];

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const NOTIFICATION_CHANNELS = [
  { id: 'email', icon: '📧', label: 'Email' },
  { id: 'sms',   icon: '📱', label: 'SMS' },
  { id: 'ticket',icon: '🎫', label: 'ServiceDesk Ticket' },
  { id: 'slack', icon: '💬', label: 'Slack / Teams' },
];

function buildLogStream(eventTypeId) {
  const normal = [
    { time: '10:00:01', type: 'INFO',  src: 'WINDC01',  msg: 'Successful login: jdoe from 192.168.1.50',              match: false },
    { time: '10:00:05', type: 'INFO',  src: 'LNXWEB01', msg: 'SSH session opened for user deploy',                    match: false },
    { time: '10:00:09', type: 'INFO',  src: 'WKSTN-22',  msg: 'User alice logged on interactively',                   match: false },
    { time: '10:00:15', type: 'INFO',  src: 'WINDC01',  msg: 'Group policy applied to CORP\\jdoe',                    match: false },
    { time: '10:00:22', type: 'INFO',  src: 'APP-SRV',  msg: 'Application started: nginx v1.24',                     match: false },
    { time: '10:01:40', type: 'INFO',  src: 'WINDB01',  msg: 'SQL Server backup completed successfully',              match: false },
    { time: '10:01:58', type: 'INFO',  src: 'WKSTN-05', msg: 'USB device connected: Kingston DataTraveler',          match: false },
  ];
  const bad = {
    'failed-login':   [
      { time: '10:00:31', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Failed login: unknown from 10.10.0.99', match: true },
      { time: '10:00:37', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Failed login: unknown from 10.10.0.99', match: true },
      { time: '10:00:44', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Failed login: unknown from 10.10.0.99', match: true },
      { time: '10:00:50', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Failed login: unknown from 10.10.0.99', match: true },
      { time: '10:00:56', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Failed login: unknown from 10.10.0.99', match: true },
    ],
    'priv-esc': [
      { time: '10:00:31', type: 'WARN', src: 'LNXSRV01', msg: 'ALERT MATCH — sudo su: jdoe -> root (NOPASSWD)',      match: true },
      { time: '10:00:40', type: 'WARN', src: 'WINDC01',  msg: 'ALERT MATCH — Token elevated to SYSTEM by pid 4420', match: true },
      { time: '10:00:52', type: 'WARN', src: 'LNXSRV01', msg: 'ALERT MATCH — /etc/sudoers modified by root',        match: true },
    ],
    'file-delete': [
      { time: '10:00:31', type: 'WARN', src: 'FILESVR01', msg: 'ALERT MATCH — Deleted: C:\\Finance\\budget2024.xlsx', match: true },
      { time: '10:00:38', type: 'WARN', src: 'FILESVR01', msg: 'ALERT MATCH — Deleted: C:\\Finance\\payroll_q4.csv', match: true },
      { time: '10:00:45', type: 'WARN', src: 'FILESVR01', msg: 'ALERT MATCH — Deleted: D:\\Backup\\config.bak',      match: true },
    ],
    'large-transfer': [
      { time: '10:00:31', type: 'WARN', src: 'FW01',      msg: 'ALERT MATCH — 512 MB transferred to 185.23.44.101', match: true },
      { time: '10:00:50', type: 'WARN', src: 'FW01',      msg: 'ALERT MATCH — 1.2 GB transferred to 185.23.44.101', match: true },
    ],
  };
  const badEvents = bad[eventTypeId] || bad['failed-login'];
  const stream = [];
  let bi = 0;
  for (let i = 0; i < normal.length + badEvents.length; i++) {
    if (i === 2 || i === 5 || i === 7) {
      if (bi < badEvents.length) { stream.push(badEvents[bi++]); continue; }
    }
    stream.push(normal[i - bi] || normal[normal.length - 1]);
  }
  while (bi < badEvents.length) stream.push(badEvents[bi++]);
  return stream;
}

function Alerting() {
  const [rule, setRule] = useState({ eventType: 'failed-login', severity: 'High', threshold: 3, window: 5, channels: ['email'] });
  const [simState, setSimState] = useState('idle'); // idle | running | triggered | done
  const [logStream, setLogStream] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const streamRef = useRef([]);
  const timerRef  = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logStream]);

  const toggleChannel = (ch) => {
    setRule(r => ({
      ...r,
      channels: r.channels.includes(ch) ? r.channels.filter(c => c !== ch) : [...r.channels, ch],
    }));
  };

  const runSim = () => {
    if (simState === 'running') return;
    setLogStream([]);
    setMatchCount(0);
    setAlerts([]);
    setSimState('running');
    streamRef.current = buildLogStream(rule.eventType);
    let idx = 0;
    let matches = 0;
    let triggered = false;

    timerRef.current = setInterval(() => {
      if (idx >= streamRef.current.length) {
        clearInterval(timerRef.current);
        setSimState(triggered ? 'done' : 'done');
        return;
      }
      const ev = streamRef.current[idx++];
      setLogStream(prev => [...prev, ev]);
      if (ev.match) {
        matches++;
        setMatchCount(matches);
        if (!triggered && matches >= rule.threshold) {
          triggered = true;
          setSimState('triggered');
          const et = EVENT_TYPES.find(e => e.id === rule.eventType);
          setAlerts(prev => [...prev, {
            id: Date.now(),
            severity: rule.severity,
            title: et?.label || 'Alert',
            source: ev.src,
            time: ev.time,
            matches,
            channels: rule.channels,
          }]);
        }
      }
    }, 380);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setSimState('idle');
    setLogStream([]);
    setMatchCount(0);
    setAlerts([]);
  };

  const et = EVENT_TYPES.find(e => e.id === rule.eventType);

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">🔔</span> Real-time Alerting</div>
        <div className="feature-desc">
          ELA's alert engine evaluates every incoming log against your rules in real-time.
          Configure an alert rule below, then run the simulation to see it fire.
        </div>
      </div>

      <div className="al-layout">
        {/* Rule Builder */}
        <div className="al-panel">
          <div className="card">
            <div className="card-title">Alert Rule Builder</div>

            <div className="al-field">
              <label className="al-label">Event Type</label>
              <select className="al-select" value={rule.eventType}
                onChange={e => setRule(r => ({ ...r, eventType: e.target.value }))} disabled={simState === 'running'}>
                {EVENT_TYPES.map(et => <option key={et.id} value={et.id}>{et.icon} {et.label}</option>)}
              </select>
            </div>

            <div className="al-field">
              <label className="al-label">Severity</label>
              <div className="al-severity-row">
                {SEVERITIES.map(s => (
                  <button key={s} className={`al-sev-btn sev-${s.toLowerCase()} ${rule.severity === s ? 'active' : ''}`}
                    onClick={() => setRule(r => ({ ...r, severity: s }))} disabled={simState === 'running'}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="al-field-row">
              <div className="al-field">
                <label className="al-label">Threshold (# events)</label>
                <input className="al-input" type="number" min={1} max={10} value={rule.threshold}
                  onChange={e => setRule(r => ({ ...r, threshold: Number(e.target.value) }))} disabled={simState === 'running'} />
              </div>
              <div className="al-field">
                <label className="al-label">Time Window (min)</label>
                <input className="al-input" type="number" min={1} max={60} value={rule.window}
                  onChange={e => setRule(r => ({ ...r, window: Number(e.target.value) }))} disabled={simState === 'running'} />
              </div>
            </div>

            <div className="al-field">
              <label className="al-label">Notification Channels</label>
              <div className="al-channels">
                {NOTIFICATION_CHANNELS.map(ch => (
                  <button key={ch.id}
                    className={`al-channel-btn ${rule.channels.includes(ch.id) ? 'selected' : ''}`}
                    onClick={() => toggleChannel(ch.id)} disabled={simState === 'running'}>
                    {ch.icon} {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="al-rule-summary">
              <span className="al-rule-text">
                Fire a <strong className={`sev-text-${rule.severity.toLowerCase()}`}>{rule.severity}</strong> alert
                when <strong>{et?.label}</strong> occurs <strong>{rule.threshold}+</strong> times
                within <strong>{rule.window} min</strong>
              </span>
            </div>

            <div className="al-buttons">
              <button className="btn btn-primary" onClick={runSim} disabled={simState === 'running'}>
                {simState === 'running' ? '⟳ Simulating…' : '▶ Run Simulation'}
              </button>
              {simState !== 'idle' && (
                <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>
              )}
            </div>
          </div>

          {/* Triggered Alerts */}
          {alerts.length > 0 && (
            <div className="al-alerts-panel fade-in">
              <div className="card-title">⚡ Triggered Alerts</div>
              {alerts.map(a => (
                <div key={a.id} className={`al-alert-card sev-card-${a.severity.toLowerCase()}`}>
                  <div className="al-alert-top">
                    <span className={`al-sev-badge sev-${a.severity.toLowerCase()}`}>{a.severity}</span>
                    <span className="al-alert-time">{a.time}</span>
                  </div>
                  <div className="al-alert-title">{et?.icon} {a.title}</div>
                  <div className="al-alert-detail">Source: <strong>{a.source}</strong> · Matches: <strong>{a.matches}</strong></div>
                  <div className="al-notified">
                    Notified via: {a.channels.map(c => {
                      const ch = NOTIFICATION_CHANNELS.find(x => x.id === c);
                      return <span key={c} className="al-notif-chip">{ch?.icon} {ch?.label}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Stream */}
        <div className="al-panel al-stream-panel">
          <div className="card al-stream-card">
            <div className="al-stream-header">
              <div className="card-title">Live Log Stream</div>
              {simState === 'running' && <span className="al-live-dot">● LIVE</span>}
              {matchCount > 0 && (
                <span className="al-match-count">
                  Matches: <strong>{matchCount}</strong> / {rule.threshold}
                </span>
              )}
            </div>
            <div className="al-stream-body">
              {logStream.length === 0 && simState === 'idle' && (
                <div className="al-stream-empty">Click "Run Simulation" to start the log stream</div>
              )}
              {logStream.map((ev, i) => (
                <div key={i} className={`al-stream-row ${ev.match ? 'match-row row-anim' : 'normal-row row-anim'}`}>
                  <span className="al-ev-time">{ev.time}</span>
                  <span className={`al-ev-type al-type-${ev.type.toLowerCase()}`}>{ev.type}</span>
                  <span className="al-ev-src">{ev.src}</span>
                  <span className="al-ev-msg">{ev.msg}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerting;
