import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderInput,
  FileSearch,
  Bell,
  BarChart3,
  ShieldCheck,
  GitBranch,
  Activity,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    path: '/log-collection',
    title: 'Log Collection',
    description: 'Understand how ELA collects logs from diverse sources including Windows, Linux, network devices, and applications using agent-based and agentless methods.',
    icon: FolderInput,
    color: 'from-blue-500 to-cyan-500',
    stats: '700+ Log Sources',
  },
  {
    path: '/log-parsing',
    title: 'Log Parsing',
    description: 'Explore how raw logs are parsed, normalized, and indexed for fast searching and analysis using custom and built-in parsing rules.',
    icon: FileSearch,
    color: 'from-violet-500 to-purple-500',
    stats: 'Real-time Processing',
  },
  {
    path: '/alerting',
    title: 'Alerting',
    description: 'Learn how alert profiles and correlation-based alerts detect security threats and operational issues with real-time notifications.',
    icon: Bell,
    color: 'from-amber-500 to-orange-500',
    stats: '1000+ Alert Rules',
  },
  {
    path: '/reporting',
    title: 'Reporting',
    description: 'Discover predefined and custom reports for security audits, operational monitoring, and executive summaries with scheduling capabilities.',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-500',
    stats: '1000+ Reports',
  },
  {
    path: '/compliance',
    title: 'Compliance',
    description: 'See how ELA helps meet regulatory requirements like PCI DSS, HIPAA, SOX, GDPR, FISMA, and ISO 27001 with out-of-the-box compliance reports.',
    icon: ShieldCheck,
    color: 'from-rose-500 to-pink-500',
    stats: '6+ Standards',
  },
  {
    path: '/correlation',
    title: 'Correlation',
    description: 'Understand event correlation engine that links related events across multiple sources to detect complex attack patterns and threats.',
    icon: GitBranch,
    color: 'from-teal-500 to-cyan-500',
    stats: 'Real-time Engine',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <Activity className="w-10 h-10 text-primary-400" />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              EventLog Analyzer
            </h1>
            <p className="text-primary-400 text-sm font-medium">Interactive Training Visualizer</p>
          </div>
        </div>
        <p className="text-slate-400 mt-4 max-w-2xl text-sm leading-relaxed">
          Welcome to the ManageEngine EventLog Analyzer training platform. Explore each module
          to understand how ELA collects, parses, analyzes, and reports on log data from across
          your IT infrastructure. Click any module below to start learning.
        </p>

        {/* Architecture overview */}
        <div className="mt-6 bg-slate-800/40 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">How EventLog Analyzer Works</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['Log Sources', 'Collection', 'Parsing & Normalization', 'Indexing', 'Analysis & Correlation', 'Alerts & Reports'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-primary-600/20 text-primary-300 rounded-lg border border-primary-500/30 font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500" />}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div key={feature.path} variants={item}>
              <Link
                to={feature.path}
                className="block h-full bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                    {feature.stats}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-primary-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Module <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
