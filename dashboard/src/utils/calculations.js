import { EXPENSE_CATEGORY_COLORS, LEAD_STAGES, LEAD_STAGE_PROBABILITIES, ROADMAP_STAGES, REVENUE_GOAL } from './constants';

export function calcTotalRevenue(clients) {
  return clients.reduce((sum, c) => sum + c.amountPaid, 0);
}

export function calcOutstandingDues(clients) {
  return clients.reduce((sum, c) => sum + (c.totalProjectValue - c.amountPaid), 0);
}

export function calcMRR(clients) {
  return clients
    .filter((c) => c.paymentCategory === 'Monthly Retainer')
    .reduce((sum, c) => sum + c.amountPaid, 0);
}

export function calcOnboardedCount(clients) {
  return clients.filter((c) => c.onboardingStatus === 'Onboarded').length;
}

export function calcPaymentBreakdown(clients) {
  const counts = {
    'Fully Paid': 0,
    'Monthly Retainer': 0,
    'Partially Paid 50%': 0,
    'Unpaid': 0,
  };
  clients.forEach((c) => {
    if (counts[c.paymentCategory] !== undefined) {
      counts[c.paymentCategory]++;
    }
  });
  return [
    { name: 'Fully Paid', value: counts['Fully Paid'], color: '#00d68f' },
    { name: 'Retainer', value: counts['Monthly Retainer'], color: '#a78bfa' },
    { name: 'Partial', value: counts['Partially Paid 50%'], color: '#f0b429' },
    { name: 'Unpaid', value: counts['Unpaid'], color: '#ff4757' },
  ].filter((d) => d.value > 0);
}

export function calcRevenueOverTime(clients) {
  if (clients.length === 0) return [];

  const sorted = [...clients].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const monthMap = new Map();
  sorted.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + c.amountPaid);
  });

  let cumulative = 0;
  return Array.from(monthMap.entries()).map(([month, revenue]) => {
    cumulative += revenue;
    return { month, revenue: cumulative };
  });
}

export function calcTotalExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calcNetProfit(clients, expenses) {
  return calcTotalRevenue(clients) - calcTotalExpenses(expenses);
}

export function calcExpenseBreakdown(expenses) {
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  return Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: EXPENSE_CATEGORY_COLORS[name] || '#8c90a0',
    }))
    .filter((d) => d.value > 0);
}

export function calcLeadsByStage(leads) {
  const grouped = {};
  LEAD_STAGES.forEach((stage) => {
    grouped[stage] = [];
  });
  leads.forEach((lead) => {
    if (grouped[lead.stage]) {
      grouped[lead.stage].push(lead);
    }
  });
  return grouped;
}

export function calcPipelineValue(leads) {
  return leads.reduce((sum, l) => sum + l.dealValue, 0);
}

export function migrateLeadStages(leads) {
  const stageMap = {
    'New Lead': 'Cold',
    'Contacted': 'Warm',
    'Negotiation': 'Hot',
  };
  return leads.map((l) => {
    if (stageMap[l.stage]) {
      return { ...l, stage: stageMap[l.stage] };
    }
    if (!LEAD_STAGES.includes(l.stage)) {
      return { ...l, stage: 'Cold' };
    }
    return l;
  });
}

export function calcRevenueVsExpensesOverTime(clients, expenses) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: 0,
      expenses: 0,
    });
  }

  const monthKeys = new Set(months.map((m) => m.key));

  clients.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthKeys.has(key)) {
      const month = months.find((m) => m.key === key);
      month.revenue += c.amountPaid;
    }
  });

  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthKeys.has(key)) {
      const month = months.find((m) => m.key === key);
      month.expenses += e.amount;
    }
  });

  return months.map(({ label, revenue, expenses }) => ({ month: label, revenue, expenses }));
}

export function calcLeadScore(lead) {
  const prob = LEAD_STAGE_PROBABILITIES[lead.stage] || 0;
  return Math.round(lead.dealValue * prob);
}

export function calcNeedsFollowup(lead) {
  if (lead.stage === 'Won' || lead.stage === 'Lost') return false;
  if (!lead.lastContacted) return true;
  const diff = Date.now() - new Date(lead.lastContacted).getTime();
  return diff > 3 * 24 * 60 * 60 * 1000;
}

export function calcWeightedPipelineValue(leads) {
  return leads
    .filter((l) => l.stage !== 'Won' && l.stage !== 'Lost')
    .reduce((sum, l) => sum + l.dealValue * (LEAD_STAGE_PROBABILITIES[l.stage] || 0), 0);
}

export function calcDaysUntilDeadline(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (24 * 60 * 60 * 1000));
}

export function calcRoadmapProgress(roadmapStage) {
  const idx = ROADMAP_STAGES.indexOf(roadmapStage);
  if (idx < 0) return 0;
  return Math.round((idx / (ROADMAP_STAGES.length - 1)) * 100);
}

export function calcProjectedRevenue(clients, leads, monthsAhead = 6) {
  const mrr = calcMRR(clients);
  const weightedPipeline = calcWeightedPipelineValue(leads);
  const monthlyPipeline = weightedPipeline / monthsAhead;
  const now = new Date();
  const result = [];

  for (let i = 1; i <= monthsAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    result.push({
      month: label,
      recurring: mrr * i,
      pipeline: monthlyPipeline * i,
      total: mrr * i + monthlyPipeline * i,
    });
  }
  return result;
}

export function calcBurnRate(clients, expenses) {
  const monthlyRevenue = calcMRR(clients) || (calcTotalRevenue(clients) / Math.max(getMonthSpan(clients), 1));
  const monthlyExpenses = calcTotalExpenses(expenses) / Math.max(getMonthSpan(null, expenses), 1);
  const runwayMonths = monthlyExpenses > 0 ? monthlyRevenue / monthlyExpenses : Infinity;
  return { monthlyExpenses, monthlyRevenue, runwayMonths };
}

export function migrateRoadmapStage(stage) {
  const stageMap = {
    'Design': 'Build',
    'n8n Build': 'Build',
    'Testing': 'QA',
    'Handover': 'Delivery',
  };
  if (stageMap[stage]) return stageMap[stage];
  if (ROADMAP_STAGES.includes(stage)) return stage;
  return 'Discovery';
}

export function calcGoalProgress(clients) {
  const revenue = calcTotalRevenue(clients);
  const goal = REVENUE_GOAL;
  return {
    revenue,
    goal,
    percentage: Math.min(100, Math.round((revenue / goal) * 100)),
    shortfall: Math.max(0, goal - revenue),
    achieved: revenue >= goal,
  };
}

function getMonthSpan(clients, expenses) {
  const items = clients || expenses || [];
  if (items.length === 0) return 1;
  const dates = items.map((i) => new Date(i.createdAt || i.date));
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  return Math.max(1, Math.ceil((max - min) / (30 * 24 * 60 * 60 * 1000)));
}
