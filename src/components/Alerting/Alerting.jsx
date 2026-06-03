import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, Mail, MessageSquare, Zap, CheckCircle, XCircle, Info } from 'lucide-react'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'

const alertProfiles = [
  {
    id: 'brute-force',
    name: 'Brute Force Attack Detection',
    severity: 'Critical',
    severityColor: 'text-red-400 bg-red-500/20',
    description: 'Detects multiple failed login attempts from a single source within a short time window.',
    conditions: [
      { field: 'Event Type', operator: 'equals', value: 'Logon Failure' },
      { field: 'Count', operator: 'greater than', value: '5' },
      { field: 'Time Window', operator: 'within', value: '5 minutes' },
      { field: 'Group By', operator: 'source', value: 'Source IP' },
    ],
    notifications: ['Email to SOC Team', 'SMS to Security Lead', 'SIEM Integration'],
    sampleEvents: [
      { time: '10:23:01', event: 'Logon Failure', user: 'admin', source: '203.0.113.50', status: 'fail' },
      { time: '10:23:15', event: 'Logon Failure', user: 'administrator', source: '203.0.113.50', status: 'fail' },
      { time: '10:23:28', event: 'Logon Failure', user: 'root', source: '203.0.113.50', status: 'fail' },
      { time: '10:23:42', event: 'Logon Failure', user: 'admin', source: '203.0.113.50', status: 'fail' },
      { time: '10:23:55', event: 'Logon Failure', user: 'sysadmin', source: '203.0.113.50', status: 'fail' },
      { time: '10:24:02', event: 'Logon Failure', user: 'admin', source: '203.0.113.50', status: 'fail' },
    ],
  },
  {
    id: 'privilege-escalation',
    name: 'Privilege Escalation Alert',
    severity: 'High',
    severityColor: 'text-orange-400 bg-orange-500/20',
    description: 'Alerts when a user account is added to a privileged group (Domain Admins, Administrators).',
    conditions: [
      { field: 'Event Type', operator: 'equals', value: 'Group Membership Change' },
      { field: 'Target Group', operator: 'contains', value: 'Admins' },
      { field: 'Action', operator: 'equals', value: 'Member Added' },
    ],
    notifications: ['Email to IT Admin', 'Ticket in ServiceDesk Plus'],
    sampleEvents: [
      { time: '14:05:33', event: 'Group Change', user: 'DOMAIN\\it-support', source: 'DC-01', status: 'warn' },
      { time: '14:05:33', event: 'Member Added to Domain Admins', user: 'DOMAIN\\new-user', source: 'DC-01', status: 'fail' },
    ],
  },
  {
    id: 'service-stop',
    name: 'Critical Service Stopped',
    severity: 'Medium',
    severityColor: 'text-yellow-400 bg-yellow-500/20',
    description: 'Alerts when critical Windows services are stopped unexpectedly.',
    conditions: [
      { field: 'Event Type', operator: 'equals', value: 'Service State Change' },
      { field: 'Service Name', operator: 'in list', value: 'Critical Services List' },
      { field: 'New State', operator: 'equals', value: 'Stopped' },
    ],
    notifications: ['Email to Ops Team', 'Webhook to Slack'],
    sampleEvents: [
      { time: '03:45:12', event: 'Service Stopped', user: 'SYSTEM', source: 'APP-SERVER-01', status: 'warn' },
      { time: '03:45:12', event: 'Windows Firewall Service Stopped', user: 'SYSTEM', source: 'APP-SERVER-01', status: 'fail' },
    ],
  },
  {
    id: 'data-exfil',
    name: 'Unusual Data Transfer',
    severity: 'Critical',
    severityColor: 'text-red-400 bg-red-500/20',
    description: 'Detects unusually large file transfers or data movement outside normal business hours.',
    conditions: [
      { field: 'Event Type', operator: 'equals', value: 'File Access' },
      { field: 'Data Volume', operator: 'greater than', value: '500 MB' },
      { field: 'Time', operator: 'outside', value: 'Business Hours (9AM-6PM)' },
      { field: 'Destination', operator: 'not in', value: 'Trusted Networks' },
    ],
    notifications: ['Email to CISO', 'SMS Alert', 'Automated Ticket'],
    sampleEvents: [
      { time: '02:15:33', event: 'File Copy', user: 'DOMAIN\\contractor01', source: 'FILE-SERVER', status: 'warn' },
      { time: '02:15:33', event: 'Large Transfer: 2.3GB to external IP', user: 'DOMAIN\\contractor01', source: '198.51.100.10', status: 'fail' },
    ],
  },
]

const getStatusIcon = (status) => {
  if (status === 'fail') return <XCircle className="w-3.5 h-3.5 text-red-400" />
  if (status === 'warn') return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
  return <Info className="w-3.5 h-3.5 text-blue-400" />
}

export default function Alerting() {
  const [selectedAlert, setSelectedAlert] = useState(alertProfiles[0])
  const [isTriggering, setIsTriggering] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(-1)
  const [alertTriggered, setAlertTriggered] = useState(false)

  const triggerSimulation = () => {
    setIsTriggering(true)
    setCurrentEvent(0)
    setAlertTriggered(false)

    const interval = setInterval(() => {
      setCurrentEvent((prev) => {
        if (prev >= selectedAlert.sampleEvents.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setAlertTriggered(true)
            setIsTriggering(false)
          }, 800)
          return prev
        }
        return prev + 1
      })
    }, 800)
  }

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Alerting"
        description="Explore how ELA detects threats and anomalies with configurable alert profiles and real-time notifications."
      />

      {/* Alert Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {alertProfiles.map((alert) => (
          <button
            key={alert.id}
            onClick={() => {
              setSelectedAlert(alert)
              setCurrentEvent(-1)
              setAlertTriggered(false)
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedAlert.id === alert.id
                ? 'bg-primary-600/20 border-primary-500/50'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Bell className={`w-5 h-5 ${selectedAlert.id === alert.id ? 'text-primary-400' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${alert.severityColor}`}>
                {alert.severity}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-200 leading-tight">{alert.name}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Alert Configuration */}
        <div className="space-y-4">
          <InfoCard title="Alert Conditions" icon={Zap}>
            <p className="text-xs text-slate-400 mb-4">{selectedAlert.description}</p>
            <div className="space-y-2">
              {selectedAlert.conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2.5">
                  <span className="text-xs font-medium text-primary-300 min-w-[100px]">{cond.field}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{cond.operator}</span>
                  <span className="text-xs text-amber-300 font-mono">{cond.value}</span>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Notification Channels" icon={Mail}>
            <div className="space-y-2">
              {selectedAlert.notifications.map((notif, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-primary-400" />
                  {notif}
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        {/* Right: Simulation */}
        <div className="space-y-4">
          <InfoCard title="Event Stream Simulation" icon={AlertTriangle}>
            <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
              {selectedAlert.sampleEvents.map((evt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: currentEvent >= i ? 1 : 0.3,
                    scale: currentEvent === i ? 1.02 : 1,
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                    currentEvent === i
                      ? 'bg-primary-500/20 border border-primary-500/40'
                      : currentEvent > i
                      ? 'bg-slate-800/80 border border-slate-700'
                      : 'bg-slate-900/30 border border-transparent'
                  }`}
                >
                  {getStatusIcon(evt.status)}
                  <span className="text-slate-500 font-mono">{evt.time}</span>
                  <span className="text-slate-300 flex-1 truncate">{evt.event}</span>
                  <span className="text-slate-500">{evt.source}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={triggerSimulation}
              disabled={isTriggering}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                isTriggering
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {isTriggering ? 'Processing Events...' : 'Simulate Alert Trigger'}
            </button>
          </InfoCard>

          <AnimatePresence>
            {alertTriggered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <InfoCard className="border-red-500/50 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                      <Bell className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400">ALERT TRIGGERED!</h4>
                      <p className="text-xs text-slate-400">{selectedAlert.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-[10px] text-slate-500 uppercase">Severity</div>
                      <div className={`text-sm font-semibold ${selectedAlert.severityColor.split(' ')[0]}`}>
                        {selectedAlert.severity}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-[10px] text-slate-500 uppercase">Notifications Sent</div>
                      <div className="text-sm font-semibold text-green-400">
                        {selectedAlert.notifications.length}
                      </div>
                    </div>
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
