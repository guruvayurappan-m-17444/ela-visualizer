import { motion } from 'framer-motion'

export default function PageHeader({ title, description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-8 h-8 text-primary-400" />}
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
      </div>
      {description && (
        <p className="text-slate-400 text-sm lg:text-base ml-11">{description}</p>
      )}
    </motion.div>
  )
}
