import { useState } from 'react';
import './LogParsing.css';

const MAX_LOG_CHARS = 200000;

const LOG_TYPES = [
  {
    id: 'auto',
    label: 'Auto Detect Parser',
    icon: '🤖',
    raw: '',
  },
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
  },
];

const FIELD_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12', '#e67e22', '#1abc9c'];

const makeField = (name, label, value, index) => ({
  name,
  label,
  value,
  color: FIELD_COLORS[index % FIELD_COLORS.length],
});

const extract = (text, regex, group = 1) => {
  const match = text.match(regex);
  return match?.[group]?.trim() || '';
};

const extractBaseName = (pathLike = '') => {
  if (!pathLike) return '';
  const parts = pathLike.split(/[\\/]/);
  return parts[parts.length - 1] || pathLike;
};

const parseWindowsSecurity = (raw) => {
  const fields = [];
  const newLogonSection = extract(raw, /New Logon:[\s\S]*?(?:Network Information:|Logon Type:)/m, 0);

  const values = [
    ['datetime', 'Event Time', extract(raw, /^Date:\s+(.+)$/m)],
    ['event_id', 'Event ID', extract(raw, /^Event ID:\s+(.+)$/m)],
    ['level', 'Level', extract(raw, /^Level:\s+(.+)$/m)],
    ['source_host', 'Source Host', extract(raw, /^Computer:\s+(.+)$/m)],
    ['account_name', 'Account Name', extract(newLogonSection, /^\s*Account Name:\s+(.+)$/m)],
    ['account_domain', 'Domain', extract(newLogonSection, /^\s*Account Domain:\s+(.+)$/m)],
    ['logon_type', 'Logon Type', extract(raw, /^Logon Type:\s+(.+)$/m)],
    ['src_ip', 'Source IP', extract(raw, /^\s*Source IP:\s+(.+)$/m)],
    ['workstation', 'Workstation', extract(raw, /^\s*Workstation Name:\s+(.+)$/m)],
    ['process', 'Process', extractBaseName(extract(raw, /^Process Name:\s+(.+)$/m))],
  ];

  values.forEach(([name, label, value], index) => {
    if (value) fields.push(makeField(name, label, value, index));
  });

  return fields;
};

const parseLinuxSsh = (raw) => {
  const line = raw
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0) || '';

  if (!line) return [];

  const dateMatch = line.match(/^([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+/);
  const hostMatch = line.match(/^[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+(\S+)/);
  const processMatch = line.match(/\s([a-zA-Z0-9_-]+)\[(\d+)\]:/);
  const acceptedMatch = line.match(/(Accepted\s+\w+)\s+for\s+(\S+)\s+from\s+([\d.]+)\s+port\s+(\d+)\s+(\S+)/i);

  const values = [
    ['datetime', 'Event Time', dateMatch?.[1] || ''],
    ['hostname', 'Hostname', hostMatch?.[1] || ''],
    ['process', 'Process', processMatch?.[1] || ''],
    ['pid', 'PID', processMatch?.[2] || ''],
    ['action', 'Action', acceptedMatch?.[1] || extract(line, /(session opened|logged in|failed password)/i, 1)],
    ['username', 'Username', acceptedMatch?.[2] || extract(line, /for\s+(\S+)\s+from/i)],
    ['src_ip', 'Source IP', acceptedMatch?.[3] || extract(line, /from\s+([\d.]+)/i)],
    ['src_port', 'Source Port', acceptedMatch?.[4] || extract(line, /port\s+(\d+)/i)],
    ['protocol', 'Protocol', acceptedMatch?.[5] || extract(line, /(ssh\d+)/i, 1)],
  ];

  return values
    .filter(([, , value]) => value)
    .map(([name, label, value], index) => makeField(name, label, value, index));
};

const parseApacheAccess = (raw) => {
  const line = raw
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0) || '';

  if (!line) return [];

  const match = line.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+([^\s"]+)\s+([^"]+)"\s+(\d{3})\s+(\S+)\s+"([^"]*)"\s+"([^"]*)"/);
  if (!match) return [];

  const values = [
    ['client_ip', 'Client IP', match[1]],
    ['ident', 'Ident', match[2]],
    ['auth_user', 'Auth User', match[3]],
    ['datetime', 'Timestamp', match[4]],
    ['http_method', 'HTTP Method', match[5]],
    ['uri', 'URI', match[6]],
    ['http_version', 'HTTP Version', match[7]],
    ['status_code', 'Status Code', match[8]],
    ['response_size', 'Response Size', match[9]],
    ['user_agent', 'User Agent', match[11]],
  ];

  return values.map(([name, label, value], index) => makeField(name, label, value, index));
};

const parseCiscoAsa = (raw) => {
  const line = raw
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0) || '';

  if (!line) return [];

  const base = line.match(/%ASA-(\d)-([\d]+):\s+(.*)$/);
  if (!base) return [];

  const action = extract(line, /:\s+([A-Za-z]+)\s+/);
  const protocol = extract(line, /\s+(tcp|udp|icmp)\s+/i, 1).toLowerCase();
  const srcData = line.match(/src\s+(\w+):([\d.]+)\/(\d+)/i);
  const dstData = line.match(/dst\s+(\w+):([\d.]+)\/(\d+)/i);

  const values = [
    ['severity', 'Severity Level', base[1]],
    ['message_id', 'Message ID', base[2]],
    ['action', 'Action', action],
    ['protocol', 'Protocol', protocol],
    ['src_interface', 'Src Interface', srcData?.[1] || ''],
    ['src_ip', 'Source IP', srcData?.[2] || ''],
    ['src_port', 'Source Port', srcData?.[3] || ''],
    ['dst_interface', 'Dst Interface', dstData?.[1] || ''],
    ['dst_ip', 'Dest IP', dstData?.[2] || ''],
    ['dst_port', 'Dest Port', dstData?.[3] || ''],
    ['acl_name', 'ACL Name', extract(line, /access-group\s+"([^"]+)"/i)],
  ];

  return values
    .filter(([, , value]) => value)
    .map(([name, label, value], index) => makeField(name, label, value, index));
};

const PARSER_BY_ID = {
  win4624: parseWindowsSecurity,
  'linux-auth': parseLinuxSsh,
  apache: parseApacheAccess,
  cisco: parseCiscoAsa,
};

const detectParserId = (raw) => {
  if (/^Log Name:\s+/m.test(raw) && /^Event ID:\s+/m.test(raw)) return 'win4624';
  if (/^%ASA-\d-\d+:/m.test(raw)) return 'cisco';
  if (/^[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\S+\s+sshd\[\d+\]:/m.test(raw)) return 'linux-auth';
  if (/^\S+\s+\S+\s+\S+\s+\[[^\]]+\]\s+"\S+\s+[^\s"]+\s+HTTP\/\d\.\d"\s+\d{3}\s+\S+/m.test(raw)) return 'apache';
  return null;
};

function LogParsing() {
  const [selType, setSelType]       = useState('auto');
  const [inputMode, setInputMode]   = useState('text');
  const [inputText, setInputText]   = useState('');
  const [fileName, setFileName]     = useState('');
  const [parsedCount, setParsedCount] = useState(0);
  const [isParsing, setIsParsing]   = useState(false);
  const [activeRaw, setActiveRaw]   = useState('');
  const [parsedFields, setParsedFields] = useState([]);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');
  const [activeParserId, setActiveParserId] = useState('');

  const logType = LOG_TYPES.find(l => l.id === selType);

  const handleSelect = (id) => {
    setSelType(id);
    setError('');
    reset();
  };

  const reset = () => {
    setParsedCount(0);
    setDone(false);
    setIsParsing(false);
    setActiveParserId('');
    setParsedFields([]);
    setActiveRaw('');
  };

  const loadSample = () => {
    if (!logType || logType.id === 'auto') {
      setError('Select a parser profile first to load a sample log.');
      return;
    }

    setInputMode('text');
    setInputText(logType.raw);
    setFileName('');
    setActiveRaw('');
    setError('');
    reset();
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    reset();

    const extensionOk = /\.(log|txt|csv|evt)$/i.test(file.name);
    if (!extensionOk) {
      setFileName('');
      setInputText('');
      setError('Unsupported file type. Please upload .log, .txt, .csv, or .evt files.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileName('');
      setInputText('');
      setError('File is too large. Use a file smaller than 2 MB for this tutorial parser.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const trimmed = text.trim();

      if (!trimmed) {
        setFileName('');
        setInputText('');
        setError('The uploaded file is empty. Please upload a file with log lines.');
        return;
      }

      if (text.length > MAX_LOG_CHARS) {
        setFileName('');
        setInputText('');
        setError('The uploaded file has too much content for this demo parser. Keep it under 200,000 characters.');
        return;
      }

      setInputMode('file');
      setFileName(file.name);
      setInputText(text);
    };

    reader.onerror = () => {
      setFileName('');
      setInputText('');
      setError('Could not read the uploaded file. Please try another file.');
    };

    reader.readAsText(file);
  };

  const runParse = () => {
    if (isParsing) return;

    setError('');
    reset();

    const raw = inputText.trim();
    if (!raw) {
      setError('Please provide log data by typing text or uploading a file before parsing.');
      return;
    }

    if (raw.length > MAX_LOG_CHARS) {
      setError('Input is too large for tutorial parsing. Keep it below 200,000 characters.');
      return;
    }

    const resolvedParserId = selType === 'auto' ? detectParserId(raw) : selType;
    if (!resolvedParserId) {
      setError('Parser could not be auto-detected. Select a parser profile manually and retry.');
      return;
    }

    const parser = PARSER_BY_ID[resolvedParserId];
    if (!parser) {
      setError('Selected parser is not available. Please choose another parser profile.');
      return;
    }

    const fields = parser(raw);
    if (!fields.length) {
      setError('Log format does not match the selected parser profile. Check the input and try again.');
      return;
    }

    setActiveRaw(raw);
    setParsedFields(fields);
    setActiveParserId(resolvedParserId);
    setParsedCount(0);
    setIsParsing(true);

    let count = 0;
    const iv = setInterval(() => {
      count++;
      setParsedCount(count);
      if (count >= fields.length) {
        clearInterval(iv);
        setIsParsing(false);
        setDone(true);
      }
    }, 220);
  };

  const activeParser = LOG_TYPES.find((entry) => entry.id === activeParserId);

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div className="feature-title"><span className="icon">🔍</span> Log Parsing</div>
        <div className="feature-desc">
          ELA automatically parses raw log data into structured, searchable fields using
          pre-built parsers for 1000+ formats. Select a log type to see parsing in action.
        </div>
      </div>

      <div className="step-label">① Select parser profile</div>
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

      <div className="step-label">② Provide log input (text or file)</div>
      <div className="lp-input-panel">
        <div className="lp-input-mode-row">
          <button
            className={`btn ${inputMode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setInputMode('text')}
          >
            Text Input
          </button>
          <button
            className={`btn ${inputMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setInputMode('file')}
          >
            File Input
          </button>
          <button className="btn btn-secondary" onClick={loadSample}>Load Sample</button>
          {fileName && <span className="lp-file-name">Loaded file: {fileName}</span>}
        </div>

        {inputMode === 'text' ? (
          <textarea
            className="lp-input-textarea"
            placeholder="Paste one or more raw log lines here..."
            value={inputText}
            onChange={(event) => {
              setInputText(event.target.value);
              setError('');
              reset();
            }}
          />
        ) : (
          <div className="lp-file-picker">
            <input type="file" accept=".log,.txt,.csv,.evt,text/plain" onChange={handleFileInput} />
            <div className="lp-file-help">Supported: .log, .txt, .csv, .evt (max 2 MB)</div>
          </div>
        )}
      </div>

      {error && (
        <div className="lp-error-box" role="alert">
          {error}
        </div>
      )}

      <div className="step-label">③ Parse &amp; extract fields</div>
      <div className="lp-action-bar">
        <button className="btn btn-primary" onClick={runParse} disabled={isParsing}>
          {isParsing ? '⟳ Parsing...' : '▶ Run Parser'}
        </button>
        {(parsedCount > 0 || done) && (
          <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>
        )}
        {done && <span className="lp-done-badge">✓ {parsedFields.length} fields extracted</span>}
        {done && activeParser && (
          <span className="lp-parser-pill">Parser used: {activeParser.label}</span>
        )}
      </div>

      {activeRaw && (
        <>
          <div className="step-label">④ Raw log (as received by ELA)</div>
          <div className="lp-raw-box">
            <div className="lp-raw-header">
              <span className="lp-raw-badge">RAW</span>
              <span className="lp-raw-title">{activeParser?.label || 'Detected log format'}</span>
            </div>
            <pre className="lp-raw-text">{activeRaw}</pre>
          </div>
        </>
      )}

      {parsedCount > 0 && (
        <div className="lp-parsed-grid">
          {parsedFields.slice(0, parsedCount).map((f) => (
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

      {done && (
        <div className="lp-norm-box fade-in">
          <div className="lp-norm-header">
            <span className="lp-raw-badge success-badge">NORMALIZED</span>
            <span className="lp-raw-title">Structured record stored in ELA database</span>
          </div>
          <div className="lp-norm-table">
            {parsedFields.map((f) => (
              <div key={f.name} className="lp-norm-row">
                <span className="lp-norm-key">{f.name}</span>
                <span className="lp-norm-val" style={{ color: f.color }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogParsing;
