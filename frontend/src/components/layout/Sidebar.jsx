import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, UserCircle, TrendingUp,
  BarChart3, Plug, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Overview' },
  { to: '/leads',                  icon: Users,           label: 'Leads' },
  { to: '/accounts',               icon: Building2,       label: 'Accounts' },
  { to: '/contacts',               icon: UserCircle,      label: 'Contacts' },
  { to: '/opportunities',          icon: TrendingUp,      label: 'Opportunities' },
  { to: '/analytics',              icon: BarChart3,       label: 'Analytics' },
  { to: '/salesforce-integration', icon: Plug,            label: 'Salesforce' },
  { to: '/settings',               icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-full flex flex-col overflow-hidden shrink-0"
      style={{
        background: 'linear-gradient(180deg, #032D60 0%, #01244f 100%)',
        boxShadow: '2px 0 16px rgba(3,45,96,0.18)'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 overflow-hidden min-h-[72px]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #0176D3, #1B96FF)', boxShadow: '0 2px 8px rgba(1,118,211,0.4)' }}
        >
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden min-w-0"
            >
              <span className="text-white font-bold text-lg leading-none tracking-tight block">
                LeadFlow
              </span>
              <span className="text-blue-300/80 text-xs font-medium block mt-0.5">
                CRM Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/12 text-white'
                    : 'text-blue-100/55 hover:bg-white/7 hover:text-blue-50'
                }`}
              >
                {/* Active left-bar indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
                    style={{ background: '#1B96FF' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon size={19} className="shrink-0" />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-14 z-50 pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                    </div>
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center p-2 rounded-xl text-blue-100/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </motion.aside>
  );
}
