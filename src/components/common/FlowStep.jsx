import { motion } from 'framer-motion'

export default function FlowStep({ step, index, total, isActive, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-primary-600/20 border border-primary-500/50 shadow-lg shadow-primary-500/10'
          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Step number */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
          isActive ? 'bg-primary-500 text-white' : 'bg-slate-700 text-slate-300'
        }`}
      >
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm ${isActive ? 'text-primary-300' : 'text-slate-200'}`}>
          {step.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
      </div>

      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-[2.05rem] top-14 w-0.5 h-4 bg-slate-600" />
      )}
    </motion.div>
  )
}
