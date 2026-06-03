import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, Download, FileText, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'
import PageHeader from '../common/PageHeader'
import InfoCard from '../common/InfoCard'

const reportCategories = [
  {
    id: 'security',
    name: 'Security Reports',
    icon: FileText,
    reports: [
      'Failed Logon Attempts',
      'Successful Logon Summary',
      'Account Lockout Report',
      'Privilege Escalation Events',
      'Firewall Denied Connections',
    ],
  },
  {
    id: 'operational',
    name: 'Operational Reports',
    icon: TrendingUp,
    reports: [
      'System Uptime Report',
      'Service Status Changes',
      'Disk Space Monitoring',
      'Application Error Summary',
      'Network Traffic Overview',
    ],
  },
  {
    id: 'user-activity',
    name: 'User Activity Reports',
    icon: BarChart3,
    reports: [
      'User Logon/Logoff Timeline',
      'File Access Audit',
      'USB Device Usage',
      'Print Activity Report',
      'Remote Session Summary',
    ],
  },
]

const sampleBarData = [
  { name: 'Mon', failed: 45, success: 320 },
  { name: 'Tue', failed: 23, success: 280 },
  { name: 'Wed', failed: 67, success: 310 },
  { name: 'Thu', failed: 12, success: 295 },
  { name: 'Fri', failed: 89, success: 340 },
  { name: 'Sat', failed: 5, success: 120 },
  { name: 'Sun', failed: 3, success: 85 },
]

const samplePieData = [
  { name: 'Windows', value: 45, color: '#3b82f6' },
  { name: 'Linux', value: 25, color: '#10b981' },
  { name: 'Network', value: 15, color: '#f59e0b' },
  { name: 'Firewall', value: 10, color: '#ef4444' },
  { name: 'Cloud', value: 5, color: '#8b5cf6' },
]

const sampleLineData = [
  { hour: '00', events: 120, alerts: 2 },
  { hour: '04', events: 85, alerts: 1 },
  { hour: '08', events: 450, alerts: 5 },
  { hour: '12', events: 380, alerts: 3 },
  { hour: '16', events: 520, alerts: 8 },
  { hour: '20', events: 280, alerts: 4 },
]

const sampleAreaData = [
  { day: 'Week 1', logVolume: 12400, processed: 12350 },
  { day: 'Week 2', logVolume: 15600, processed: 15580 },
  { day: 'Week 3', logVolume: 13800, processed: 13790 },
  { day: 'Week 4', logVolume: 18200, processed: 18150 },
]

const scheduleOptions = ['Daily at 6:00 AM', 'Weekly on Monday', 'Monthly on 1st', 'Custom Schedule']
const formatOptions = ['PDF', 'CSV', 'HTML', 'Excel']

export default function Reporting() {
  const [selectedCategory, setSelectedCategory] = useState(reportCategories[0])
  const [selectedReport, setSelectedReport] = useState(reportCategories[0].reports[0])
  const [schedule, setSchedule] = useState(scheduleOptions[0])
  const [format, setFormat] = useState(formatOptions[0])

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Reporting"
        description="Explore ELA's 1000+ predefined reports and custom reporting capabilities with scheduling and export options."
      />

      {/* Report Categories */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {reportCategories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedReport(cat.reports[0])
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory.id === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report List */}
        <div className="space-y-4">
          <InfoCard title="Available Reports" icon={FileText}>
            <div className="space-y-1">
              {selectedCategory.reports.map((report) => (
                <button
                  key={report}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedReport === report
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {report}
                </button>
              ))}
            </div>
          </InfoCard>

          {/* Report Settings */}
          <InfoCard title="Report Settings" icon={Calendar}>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Schedule</label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
                >
                  {scheduleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Export Format</label>
                <div className="flex gap-2">
                  {formatOptions.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        format === fmt
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition-all">
                <Download className="w-3.5 h-3.5" />
                Generate Report ({format})
              </button>
            </div>
          </InfoCard>
        </div>

        {/* Right: Report Visualizations */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            key={selectedReport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <InfoCard title={selectedReport} icon={BarChart3}>
              <p className="text-xs text-slate-400 mb-4">
                Sample visualization for <span className="text-primary-300">{selectedReport}</span> report.
                Data shown is simulated for training purposes.
              </p>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bar Chart */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-slate-400 mb-3">Weekly Event Summary</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sampleBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Bar dataKey="success" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="failed" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-slate-400 mb-3">Log Source Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie
                        data={samplePieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {samplePieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-slate-400 mb-3">Hourly Event Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={sampleLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Area Chart */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-slate-400 mb-3">Log Volume Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={sampleAreaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="logVolume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="processed" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </InfoCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
