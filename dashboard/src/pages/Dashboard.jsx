import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCardGrid from '../components/cards/StatCardGrid';
import ClientForm from '../components/clients/ClientForm';
import ClientTable from '../components/clients/ClientTable';
import ClientSummaryCards from '../components/clients/ClientSummaryCards';
import ClientDetailPanel from '../components/clients/ClientDetailPanel';
import RevenueLineChart from '../components/charts/RevenueLineChart';
import PaymentPieChart from '../components/charts/PaymentPieChart';
import ExpenseDonutChart from '../components/charts/ExpenseDonutChart';
import RevenueVsExpensesChart from '../components/charts/RevenueVsExpensesChart';
import ProjectedGrowthChart from '../components/charts/ProjectedGrowthChart';
import BurnRateCard from '../components/cards/BurnRateCard';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseSummaryCards from '../components/expenses/ExpenseSummaryCards';
import LeadBoard from '../components/leads/LeadBoard';
import LeadForm from '../components/leads/LeadForm';
import InvoiceTable from '../components/invoices/InvoiceTable';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceDetail from '../components/invoices/InvoiceDetail';
import AutomationGrid from '../components/system/AutomationGrid';
import AutomationForm from '../components/system/AutomationForm';
import CreditMonitor from '../components/system/CreditMonitor';
import TestEmailButton from '../components/system/TestEmailButton';
import GoalTracker from '../components/cards/GoalTracker';
import TeamGrid from '../components/team/TeamGrid';
import TeamForm from '../components/team/TeamForm';
import AgentGrid from '../components/agents/AgentGrid';
import PayoutCalculator from '../components/team/PayoutCalculator';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import AICopilot from '../components/copilot/AICopilot';
import useNotificationGenerator from '../hooks/useNotificationGenerator';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [automationFormOpen, setAutomationFormOpen] = useState(false);
  const [editAutomation, setEditAutomation] = useState(null);
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-generate notifications based on data changes
  useNotificationGenerator();

  function handleAdd() {
    if (activeView === 'expenses') {
      setEditExpense(null);
      setExpenseFormOpen(true);
    } else if (activeView === 'leads') {
      setEditLead(null);
      setLeadFormOpen(true);
    } else if (activeView === 'invoices') {
      setEditInvoice(null);
      setInvoiceFormOpen(true);
    } else if (activeView === 'system') {
      setEditAutomation(null);
      setAutomationFormOpen(true);
    } else if (activeView === 'team') {
      setEditMember(null);
      setTeamFormOpen(true);
    } else {
      setEditClient(null);
      setFormOpen(true);
    }
  }

  function handleEditMember(member) {
    setEditMember(member);
    setTeamFormOpen(true);
  }

  function handleEditAutomation(automation) {
    setEditAutomation(automation);
    setAutomationFormOpen(true);
  }

  function handleEditClient(client) {
    setEditClient(client);
    setFormOpen(true);
  }

  function handleEditExpense(expense) {
    setEditExpense(expense);
    setExpenseFormOpen(true);
  }

  function handleEditLead(lead) {
    setEditLead(lead);
    setLeadFormOpen(true);
  }

  function handleEditInvoice(invoice) {
    setEditInvoice(invoice);
    setInvoiceFormOpen(true);
  }

  function handleRequestDelete(onConfirm, label) {
    setConfirmDelete({ onConfirm, label });
  }

  return (
    <DashboardLayout
      onAddClient={handleAdd}
      activeView={activeView}
      onNavigate={(view) => { setActiveView(view); setSearchQuery(''); }}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {activeView === 'dashboard' && <DashboardView searchQuery={searchQuery} />}
          {activeView === 'clients' && (
            <ClientsView
              onEdit={handleEditClient}
              onRequestDelete={handleRequestDelete}
              onViewDetail={setDetailClient}
              searchQuery={searchQuery}
            />
          )}
          {activeView === 'expenses' && <ExpensesView onEdit={handleEditExpense} onRequestDelete={handleRequestDelete} searchQuery={searchQuery} />}
          {activeView === 'leads' && <LeadsView onEdit={handleEditLead} onRequestDelete={handleRequestDelete} searchQuery={searchQuery} />}
          {activeView === 'invoices' && (
            <InvoicesView
              onEdit={handleEditInvoice}
              onView={setViewInvoice}
              onRequestDelete={handleRequestDelete}
              searchQuery={searchQuery}
            />
          )}
          {activeView === 'agents' && <AgentsView />}
          {activeView === 'team' && (
            <TeamView
              onEdit={handleEditMember}
              onRequestDelete={handleRequestDelete}
            />
          )}
          {activeView === 'system' && (
            <SystemView
              onEdit={handleEditAutomation}
              onRequestDelete={handleRequestDelete}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <ClientForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditClient(null); }}
        editClient={editClient}
      />
      <ExpenseForm
        isOpen={expenseFormOpen}
        onClose={() => { setExpenseFormOpen(false); setEditExpense(null); }}
        editExpense={editExpense}
      />
      <LeadForm
        isOpen={leadFormOpen}
        onClose={() => { setLeadFormOpen(false); setEditLead(null); }}
        editLead={editLead}
      />
      <InvoiceForm
        isOpen={invoiceFormOpen}
        onClose={() => { setInvoiceFormOpen(false); setEditInvoice(null); }}
        editInvoice={editInvoice}
      />
      <AutomationForm
        isOpen={automationFormOpen}
        onClose={() => { setAutomationFormOpen(false); setEditAutomation(null); }}
        editAutomation={editAutomation}
      />
      <TeamForm
        isOpen={teamFormOpen}
        onClose={() => { setTeamFormOpen(false); setEditMember(null); }}
        editMember={editMember}
      />
      {viewInvoice && (
        <InvoiceDetail
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}
      {detailClient && (
        <ClientDetailPanel
          client={detailClient}
          onClose={() => setDetailClient(null)}
        />
      )}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${confirmDelete?.label}"? This action cannot be undone.`}
        onConfirm={() => {
          if (confirmDelete) {
            confirmDelete.onConfirm();
          }
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
      <AICopilot />
    </DashboardLayout>
  );
}

function DashboardView({ searchQuery }) {
  return (
    <>
      <GoalTracker />
      <StatCardGrid />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BurnRateCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ProjectedGrowthChart />
        <PaymentPieChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueVsExpensesChart />
        <ExpenseDonutChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueLineChart />
      </div>
      <div>
        <h2 className="text-base font-semibold text-text mb-3">Recent Clients</h2>
        <ClientTable globalSearch={searchQuery} />
      </div>
    </>
  );
}

function ClientsView({ onEdit, onRequestDelete, onViewDetail, searchQuery }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">All Clients</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Manage your client portfolio and track payments
        </p>
      </div>
      <ClientSummaryCards />
      <ClientTable onEdit={onEdit} onRequestDelete={onRequestDelete} onViewDetail={onViewDetail} globalSearch={searchQuery} />
    </>
  );
}

function ExpensesView({ onEdit, onRequestDelete, searchQuery }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text">Expenses</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Track and manage your business expenses
          </p>
        </div>
      </div>
      <ExpenseSummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ExpenseTable onEdit={onEdit} onRequestDelete={onRequestDelete} globalSearch={searchQuery} />
        </div>
        <ExpenseDonutChart />
      </div>
    </>
  );
}

function LeadsView({ onEdit, onRequestDelete, searchQuery }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">Lead Pipeline</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Track prospects through your sales pipeline
        </p>
      </div>
      <LeadBoard onEdit={onEdit} onRequestDelete={onRequestDelete} globalSearch={searchQuery} />
    </>
  );
}

function InvoicesView({ onEdit, onView, onRequestDelete, searchQuery }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">Invoices</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Create, track, and manage client invoices
        </p>
      </div>
      <InvoiceTable onEdit={onEdit} onView={onView} onRequestDelete={onRequestDelete} globalSearch={searchQuery} />
    </>
  );
}

function TeamView({ onEdit, onRequestDelete }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">Team</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Manage your team members and calculate payouts
        </p>
      </div>
      <TeamGrid onEdit={onEdit} onRequestDelete={onRequestDelete} />
      <PayoutCalculator />
    </>
  );
}

function AgentsView() {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">AI Agents</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Your specialized AI workforce
        </p>
      </div>
      <AgentGrid />
    </>
  );
}

function SystemView({ onEdit, onRequestDelete }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-text">System Health</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Monitor automation workflows and API credit usage
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AutomationGrid onEdit={onEdit} onRequestDelete={onRequestDelete} />
        </div>
        <div className="space-y-4">
          <CreditMonitor />
          <TestEmailButton />
        </div>
      </div>
    </>
  );
}
