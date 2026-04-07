import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, AlertCircle, Wallet, Kanban } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useLeads } from '../../context/LeadsContext';
import { calcTotalRevenue, calcMRR, calcOutstandingDues, calcNetProfit, calcPipelineValue } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import StatCard from './StatCard';

export default function StatCardGrid() {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { leads } = useLeads();

  const netProfit = useMemo(() => calcNetProfit(clients, expenses), [clients, expenses]);
  const pipelineValue = useMemo(() => calcPipelineValue(leads), [leads]);

  const stats = useMemo(() => [
    {
      title: 'Total Revenue',
      value: formatCurrency(calcTotalRevenue(clients)),
      icon: DollarSign,
      color: '#00d68f',
    },
    {
      title: 'Monthly Recurring',
      value: formatCurrency(calcMRR(clients)),
      icon: TrendingUp,
      color: '#a78bfa',
    },
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      icon: Users,
      color: '#4da6ff',
    },
    {
      title: 'Outstanding Dues',
      value: formatCurrency(calcOutstandingDues(clients)),
      icon: AlertCircle,
      color: '#ff4757',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: Wallet,
      color: netProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      subtitle: `${leads.length} lead${leads.length !== 1 ? 's' : ''}`,
      icon: Kanban,
      color: '#8b5cf6',
    },
  ], [clients, expenses, leads, netProfit, pipelineValue]);

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
}
