import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, FileCheck, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'

const complianceStandards = [
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    description: 'Protects cardholder data by ensuring secure processing, storage, and transmission of credit card information.',
    requirements: [
      {
        id: 'Req 1',
        title: 'Install and maintain a firewall configuration',
        elaSupport: 'Firewall log monitoring, rule change tracking, traffic analysis reports',
        status: 'covered',
      },
      {
        id: 'Req 2',
        title: 'Do not use vendor-supplied defaults',
        elaSupport: 'Configuration change monitoring, default account usage detection',
        status: 'covered',
      },
      {
        id: 'Req 6',
        title: 'Develop and maintain secure systems',
        elaSupport: 'Application log monitoring, vulnerability scan log analysis',
        status: 'covered',
      },
      {
        id: 'Req 8',
        title: 'Identify and authenticate access',
        elaSupport: 'Logon/logoff tracking, failed auth reporting, account lockout monitoring',
        status: 'covered',
      },
      {
        id: 'Req 10',
        title: 'Track and monitor all access to network resources',
        elaSupport: 'Complete audit trail, log integrity monitoring, automated log review',
        status: 'covered',
      },
      {
        id: 'Req 11',
        title: 'Regularly test security systems',
        elaSupport: 'IDS/IPS log analysis, penetration test log review',
        status: 'partial',
      },
    ],
    reports: ['Logon Activity', 'Firewall Traffic', 'Object Access', 'Policy Changes', 'Account Management'],
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    description: 'Protects sensitive patient health information (PHI) from being disclosed without consent.',
    requirements: [
      {
        id: '164.308',
        title: 'Administrative Safeguards - Access Control',
        elaSupport: 'User access monitoring, role-based access reports, unauthorized access detection',
        status: 'covered',
      },
      {
        id: '164.312',
        title: 'Technical Safeguards - Audit Controls',
        elaSupport: 'Complete audit logging, log retention, tamper-proof log storage',
        status: 'covered',
      },
      {
        id: '164.312(b)',
        title: 'Audit Controls - Activity Logs',
        elaSupport: 'PHI access logging, user activity tracking, session monitoring',
        status: 'covered',
      },
      {
        id: '164.312(c)',
        title: 'Integrity Controls',
        elaSupport: 'File integrity monitoring, data modification alerts',
        status: 'covered',
      },
      {
        id: '164.312(e)',
        title: 'Transmission Security',
        elaSupport: 'Network traffic monitoring, encryption compliance reports',
        status: 'partial',
      },
    ],
    reports: ['ePHI Access', 'User Activity', 'System Changes', 'Network Security', 'Incident Reports'],
  },
  {
    id: 'sox',
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    description: 'Ensures accuracy and reliability of corporate disclosures to protect investors from fraudulent accounting.',
    requirements: [
      {
        id: 'Sec 302',
        title: 'Corporate Responsibility for Financial Reports',
        elaSupport: 'Financial system access logs, change monitoring, admin activity tracking',
        status: 'covered',
      },
      {
        id: 'Sec 404',
        title: 'Management Assessment of Internal Controls',
        elaSupport: 'IT control monitoring, access review reports, segregation of duties',
        status: 'covered',
      },
      {
        id: 'Sec 802',
        title: 'Criminal Penalties for Document Alteration',
        elaSupport: 'Log integrity monitoring, tamper detection, secure log archival',
        status: 'covered',
      },
    ],
    reports: ['Privileged User Activity', 'Financial System Access', 'Configuration Changes', 'Audit Trail'],
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    description: 'EU regulation for data protection and privacy, governing the processing of personal data.',
    requirements: [
      {
        id: 'Art 5',
        title: 'Principles of Data Processing',
        elaSupport: 'Data access monitoring, processing activity logs, consent tracking',
        status: 'covered',
      },
      {
        id: 'Art 25',
        title: 'Data Protection by Design',
        elaSupport: 'Security event monitoring, privacy impact tracking',
        status: 'covered',
      },
      {
        id: 'Art 30',
        title: 'Records of Processing Activities',
        elaSupport: 'Automated log collection, data processing audit trail',
        status: 'covered',
      },
      {
        id: 'Art 33',
        title: 'Notification of Data Breach',
        elaSupport: 'Breach detection alerts, incident timeline reconstruction, 72-hour reporting support',
        status: 'covered',
      },
    ],
    reports: ['Personal Data Access', 'Data Breach Detection', 'Processing Activities', 'Cross-border Transfers'],
  },
  {
    id: 'fisma',
    name: 'FISMA',
    fullName: 'Federal Information Security Management Act',
    description: 'US law requiring federal agencies to develop security programs to protect government information.',
    requirements: [
      {
        id: 'AC',
        title: 'Access Control',
        elaSupport: 'User authentication monitoring, access control policy enforcement logs',
        status: 'covered',
      },
      {
        id: 'AU',
        title: 'Audit and Accountability',
        elaSupport: 'Comprehensive audit logging, event correlation, log analysis',
        status: 'covered',
      },
      {
        id: 'IR',
        title: 'Incident Response',
        elaSupport: 'Security incident detection, automated alerting, forensic analysis',
        status: 'covered',
      },
    ],
    reports: ['Access Control Audit', 'Security Events', 'Incident Response', 'Configuration Management'],
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    fullName: 'Information Security Management System',
    description: 'International standard for managing information security with a systematic approach.',
    requirements: [
      {
        id: 'A.9',
        title: 'Access Control',
        elaSupport: 'User access management, authentication monitoring, privilege tracking',
        status: 'covered',
      },
      {
        id: 'A.12',
        title: 'Operations Security',
        elaSupport: 'Malware detection logs, backup monitoring, system log analysis',
        status: 'covered',
      },
      {
        id: 'A.16',
        title: 'Incident Management',
        elaSupport: 'Security event detection, incident tracking, evidence collection',
        status: 'covered',
      },
    ],
    reports: ['Access Management', 'Operations Security', 'Incident Tracking', 'Risk Assessment'],
  },
]

export default function Compliance() {
  const [selectedStandard, setSelectedStandard] = useState(complianceStandards[0])
  const [expandedReq, setExpandedReq] = useState(null)

  const coveredCount = selectedStandard.requirements.filter((r) => r.status === 'covered').length
  const totalCount = selectedStandard.requirements.length
  const coveragePercent = Math.round((coveredCount / totalCount) * 100)

  return (
    <div>
      <PageHeader
        icon={ShieldCheck}
        title="Compliance"
        description="See how ELA helps meet regulatory compliance requirements with out-of-the-box reports and audit trails."
      />

      {/* Standard Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {complianceStandards.map((std) => (
          <button
            key={std.id}
            onClick={() => {
              setSelectedStandard(std)
              setExpandedReq(null)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedStandard.id === std.id
                ? 'bg-primary-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {std.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Standard Info */}
        <div className="space-y-4">
          <InfoCard icon={ShieldCheck} title={selectedStandard.fullName}>
            <p className="text-xs text-slate-400 mb-4">{selectedStandard.description}</p>

            {/* Coverage Meter */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">ELA Coverage</span>
                <span className="text-primary-300 font-bold">{coveragePercent}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${coveragePercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-primary-500 h-2.5 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>{coveredCount} of {totalCount} requirements covered</span>
              </div>
            </div>
          </InfoCard>

          {/* Compliance Reports */}
          <InfoCard title="Predefined Compliance Reports" icon={FileCheck}>
            <div className="space-y-1">
              {selectedStandard.reports.map((report) => (
                <div key={report} className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-slate-300">{report}</span>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        {/* Right: Requirements Detail */}
        <div className="lg:col-span-2">
          <InfoCard title="Requirements & ELA Support" icon={AlertCircle}>
            <div className="space-y-2">
              {selectedStandard.requirements.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        req.status === 'covered' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}
                    >
                      {req.status === 'covered' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">{req.title}</span>
                      </div>
                    </div>
                    {expandedReq === req.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedReq === req.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700"
                      >
                        <div className="p-3">
                          <h5 className="text-[10px] text-slate-500 uppercase mb-1">How ELA Supports This</h5>
                          <p className="text-xs text-slate-300">{req.elaSupport}</p>
                          <div className="mt-2 flex items-center gap-1">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                req.status === 'covered'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {req.status === 'covered' ? 'Fully Covered' : 'Partially Covered'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  )
}
