import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileSearch, ArrowRight, CheckCircle, Code, Database, Layers } from 'lucide-react'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'

const sampleRawLogs = [
  {
    id: 'windows',
    name: 'Windows Security Event',
    raw: `An account was successfully logged on.

Subject:
  Security ID: SYSTEM
  Account Name: WORKSTATION$
  Account Domain: DOMAIN
  Logon ID: 0x3e7

Logon Type: 10

New Logon:
  Security ID: DOMAIN\\john.doe
  Account Name: john.doe
  Account Domain: DOMAIN
  Logon ID: 0x1a2b3c4d
  Logon GUID: {f5a2b3c4-1234-5678-9abc-def012345678}

Network Information:
  Workstation Name: WORKSTATION-01
  Source Network Address: 192.168.1.105
  Source Port: 52341`,
    parsed: {
      event_id: 4624,
      event_type: 'Logon Success',
      timestamp: '2024-03-15T10:23:45.000Z',
      source: 'Microsoft-Windows-Security-Auditing',
      category: 'Logon/Logoff',
      user: 'DOMAIN\\john.doe',
      logon_type: 10,
      logon_type_desc: 'Remote Interactive (RDP)',
      workstation: 'WORKSTATION-01',
      source_ip: '192.168.1.105',
      source_port: 52341,
      severity: 'Informational',
      normalized_action: 'USER_LOGON',
    },
  },
  {
    id: 'linux',
    name: 'Linux Syslog',
    raw: `Mar 15 10:25:12 web-server-01 sshd[2847]: Failed password for invalid user root from 203.0.113.50 port 44231 ssh2`,
    parsed: {
      timestamp: '2024-03-15T10:25:12.000Z',
      hostname: 'web-server-01',
      process: 'sshd',
      pid: 2847,
      event_type: 'Authentication Failure',
      user: 'root',
      user_exists: false,
      source_ip: '203.0.113.50',
      source_port: 44231,
      protocol: 'ssh2',
      severity: 'Warning',
      normalized_action: 'USER_LOGON_FAILED',
    },
  },
  {
    id: 'firewall',
    name: 'Cisco ASA Firewall',
    raw: `<166>Mar 15 10:30:22 fw-01 %ASA-6-302013: Built inbound TCP connection 1234567 for outside:203.0.113.50/443 (203.0.113.50/443) to inside:192.168.1.100/52341 (10.0.0.100/52341)`,
    parsed: {
      timestamp: '2024-03-15T10:30:22.000Z',
      hostname: 'fw-01',
      device_type: 'Cisco ASA',
      message_id: '302013',
      severity: 6,
      severity_label: 'Informational',
      action: 'Built',
      direction: 'inbound',
      protocol: 'TCP',
      connection_id: 1234567,
      src_interface: 'outside',
      src_ip: '203.0.113.50',
      src_port: 443,
      dst_interface: 'inside',
      dst_ip: '192.168.1.100',
      dst_port: 52341,
      normalized_action: 'CONNECTION_BUILT',
    },
  },
]

const parsingSteps = [
  {
    title: 'Log Reception',
    description: 'Raw log is received by ELA from the configured source.',
    icon: Database,
  },
  {
    title: 'Format Detection',
    description: 'ELA identifies the log format (Windows Event, Syslog, CEF, LEEF, etc.).',
    icon: FileSearch,
  },
  {
    title: 'Field Extraction',
    description: 'Key fields are extracted using format-specific parsing rules and regex patterns.',
    icon: Code,
  },
  {
    title: 'Normalization',
    description: 'Extracted fields are mapped to a unified schema for consistent querying.',
    icon: Layers,
  },
  {
    title: 'Indexing',
    description: 'Normalized data is indexed for fast search and retrieval.',
    icon: Database,
  },
]

export default function LogParsing() {
  const [selectedLog, setSelectedLog] = useState(sampleRawLogs[0])
  const [parsingStep, setParsingStep] = useState(-1)
  const [isParsing, setIsParsing] = useState(false)
  const [showParsed, setShowParsed] = useState(false)

  const runParsing = () => {
    setIsParsing(true)
    setParsingStep(0)
    setShowParsed(false)

    const interval = setInterval(() => {
      setParsingStep((prev) => {
        if (prev >= parsingSteps.length - 1) {
          clearInterval(interval)
          setIsParsing(false)
          setShowParsed(true)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  return (
    <div>
      <PageHeader
        icon={FileSearch}
        title="Log Parsing"
        description="See how ELA transforms raw, unstructured logs into normalized, searchable data."
      />

      {/* Log type selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {sampleRawLogs.map((log) => (
          <button
            key={log.id}
            onClick={() => {
              setSelectedLog(log)
              setParsingStep(-1)
              setShowParsed(false)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedLog.id === log.id
                ? 'bg-primary-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {log.name}
          </button>
        ))}
      </div>

      {/* Parsing Steps */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {parsingSteps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  parsingStep === i
                    ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50 scale-105'
                    : parsingStep > i
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                }`}
              >
                {parsingStep > i ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {step.title}
              </div>
              {i < parsingSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-600" />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Log */}
        <InfoCard title="Raw Log Input" icon={Code}>
          <pre className="text-xs text-amber-300 font-mono bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
            {selectedLog.raw}
          </pre>
          <button
            onClick={runParsing}
            disabled={isParsing}
            className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              isParsing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-500'
            }`}
          >
            {isParsing ? 'Parsing...' : 'Parse This Log'}
          </button>
        </InfoCard>

        {/* Parsed Output */}
        <InfoCard title="Parsed & Normalized Output" icon={Layers}>
          <AnimatePresence mode="wait">
            {showParsed ? (
              <motion.div
                key="parsed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <pre className="text-xs text-green-400 font-mono bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                  {JSON.stringify(selectedLog.parsed, null, 2)}
                </pre>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Fields Extracted</div>
                    <div className="text-sm font-semibold text-green-400">
                      {Object.keys(selectedLog.parsed).length}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Normalized Action</div>
                    <div className="text-sm font-semibold text-primary-400">
                      {selectedLog.parsed.normalized_action}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="flex items-center justify-center h-64 text-slate-500 text-sm"
              >
                Click "Parse This Log" to see the output
              </motion.div>
            )}
          </AnimatePresence>
        </InfoCard>
      </div>

      {/* Active parsing step detail */}
      <AnimatePresence>
        {parsingStep >= 0 && parsingStep < parsingSteps.length && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <InfoCard className="border-primary-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  {(() => {
                    const Icon = parsingSteps[parsingStep].icon
                    return <Icon className="w-5 h-5 text-primary-400" />
                  })()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary-300">
                    Step {parsingStep + 1}: {parsingSteps[parsingStep].title}
                  </h4>
                  <p className="text-xs text-slate-400">{parsingSteps[parsingStep].description}</p>
                </div>
              </div>
            </InfoCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
