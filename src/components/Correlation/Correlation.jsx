import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, Zap, Link2, ArrowRight, CheckCircle, AlertTriangle, Shield,
  Server, Monitor, Globe, Clock,
} from 'lucide-react'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'

const correlationRules = [
  {
    id: 'brute-force-rdp',
    name: 'Brute Force via RDP',
    description: 'Correlates multiple failed RDP logons followed by a successful logon from the same source.',
    severity: 'Critical',
    severityColor: 'text-red-400',
    events: [
      {
        source: 'Windows Security',
        icon: Monitor,
        event: 'Event 4625: Failed Logon (Type 10)',
        detail: 'Multiple failed RDP attempts from 203.0.113.50',
        time: '10:23:01 - 10:23:55',
        color: 'border-red-500/30 bg-red-500/5',
      },
      {
        source: 'Windows Security',
        icon: Monitor,
        event: 'Event 4624: Successful Logon (Type 10)',
        detail: 'RDP logon succeeded from same IP 203.0.113.50',
        time: '10:24:02',
        color: 'border-yellow-500/30 bg-yellow-500/5',
      },
      {
        source: 'Firewall',
        icon: Shield,
        event: 'Connection Built: Inbound RDP',
        detail: 'TCP connection from 203.0.113.50:3389 allowed',
        time: '10:24:01',
        color: 'border-orange-500/30 bg-orange-500/5',
      },
    ],
    result: {
      threat: 'Possible Brute Force Attack via RDP',
      confidence: 95,
      recommendation: 'Block source IP, review compromised account, enable account lockout policy.',
    },
  },
  {
    id: 'lateral-movement',
    name: 'Lateral Movement Detection',
    description: 'Detects when an attacker moves from one compromised host to other hosts within the network.',
    severity: 'Critical',
    severityColor: 'text-red-400',
    events: [
      {
        source: 'Windows Security',
        icon: Monitor,
        event: 'Event 4624: Logon from unusual host',
        detail: 'User admin logged in from WORKSTATION-07 (not usual)',
        time: '14:05:22',
        color: 'border-yellow-500/30 bg-yellow-500/5',
      },
      {
        source: 'Windows Security',
        icon: Server,
        event: 'Event 4648: Explicit credentials used',
        detail: 'RunAs/Network logon to SERVER-DB-01 from WORKSTATION-07',
        time: '14:06:45',
        color: 'border-orange-500/30 bg-orange-500/5',
      },
      {
        source: 'Network IDS',
        icon: Globe,
        event: 'SMB/PSExec traffic detected',
        detail: 'Unusual SMB traffic pattern between hosts',
        time: '14:07:10',
        color: 'border-red-500/30 bg-red-500/5',
      },
    ],
    result: {
      threat: 'Lateral Movement Detected',
      confidence: 88,
      recommendation: 'Isolate affected hosts, revoke compromised credentials, investigate WORKSTATION-07.',
    },
  },
  {
    id: 'data-exfiltration',
    name: 'Data Exfiltration Pattern',
    description: 'Identifies potential data theft by correlating file access, large transfers, and off-hours activity.',
    severity: 'High',
    severityColor: 'text-orange-400',
    events: [
      {
        source: 'File Server',
        icon: Server,
        event: 'Mass file access detected',
        detail: '450 sensitive files accessed by user contractor01 in 15 min',
        time: '02:15:00 - 02:30:00',
        color: 'border-yellow-500/30 bg-yellow-500/5',
      },
      {
        source: 'Network Monitor',
        icon: Globe,
        event: 'Large outbound transfer',
        detail: '2.3GB uploaded to external IP 198.51.100.10',
        time: '02:32:00',
        color: 'border-red-500/30 bg-red-500/5',
      },
      {
        source: 'HR System',
        icon: Monitor,
        event: 'Off-hours access',
        detail: 'Activity outside normal working hours (2 AM)',
        time: '02:15:00',
        color: 'border-orange-500/30 bg-orange-500/5',
      },
    ],
    result: {
      threat: 'Potential Data Exfiltration',
      confidence: 92,
      recommendation: 'Disable user account immediately, investigate transferred data, review DLP policies.',
    },
  },
  {
    id: 'insider-threat',
    name: 'Insider Threat Pattern',
    description: 'Correlates privilege escalation, policy changes, and suspicious admin activities.',
    severity: 'High',
    severityColor: 'text-orange-400',
    events: [
      {
        source: 'Active Directory',
        icon: Server,
        event: 'User added to Domain Admins',
        detail: 'IT-support added new-user to Domain Admins group',
        time: '16:45:00',
        color: 'border-yellow-500/30 bg-yellow-500/5',
      },
      {
        source: 'Group Policy',
        icon: Shield,
        event: 'Audit policy modified',
        detail: 'Audit logon events policy was disabled',
        time: '16:48:00',
        color: 'border-red-500/30 bg-red-500/5',
      },
      {
        source: 'Windows Security',
        icon: Monitor,
        event: 'Security log cleared',
        detail: 'Event log was cleared by the new admin account',
        time: '16:50:00',
        color: 'border-red-500/30 bg-red-500/5',
      },
    ],
    result: {
      threat: 'Insider Threat - Privilege Abuse',
      confidence: 96,
      recommendation: 'Revoke admin privileges, restore audit policies, review all actions by the account.',
    },
  },
]

export default function Correlation() {
  const [selectedRule, setSelectedRule] = useState(correlationRules[0])
  const [isCorrelating, setIsCorrelating] = useState(false)
  const [activeEvent, setActiveEvent] = useState(-1)
  const [showResult, setShowResult] = useState(false)

  const runCorrelation = () => {
    setIsCorrelating(true)
    setActiveEvent(0)
    setShowResult(false)

    const interval = setInterval(() => {
      setActiveEvent((prev) => {
        if (prev >= selectedRule.events.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setShowResult(true)
            setIsCorrelating(false)
          }, 1000)
          return prev
        }
        return prev + 1
      })
    }, 1200)
  }

  return (
    <div>
      <PageHeader
        icon={GitBranch}
        title="Event Correlation"
        description="Understand how ELA's correlation engine links related events across sources to detect complex attack patterns."
      />

      {/* Rule Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {correlationRules.map((rule) => (
          <button
            key={rule.id}
            onClick={() => {
              setSelectedRule(rule)
              setActiveEvent(-1)
              setShowResult(false)
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedRule.id === rule.id
                ? 'bg-primary-600/20 border-primary-500/50'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <GitBranch className={`w-5 h-5 ${selectedRule.id === rule.id ? 'text-primary-400' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${rule.severityColor}`}>{rule.severity}</span>
            </div>
            <h3 className="text-xs font-semibold text-slate-200 leading-tight">{rule.name}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rule Info & Events */}
        <div className="space-y-4">
          <InfoCard title={selectedRule.name} icon={Zap}>
            <p className="text-xs text-slate-400 mb-4">{selectedRule.description}</p>

            <h4 className="text-[10px] text-slate-500 uppercase mb-2 font-medium">Correlated Events</h4>
            <div className="space-y-3">
              {selectedRule.events.map((evt, i) => {
                const Icon = evt.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg border transition-all ${
                      activeEvent === i
                        ? 'border-primary-500/50 bg-primary-500/10 scale-[1.02]'
                        : activeEvent > i
                        ? `${evt.color} border`
                        : 'border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-medium">{evt.source}</span>
                      <span className="text-[10px] text-slate-600 ml-auto font-mono">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {evt.time}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{evt.event}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{evt.detail}</p>

                    {/* Connector */}
                    {i < selectedRule.events.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-2 bg-slate-600" />
                          <Link2 className="w-3 h-3 text-slate-500" />
                          <div className="w-0.5 h-2 bg-slate-600" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <button
              onClick={runCorrelation}
              disabled={isCorrelating}
              className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                isCorrelating
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-500'
              }`}
            >
              {isCorrelating ? 'Correlating Events...' : 'Run Correlation Engine'}
            </button>
          </InfoCard>
        </div>

        {/* Right: Correlation Result */}
        <div className="space-y-4">
          {/* How Correlation Works */}
          <InfoCard title="How Correlation Works" icon={GitBranch}>
            <div className="space-y-3">
              {[
                { step: 'Collect', desc: 'Events from multiple sources are ingested in real-time.' },
                { step: 'Normalize', desc: 'Events are normalized to a common schema for comparison.' },
                { step: 'Match Rules', desc: 'Correlation rules check for specific event patterns and sequences.' },
                { step: 'Time Window', desc: 'Events must occur within a defined time window to correlate.' },
                { step: 'Alert', desc: 'When a pattern matches, a correlated alert is generated.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary-400">{i + 1}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{item.step}: </span>
                    <span className="text-xs text-slate-400">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <InfoCard className="border-red-500/50 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-red-400">CORRELATED THREAT DETECTED</h3>
                      <p className="text-xs text-slate-400">{selectedRule.result.threat}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                      <div className="text-lg font-bold text-red-400">{selectedRule.result.confidence}%</div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedRule.result.confidence}%` }}
                          className="bg-red-500 h-1.5 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-[10px] text-slate-500 uppercase">Events Correlated</div>
                      <div className="text-lg font-bold text-primary-400">{selectedRule.events.length}</div>
                      <div className="text-[10px] text-slate-500 mt-1">from {new Set(selectedRule.events.map(e => e.source)).size} sources</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Recommended Action</div>
                    <p className="text-xs text-slate-300">{selectedRule.result.recommendation}</p>
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
