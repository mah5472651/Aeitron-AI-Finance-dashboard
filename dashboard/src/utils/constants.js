export const SERVICE_TYPES = ['AI Agents', 'n8n Workflows', 'Consulting'];

export const ONBOARDING_STATUSES = ['Onboarded', 'In Progress', 'Prospect'];

export const PAYMENT_CATEGORIES = [
  'Fully Paid',
  'Monthly Retainer',
  'Partially Paid 50%',
  'Unpaid',
];

export const EXPENSE_CATEGORIES = [
  'API Costs',
  'Hosting',
  'Salaries',
  'Software',
  'Marketing',
  'Other',
];

export const LEAD_STAGES = [
  'Cold',
  'Warm',
  'Hot',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const BADGE_COLORS = {
  'Onboarded': 'bg-success/15 text-success',
  'In Progress': 'bg-warning/15 text-warning',
  'Prospect': 'bg-info/15 text-info',
  'Fully Paid': 'bg-success/15 text-success',
  'Monthly Retainer': 'bg-retainer/15 text-retainer',
  'Partially Paid 50%': 'bg-warning/15 text-warning',
  'Unpaid': 'bg-danger/15 text-danger',
  'Cold': 'bg-info/15 text-info',
  'Warm': 'bg-warning/15 text-warning',
  'Hot': 'bg-danger/15 text-danger',
  'Proposal Sent': 'bg-retainer/15 text-retainer',
  'Won': 'bg-success/15 text-success',
  'Lost': 'bg-text-muted/15 text-text-muted',
  'Healthy': 'bg-success/15 text-success',
  'Error': 'bg-danger/15 text-danger',
  'Paused': 'bg-warning/15 text-warning',
  'Active': 'bg-success/15 text-success',
  'Away': 'bg-warning/15 text-warning',
};

export const EXPENSE_CATEGORY_COLORS = {
  'API Costs': '#3b82f6',
  'Hosting': '#6c5ce7',
  'Salaries': '#10b981',
  'Software': '#f59e0b',
  'Marketing': '#ef4444',
  'Other': '#8c90a0',
};

export const LEAD_STAGE_COLORS = {
  'Cold': '#3b82f6',
  'Warm': '#f59e0b',
  'Hot': '#ef4444',
  'Proposal Sent': '#8b5cf6',
  'Won': '#10b981',
  'Lost': '#6b7280',
};

export const STORAGE_KEY = 'aeitron_clients';
export const EXPENSE_STORAGE_KEY = 'aeitron_expenses';
export const LEADS_STORAGE_KEY = 'aeitron_leads';
export const NOTIFICATIONS_STORAGE_KEY = 'aeitron_notifications';
export const INVOICES_STORAGE_KEY = 'aeitron_invoices';
export const CLIENT_NOTES_STORAGE_KEY = 'aeitron_client_notes';
export const SYSTEM_HEALTH_STORAGE_KEY = 'aeitron_system_health';
export const API_CREDITS_STORAGE_KEY = 'aeitron_api_credits';

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];

export const INVOICE_STATUS_COLORS = {
  Draft: 'bg-text-muted/15 text-text-muted',
  Sent: 'bg-info/15 text-info',
  Paid: 'bg-success/15 text-success',
  Overdue: 'bg-danger/15 text-danger',
  Cancelled: 'bg-warning/15 text-warning',
};

export const NOTIFICATION_TYPES = {
  OVERDUE_PAYMENT: 'overdue_payment',
  MILESTONE_DUE: 'milestone_due',
  BUDGET_THRESHOLD: 'budget_threshold',
  INVOICE_OVERDUE: 'invoice_overdue',
  NEW_CLIENT: 'new_client',
};

export const LEAD_STAGE_PROBABILITIES = {
  Cold: 0.10,
  Warm: 0.30,
  Hot: 0.60,
  'Proposal Sent': 0.80,
  Won: 1.00,
  Lost: 0.00,
};

export const ROADMAP_STAGES = ['Discovery', 'Strategy', 'Build', 'QA', 'Delivery', 'Maintenance'];

export const TEAM_STORAGE_KEY = 'aeitron_team';
export const TEAM_ROLES = ['Outreach Specialist', 'Developer', 'Designer', 'Project Manager', 'QA Engineer', 'Consultant'];
export const TEAM_STATUSES = ['Active', 'Away'];
export const TEAM_STATUS_COLORS = {
  Active: 'bg-success/15 text-success',
  Away: 'bg-warning/15 text-warning',
};

export const REVENUE_GOAL = 1_000_000;

export const AUTOMATION_STATUSES = ['Healthy', 'Error', 'Paused'];

export const DEFAULT_API_SERVICES = [
  { name: 'OpenAI', balance: 100, limit: 100 },
  { name: 'Anthropic', balance: 100, limit: 100 },
  { name: 'Make.com', balance: 100, limit: 100 },
  { name: 'n8n Cloud', balance: 100, limit: 100 },
];
