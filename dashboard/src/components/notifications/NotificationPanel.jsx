import { useRef, useEffect } from 'react';
import {
  Bell, X, Check, CheckCheck, Trash2,
  AlertTriangle, DollarSign, Clock, UserPlus, FileText,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../utils/constants';

const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.OVERDUE_PAYMENT]: { icon: DollarSign, color: 'text-danger', bg: 'bg-danger/10' },
  [NOTIFICATION_TYPES.MILESTONE_DUE]: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  [NOTIFICATION_TYPES.BUDGET_THRESHOLD]: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  [NOTIFICATION_TYPES.INVOICE_OVERDUE]: { icon: FileText, color: 'text-danger', bg: 'bg-danger/10' },
  [NOTIFICATION_TYPES.NEW_CLIENT]: { icon: UserPlus, color: 'text-success', bg: 'bg-success/10' },
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, dispatch } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-96 bg-bg-card border border-border rounded-xl shadow-modal overflow-hidden animate-fade-in z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-text">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-accent/15 text-accent rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
              className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-bg-hover transition-colors"
              title="Mark all read"
            >
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_ALL' })}
              className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-bg-hover transition-colors"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-bg-hover transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Bell size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs opacity-60 mt-0.5">You're all caught up</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG[NOTIFICATION_TYPES.NEW_CLIENT];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 border-b border-border-light hover:bg-bg-hover transition-colors cursor-pointer ${
                  !notification.read ? 'bg-accent/[0.03]' : ''
                }`}
                onClick={() => dispatch({ type: 'MARK_READ', payload: notification.id })}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium text-text' : 'text-text-secondary'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{notification.message}</p>
                  <p className="text-xs text-text-muted/60 mt-1">{timeAgo(notification.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'DISMISS', payload: notification.id });
                    }}
                    className="p-1 text-text-muted/40 hover:text-danger rounded transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
