import { useState } from 'react';
import { Menu, Plus, Search, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';
import DownloadReportButton from '../shared/DownloadReportButton';

const VIEW_CONFIG = {
  dashboard: { title: 'Dashboard', addLabel: 'Add Client' },
  clients: { title: 'Client Management', addLabel: 'Add Client' },
  expenses: { title: 'Expense Tracker', addLabel: 'Add Expense' },
  leads: { title: 'Lead Pipeline', addLabel: 'Add Lead' },
  invoices: { title: 'Invoices', addLabel: 'New Invoice' },
  system: { title: 'System Health', addLabel: 'Add Automation' },
  team: { title: 'Team', addLabel: 'Add Member' },
  agents: { title: 'AI Agents', addLabel: null },
};

export default function Topbar({ onMenuClick, onAddClient, activeView, searchQuery = '', onSearchChange }) {
  const config = VIEW_CONFIG[activeView] || VIEW_CONFIG.dashboard;
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight">
            {config.title}
          </h1>
          <p className="text-xs text-text-muted hidden sm:block">
            Welcome back, Admin
          </p>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-bg border border-border rounded-lg w-56">
          <Search size={15} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="bg-transparent outline-none text-sm text-text placeholder:text-text-muted/50 w-full"
          />
        </div>

        {/* Download Report */}
        <DownloadReportButton />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-text-muted hover:text-text hover:bg-bg-hover rounded-lg transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-danger rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Context-aware Add button */}
        {config.addLabel && (
          <button
            onClick={onAddClient}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{config.addLabel}</span>
          </button>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold ml-1">
          <img src="/aeitron_icon_fb.png" alt="Aeitron Logo" />
        </div>
      </div>
    </header>
  );
}
