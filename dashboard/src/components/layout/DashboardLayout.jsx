import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children, onAddClient, activeView, onNavigate, searchQuery, onSearchChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={onNavigate}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddClient={onAddClient}
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
