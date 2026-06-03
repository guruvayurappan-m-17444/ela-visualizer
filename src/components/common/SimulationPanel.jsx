import { motion } from 'framer-motion'

export default function SimulationPanel({ title, data, isRunning, onRun, children }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {onRun && (
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-500'
            }`}
          >
            {isRunning ? 'Processing...' : 'Run Simulation'}
          </button>
        )}
      </div>
      <div className="p-5">
        {data && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-green-400 font-mono bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto"
          >
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </motion.pre>
        )}
        {children}
      </div>
    </div>
  )
}
