import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderInput,
  FileSearch,
  Bell,
  BarChart3,
  ShieldCheck,
  GitBranch,
  Menu,
  X,
  Activity,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/log-collection', label: 'Log Collection', icon: FolderInput },
  { path: '/log-parsing', label: 'Log Parsing', icon: FileSearch },
  { path: '/alerting', label: 'Alerting', icon: Bell },
  { path: '/reporting', label: 'Reporting', icon: BarChart3 },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/correlation', label: 'Correlation', icon: GitBranch },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-ela-sidebar border-r border-slate-700 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          <Activity className="w-8 h-8 text-primary-500 flex-shrink-0" />
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <h1 className="text-sm font-bold text-white leading-tight">EventLog Analyzer</h1>
              <p className="text-[10px] text-slate-400">Training Visualizer</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border-l-2 border-primary-500'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 flex items-center justify-center border-t border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-ela-dark">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
