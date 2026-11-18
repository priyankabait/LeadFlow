import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, UserCircle, TrendingUp,
  BarChart3, Plug, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/accounts', icon: Building2, label: 'Accounts' },
  { to: '/contacts', icon: UserCircle, label: 'Contacts' },
  { to: '/opportunities', icon: TrendingUp, label: 'Opportunities' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/salesforce-integration', icon: Plug, label: 'Salesforce' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-sf-navy h-full flex flex-col overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 overflow-hidden min-h-[72px]">
        <div className="w-8 h-8 rounded-lg bg-sf-blue flex items-center justify-center shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <span className="text-white font-bold text-lg leading-none tracking-tight">LeadFlow</span>
              <span className="block text-blue-300 text-xs font-medium">CRM Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-blue-100/60 hover:bg-white/5 hover:text-blue-100'
              }`}>
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sf-blue rounded-full"
                  />
                )}
                <Icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-14 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-blue-100/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
