import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderInput, Server, Monitor, Globe, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'
import SimulationPanel from '../common/SimulationPanel'

const collectionMethods = [
  {
    id: 'agent',
    title: 'Agent-Based Collection',
    icon: Monitor,
    description: 'A lightweight agent installed on the source device collects logs and forwards them to the ELA server.',
    steps: [
      'Install ELA agent on the target machine',
      'Agent monitors configured log sources (Event Viewer, Syslog files, etc.)',
      'Logs are compressed and encrypted',
      'Agent forwards logs to ELA server over secure channel',
      'ELA server receives, decompresses, and stores logs',
    ],
    sources: ['Windows Event Logs', 'Application Logs', 'IIS/Apache Logs', 'Custom Log Files'],
    sampleLog: `[2024-03-15 10:23:45] Windows Security Event
EventID: 4624
Source: Microsoft-Windows-Security-Auditing
Type: Success Audit
Category: Logon
User: DOMAIN\\john.doe
Workstation: WORKSTATION-01
Logon Type: 10 (Remote Interactive)
Source IP: 192.168.1.105
Status: Success`,
  },
  {
    id: 'agentless',
    title: 'Agentless Collection',
    icon: Globe,
    description: 'ELA connects directly to devices using protocols like WMI, SNMP, or SSH to pull logs remotely.',
    steps: [
      'Configure credentials for remote access (WMI/SSH/SNMP)',
      'ELA server initiates connection to source device',
      'Queries log data using native protocols',
      'Pulls new log entries since last collection',
      'Stores and indexes collected logs',
    ],
    sources: ['Windows via WMI', 'Linux/Unix via SSH', 'Network Devices via SNMP', 'Databases via ODBC'],
    sampleLog: `[2024-03-15 10:25:12] Linux Syslog (SSH Collection)
Host: web-server-01
Facility: auth
Severity: info
Process: sshd[2847]
Message: Accepted publickey for admin from 10.0.0.50 port 52431 ssh2
Key: RSA SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8`,
  },
  {
    id: 'syslog',
    title: 'Syslog Collection',
    icon: Server,
    description: 'ELA acts as a Syslog server, receiving logs sent by devices configured to forward syslog messages.',
    steps: [
      'Configure ELA as a Syslog receiver (UDP/TCP port 514)',
      'Configure source devices to forward syslog to ELA',
      'Devices send syslog messages in real-time',
      'ELA receives and buffers incoming messages',
      'Messages are parsed and stored with source metadata',
    ],
    sources: ['Firewalls (Cisco ASA, Palo Alto)', 'Routers & Switches', 'Linux Servers', 'Network Appliances'],
    sampleLog: `<134>Mar 15 10:30:22 fw-01 %ASA-6-302013: Built inbound TCP connection 1234567
for outside:203.0.113.50/443 (203.0.113.50/443) to inside:192.168.1.100/52341
(10.0.0.100/52341)
Duration: 0:00:00
Bytes: 0
Flags: S`,
  },
  {
    id: 'cloud',
    title: 'Cloud Log Collection',
    icon: Shield,
    description: 'ELA integrates with cloud platforms to collect logs from AWS, Azure, GCP, and SaaS applications.',
    steps: [
      'Configure cloud provider API credentials',
      'Set up log source with provider-specific settings',
      'ELA polls cloud APIs for new log entries',
      'Logs are pulled, normalized, and stored',
      'Cloud-specific fields are mapped to standard schema',
    ],
    sources: ['AWS CloudTrail', 'Azure Activity Logs', 'Google Cloud Audit', 'Office 365 / Microsoft 365'],
    sampleLog: `{
  "eventVersion": "1.08",
  "eventSource": "signin.amazonaws.com",
  "eventName": "ConsoleLogin",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.20",
  "userIdentity": {
    "type": "IAMUser",
    "userName": "admin-user"
  },
  "responseElements": {
    "ConsoleLogin": "Success"
  },
  "eventTime": "2024-03-15T10:32:00Z"
}`,
  },
]

export default function LogCollection() {
  const [selectedMethod, setSelectedMethod] = useState(collectionMethods[0])
  const [activeStep, setActiveStep] = useState(-1)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)

  const runSimulation = () => {
    setIsSimulating(true)
    setActiveStep(0)
    setSimulationComplete(false)

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= selectedMethod.steps.length - 1) {
          clearInterval(interval)
          setIsSimulating(false)
          setSimulationComplete(true)
          return prev
        }
        return prev + 1
      })
    }, 1200)
  }

  return (
    <div>
      <PageHeader
        icon={FolderInput}
        title="Log Collection"
        description="Learn how EventLog Analyzer collects logs from 700+ sources using multiple collection methods."
      />

      {/* Collection Method Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {collectionMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod.id === method.id
          return (
            <button
              key={method.id}
              onClick={() => {
                setSelectedMethod(method)
                setActiveStep(-1)
                setSimulationComplete(false)
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary-600/20 border-primary-500/50 shadow-lg'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-400' : 'text-slate-400'}`} />
              <h3 className={`text-sm font-semibold ${isSelected ? 'text-primary-300' : 'text-slate-200'}`}>
                {method.title}
              </h3>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Flow Steps */}
        <div className="space-y-4">
          <InfoCard title="How It Works" icon={selectedMethod.icon}>
            <p className="text-xs text-slate-400 mb-4">{selectedMethod.description}</p>

            <div className="space-y-2">
              {selectedMethod.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    activeStep === i
                      ? 'bg-primary-500/20 border border-primary-500/40'
                      : activeStep > i
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      activeStep > i
                        ? 'bg-green-500 text-white'
                        : activeStep === i
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {activeStep > i ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs text-slate-300">{step}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                isSimulating
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-500'
              }`}
            >
              {isSimulating ? 'Simulating...' : 'Run Collection Simulation'}
            </button>
          </InfoCard>

          {/* Supported Sources */}
          <InfoCard title="Supported Sources">
            <div className="flex flex-wrap gap-2">
              {selectedMethod.sources.map((src) => (
                <span key={src} className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs">
                  {src}
                </span>
              ))}
            </div>
          </InfoCard>
        </div>

        {/* Right: Sample Output */}
        <div className="space-y-4">
          <SimulationPanel
            title="Sample Collected Log"
            data={selectedMethod.sampleLog}
          />

          <AnimatePresence>
            {simulationComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <InfoCard title="Collection Summary" className="border-green-500/30">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Method', value: selectedMethod.title },
                      { label: 'Status', value: 'Success' },
                      { label: 'Logs Collected', value: '1,247' },
                      { label: 'Processing Time', value: '2.3s' },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-[10px] text-slate-500 uppercase">{item.label}</div>
                        <div className="text-sm font-semibold text-green-400">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
