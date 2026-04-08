import { useState } from 'react';
import {
  LayoutDashboard, Receipt, Users, Kanban, FileText, Activity,
  LogOut, X, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, UsersRound, Bot,
  Sun, Moon, Radar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: Receipt, label: 'Expenses', view: 'expenses' },
      { icon: FileText, label: 'Invoices', view: 'invoices' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { icon: Users, label: 'Clients', view: 'clients' },
      { icon: Kanban, label: 'Leads', view: 'leads' },
      { icon: Radar, label: 'Lead Discovery', view: 'discovery' },
    ],
  },
  {
    label: 'Team',
    items: [
      { icon: UsersRound, label: 'Team', view: 'team' },
      { icon: Bot, label: 'Agents', view: 'agents' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Activity, label: 'System Health', view: 'system' },
    ],
  },
];

export default function Sidebar({ open, onClose, activeView, onNavigate }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('aeitron_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [openSections, setOpenSections] = useState({
    Overview: true, Finance: true, Projects: true, Team: true, Operations: true,
  });

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('aeitron_sidebar_collapsed', String(next)); } catch {}
  }

  function toggleSection(label) {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function handleNav(view) {
    onNavigate(view);
    onClose();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-sidebar
          flex flex-col transition-all duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${collapsed ? 'w-16' : 'w-64'}
          ${open ? 'translate-x-0 animate-slide-in' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-16 border-b border-sidebar-border ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/aeitron_icon_fb.png"
                alt="Aeitron Logo"
                className="w-8 h-8 rounded-lg object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              { <div className="w-8 h-8 rounded-lg bg-accent items-center justify-center text-white font-bold text-sm hidden">
              A
              </div> }
              <span className="text-sidebar-text-active font-semibold text-lg tracking-tight">
                Aeitron AI
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-text hover:text-sidebar-text-active transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <div className={`hidden lg:flex px-3 py-2 ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-md text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              isOpen={openSections[group.label]}
              onToggle={() => toggleSection(group.label)}
              collapsed={collapsed}
            >
              {group.items.map((item) => (
                <SidebarLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={activeView === item.view}
                  onClick={() => handleNav(item.view)}
                  collapsed={collapsed}
                />
              ))}
            </SidebarGroup>
          ))}
        </nav>

        {/* Footer */}
        
        <div className={`py-4 border-t border-sidebar-border ${collapsed ? 'px-2' : 'px-3'} space-y-2`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full rounded-lg text-sm font-medium text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full rounded-lg text-sm font-medium text-sidebar-text hover:text-danger hover:bg-white/5 transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
            title="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && (
            <p className="text-xs text-sidebar-text/50 px-3">Aeitron Finance v2.0</p>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarGroup({ label, children, isOpen, onToggle, collapsed }) {
  if (collapsed) {
    return <div className="space-y-1 py-1">{children}</div>;
  }

  return (
    <div className="py-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-text/50 hover:text-sidebar-text/70 transition-colors"
      >
        <span>{label}</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {isOpen && <div className="space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick, collapsed }) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={label}
        className={`
          flex items-center justify-center w-full p-2.5 rounded-lg
          transition-all duration-200 cursor-pointer
          ${active
            ? 'bg-sidebar-active text-sidebar-text-active'
            : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
          }
        `}
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-sidebar-active text-sidebar-text-active'
          : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
