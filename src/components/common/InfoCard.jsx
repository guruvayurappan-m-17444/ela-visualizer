import { motion } from 'framer-motion'

export default function InfoCard({ title, children, icon: Icon, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/60 border border-slate-700 rounded-xl p-5 ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-5 h-5 text-primary-400" />}
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
        </div>
      )}
      {children}
    </motion.div>
  )
}
