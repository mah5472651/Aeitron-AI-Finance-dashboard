import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Users, TrendingUp, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeads } from '../../context/LeadsContext';
import { useClients } from '../../context/ClientContext';
import { useSystemHealth } from '../../context/SystemHealthContext';
import { calcGoalProgress } from '../../utils/calculations';

const DEFAULT_SUMMARY =
  "Good morning. Pipeline is moving — every lead you close today compounds toward $1M. " +
  "Focus on your hottest prospects, protect your margin, and keep the automations running clean. " +
  "You don't need a perfect day. You need a decisive one.";

function useTypewriter(text, speed = 25) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return displayed;
}

export default function CEOBriefing() {
  const { leads } = useLeads();
  const { clients } = useClients();
  const { automations } = useSystemHealth();
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [refreshing, setRefreshing] = useState(false);
  const typewriterText = useTypewriter(summary);

  const metrics = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const WEEK = 7 * DAY;

    // New Leads (last 24h)
    const newLeads24h = leads.filter((l) => new Date(l.createdAt).getTime() > now - DAY).length;

    // Closing Rate (weekly) — Won leads / all leads touched in last 7 days
    const weeklyLeads = leads.filter((l) => {
      const updated = new Date(l.updatedAt || l.createdAt).getTime();
      return updated > now - WEEK;
    });
    let closingRate;
    if (weeklyLeads.length > 0) {
      const won = weeklyLeads.filter((l) => l.stage === 'Won').length;
      closingRate = Math.round((won / weeklyLeads.length) * 100);
    } else {
      const won = leads.filter((l) => l.stage === 'Won').length;
      closingRate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;
    }

    // System Health
    const activeCount = automations.filter((a) => a.status === 'active').length;
    const totalCount = automations.length;

    // Revenue Goal
    const goalPct = Math.round(calcGoalProgress(clients).percentage);

    return { newLeads24h, closingRate, activeCount, totalCount, goalPct };
  }, [leads, clients, automations]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const url = import.meta.env.VITE_N8N_BRIEFING_WEBHOOK;
      if (url) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.summary) setSummary(data.summary);
        }
      }
    } catch {
      // fail silently — UI stays stable
    }
    setRefreshing(false);
  }

  const miniMetrics = [
    {
      label: 'New Leads (24h)',
      value: metrics.newLeads24h.toString(),
      sub: 'vs yesterday',
      icon: Users,
      color: '#4da6ff',
    },
    {
      label: 'Closing Rate',
      value: `${metrics.closingRate}%`,
      sub: 'weekly wins',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      label: 'System Health',
      value: metrics.totalCount > 0 ? `${metrics.activeCount}/${metrics.totalCount}` : '—',
      sub: metrics.totalCount > 0 ? 'automations active' : 'no automations',
      icon: Activity,
      color: metrics.activeCount === metrics.totalCount && metrics.totalCount > 0 ? '#10b981' : '#f59e0b',
    },
    {
      label: 'Revenue Goal',
      value: `${metrics.goalPct}%`,
      sub: 'toward $1M target',
      icon: Target,
      color: '#a78bfa',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Gradient border wrapper */}
      <div
        className="rounded-xl p-px"
        style={{
          background: 'linear-gradient(135deg, #6c5ce7 0%, #a78bfa 50%, #10b981 100%)',
        }}
      >
        <div className="bg-bg-card rounded-[11px] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text">Today's Intelligence</h2>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: 'linear-gradient(135deg, #6c5ce7, #a78bfa)',
                  color: '#fff',
                  letterSpacing: '0.05em',
                }}
              >
                AI
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors duration-150 disabled:opacity-50"
              title="Refresh Briefing"
            >
              <RefreshCw
                size={13}
                className={refreshing ? 'animate-spin' : ''}
              />
              Refresh Briefing
            </button>
          </div>

          {/* AI Summary typewriter box */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
            }}
          >
            <p
              className="text-sm text-text leading-relaxed"
              style={{
                fontFamily: 'var(--font-mono)',
                minHeight: '1.25rem',
              }}
            >
              {typewriterText}
              <span className="animate-pulse opacity-70">▌</span>
            </p>
          </div>

          {/* Mini-metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {miniMetrics.map(({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-lg p-3"
                style={{ background: 'var(--color-bg)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs text-text-muted truncate">{label}</span>
                </div>
                <p
                  className="text-lg font-bold tracking-tight"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    color,
                  }}
                >
                  {value}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
