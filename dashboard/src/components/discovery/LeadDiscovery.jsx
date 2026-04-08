import { useState, useRef } from 'react';
import {
  Radar, X, Plus, Play, Loader2, Clock, Globe, MessageSquare, AtSign,
  UserPlus, Zap, CheckCircle2,
} from 'lucide-react';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useLeads } from '../../context/LeadsContext';
import ActionToast from '../shared/ActionToast';

// ─── Score style lookup (no string interpolation — avoids Tailwind v4 purge) ───
const SCORE_STYLES = {
  high: { badge: 'text-success bg-success/15', label: 'text-success' },
  mid: { badge: 'text-warning bg-warning/15', label: 'text-warning' },
  low: { badge: 'text-danger bg-danger/15', label: 'text-danger' },
};

function getScoreTier(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

// ─── Source config ───────────────────────────────────────────────────────────
const SOURCE_CONFIG = {
  reddit: { icon: MessageSquare, color: '#ff4500', bg: 'rgba(255,69,0,0.12)', label: 'Reddit' },
  twitter: { icon: AtSign, color: '#1d9bf0', bg: 'rgba(29,155,240,0.12)', label: 'Twitter / X' },
  web: { icon: Globe, color: '#8c90a0', bg: 'rgba(140,144,160,0.12)', label: 'Web' },
};

// ─── Mock feed data template ─────────────────────────────────────────────────
const MOCK_TEMPLATES = [
  {
    source: 'reddit',
    author: 'u/BootstrappedFounder',
    snippet: "We're looking for someone to build n8n automation workflows for our SaaS. Budget is around $3–5k. Anyone have recommendations for agencies that specialise in this?",
    score: 91,
    keyword: 'n8n automation',
  },
  {
    source: 'twitter',
    author: '@techstartup_ceo',
    snippet: 'Honestly losing my mind trying to set up AI agents for our sales team. We need a proper AI agency to come in and build this out. Anyone built this at scale?',
    score: 84,
    keyword: 'AI agency needed',
  },
  {
    source: 'reddit',
    author: 'u/OpsManager_Sarah',
    snippet: "Our manual data entry is killing us. Heard Make.com and n8n can automate most of this but we don't have in-house devs. What's the going rate for an automation consultant?",
    score: 76,
    keyword: 'n8n automation',
  },
  {
    source: 'web',
    author: 'forum.indiehackers.com',
    snippet: "Post: 'We need AI automation for our onboarding flow'. Company is scaling fast and the founder is actively asking for vendor recommendations in the thread.",
    score: 68,
    keyword: 'AI agency needed',
  },
  {
    source: 'twitter',
    author: '@ecommerce_brand',
    snippet: 'Does anyone know a good automation agency? We want to connect Shopify to our CRM automatically. Happy to pay for a proper solution.',
    score: 55,
    keyword: 'automation agency',
  },
  {
    source: 'reddit',
    author: 'u/ScaleupCTO',
    snippet: "We're evaluating n8n vs Zapier for enterprise automation. Would love to talk to someone who has done this at scale — especially Claude/AI integrations.",
    score: 79,
    keyword: 'Claude Code expert',
  },
  {
    source: 'web',
    author: 'news.ycombinator.com',
    snippet: "Ask HN: 'Best way to find an AI automation freelancer/agency?' — several comments mention needing end-to-end n8n + AI agent setups for their product.",
    score: 62,
    keyword: 'n8n automation',
  },
  {
    source: 'twitter',
    author: '@saas_operator',
    snippet: "If anyone knows a Claude Code expert who can help us build custom internal tools, DM me. We're a Series A company with a real budget.",
    score: 88,
    keyword: 'Claude Code expert',
  },
  {
    source: 'reddit',
    author: 'u/random_dev_guy',
    snippet: 'Just wondering if anyone has used n8n for personal projects. I am a solo dev exploring it for fun, nothing serious.',
    score: 18,
    keyword: 'n8n automation',
  },
];

// ─── Keyword → service type mapping ─────────────────────────────────────────
function inferServiceType(keyword) {
  const k = keyword.toLowerCase();
  if (k.includes('n8n') || k.includes('automation') || k.includes('workflow')) return 'n8n Workflows';
  if (k.includes('ai') || k.includes('agent') || k.includes('claude')) return 'AI Agents';
  return 'Consulting';
}

// ─── Relative time helper ────────────────────────────────────────────────────
function relativeTime(isoString) {
  if (!isoString) return 'Never';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function PageHeader({ isRunning, lastRun }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Radar size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text">Lead Discovery</h1>
          <p className="text-xs text-text-muted mt-0.5">Real-time intent signals from across the web</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isRunning ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/15 text-success text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            SCANNING
          </span>
        ) : lastRun ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-text-muted/10 text-text-muted text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
            IDLE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-text-muted/10 text-text-muted text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
            STANDBY
          </span>
        )}
      </div>
    </div>
  );
}

function KeywordManager({ keywords, onAdd, onRemove }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  function handleAdd() {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 mb-4">
      <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
        <Zap size={14} className="text-accent" />
        Target Keywords
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "n8n automation", "AI agency needed"'
          className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent/15 text-accent hover:bg-accent hover:text-white rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {keywords.length === 0 ? (
        <p className="text-xs text-text-muted/60 italic">Add keywords to start discovering intent signals</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-medium"
            >
              {kw}
              <button
                onClick={() => onRemove(kw)}
                className="hover:text-accent/60 transition-colors ml-0.5"
                aria-label={`Remove keyword ${kw}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScraperControls({ keywords, isRunning, autoPilot, lastRun, onRun, onToggleAutoPilot }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center gap-3">

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isRunning || keywords.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isRunning
              ? 'linear-gradient(135deg, #5b21b6, #4c1d95)'
              : 'linear-gradient(135deg, #7c3aed, #6c5ce7)',
            boxShadow: isRunning ? 'none' : '0 0 14px rgba(124,58,237,0.35)',
          }}
        >
          {isRunning ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Play size={15} />
          )}
          {isRunning ? 'Scanning...' : 'Run Scraper Now'}
        </button>

        {/* AutoPilot toggle */}
        <button
          onClick={onToggleAutoPilot}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
            autoPilot
              ? 'bg-success/15 text-success border-success/30'
              : 'bg-bg text-text-muted border-border hover:border-border-light hover:text-text'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full transition-colors ${autoPilot ? 'bg-success animate-pulse' : 'bg-text-muted/40'}`}
          />
          Auto-Pilot
          {autoPilot && <span className="text-[10px] font-normal ml-1 opacity-70">ON</span>}
        </button>

        {/* Last run */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted ml-auto">
          <Clock size={12} />
          {lastRun ? `Last run: ${relativeTime(lastRun)}` : 'Never run'}
        </div>
      </div>

      {autoPilot && (
        <p className="text-[11px] text-text-muted/60 mt-2.5 ml-0.5">
          Auto-runs every 30 min (simulated) — monitors all active keywords continuously
        </p>
      )}

      {keywords.length === 0 && (
        <p className="text-[11px] text-warning/70 mt-2.5 ml-0.5">
          Add at least one keyword above to enable the scraper
        </p>
      )}
    </div>
  );
}

function FeedItemCard({ item, onImport, onIgnore }) {
  const [toast, setToast] = useState(null);
  const src = SOURCE_CONFIG[item.source] ?? SOURCE_CONFIG.web;
  const SrcIcon = src.icon;
  const tier = getScoreTier(item.score);
  const styles = SCORE_STYLES[tier];

  function handleImport() {
    onImport(item);
    setToast({ message: 'Lead imported to CRM pipeline', status: 'success' });
  }

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150 animate-slide-up">
        <div className="flex items-start gap-3">

          {/* Source icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: src.bg }}
          >
            <SrcIcon size={16} style={{ color: src.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-text truncate">{item.author}</span>
              <span className="text-[10px] text-text-muted/60 shrink-0">{src.label}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-2">{item.snippet}</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] rounded-full font-medium">
                {item.keyword}
              </span>
              <span className="text-[10px] text-text-muted/50">{relativeTime(item.discoveredAt)}</span>
            </div>
          </div>

          {/* Score badge */}
          <div
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${styles.badge}`}
            style={tier === 'high' ? { boxShadow: '0 0 10px rgba(16,185,129,0.35)' } : {}}
          >
            <span className={`text-lg font-bold leading-none ${styles.label}`}>{item.score}</span>
            <span className="text-[9px] text-text-muted/70 mt-0.5 uppercase tracking-wide">Intent</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/15 text-accent hover:bg-accent hover:text-white rounded-lg text-xs font-medium transition-all duration-150"
          >
            <UserPlus size={12} />
            Import to CRM
          </button>
          <button
            onClick={() => onIgnore(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg text-xs font-medium transition-all duration-150"
          >
            <X size={12} />
            Ignore
          </button>
        </div>
      </div>

      {toast && (
        <ActionToast
          message={toast.message}
          status={toast.status}
          duration={2500}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}

function IntentFeed({ feedItems, isRunning, lastRun, onImport, onIgnore }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-text-muted/40'}`}
          />
          Live Intent Feed
        </h2>
        {feedItems.length > 0 && (
          <span className="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-full font-medium">
            {feedItems.length} signal{feedItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {feedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-text-muted/8 flex items-center justify-center mb-4">
            <Radar size={24} className="text-text-muted/40" />
          </div>
          {lastRun ? (
            <>
              <p className="text-sm font-medium text-text-muted">No signals found</p>
              <p className="text-xs text-text-muted/60 mt-1">Try different or broader keywords</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-text-muted">No signals yet</p>
              <p className="text-xs text-text-muted/60 mt-1">Run the scraper to discover intent signals</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {feedItems.map((item) => (
            <FeedItemCard
              key={item.id}
              item={item}
              onImport={onImport}
              onIgnore={onIgnore}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Root page component
// ────────────────────────────────────────────────────────────────────────────

export default function LeadDiscovery() {
  const { keywords, feedItems, isRunning, autoPilot, lastRun, dispatch } = useDiscovery();
  const { dispatch: leadsDispatch } = useLeads();

  async function runScraper() {
    if (isRunning || keywords.length === 0) return;
    dispatch({ type: 'SET_RUNNING', payload: true });

    // Fire-and-forget POST to n8n webhook
    const webhookUrl = import.meta.env.VITE_N8N_SCRAPER_WEBHOOK;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      }).catch(() => {});
    }

    // Simulate scraper response after 2.5s with filtered mock data
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const newItems = MOCK_TEMPLATES
      .filter((t) =>
        keywords.some((k) => t.keyword.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(t.keyword.toLowerCase()))
      )
      .map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        url: '#',
        discoveredAt: new Date(Date.now() - Math.floor(Math.random() * 3_600_000)).toISOString(),
      }));

    // If no keywords match, show all mock items so the feed is never empty
    const items = newItems.length > 0 ? newItems : MOCK_TEMPLATES.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      url: '#',
      discoveredAt: new Date(Date.now() - Math.floor(Math.random() * 3_600_000)).toISOString(),
    }));

    dispatch({ type: 'ADD_FEED_ITEMS', payload: items });
    dispatch({ type: 'SET_LAST_RUN', payload: new Date().toISOString() });
    dispatch({ type: 'SET_RUNNING', payload: false });
  }

  function handleImport(item) {
    const lead = {
      id: crypto.randomUUID(),
      contactName: item.author,
      email: '',
      companyName: item.author,
      dealValue: 0,
      stage: 'Cold',
      serviceType: inferServiceType(item.keyword),
      source: item.source.charAt(0).toUpperCase() + item.source.slice(1),
      notes: `[Discovered via Lead Discovery] ${item.snippet}`,
      lastContacted: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsDispatch({ type: 'ADD_LEAD', payload: lead });
    dispatch({ type: 'IGNORE_ITEM', payload: item.id });
  }

  function handleIgnore(id) {
    dispatch({ type: 'IGNORE_ITEM', payload: id });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader isRunning={isRunning} lastRun={lastRun} />
      <KeywordManager
        keywords={keywords}
        onAdd={(kw) => dispatch({ type: 'ADD_KEYWORD', payload: kw })}
        onRemove={(kw) => dispatch({ type: 'REMOVE_KEYWORD', payload: kw })}
      />
      <ScraperControls
        keywords={keywords}
        isRunning={isRunning}
        autoPilot={autoPilot}
        lastRun={lastRun}
        onRun={runScraper}
        onToggleAutoPilot={() => dispatch({ type: 'TOGGLE_AUTOPILOT' })}
      />
      <IntentFeed
        feedItems={feedItems}
        isRunning={isRunning}
        lastRun={lastRun}
        onImport={handleImport}
        onIgnore={handleIgnore}
      />
    </div>
  );
}
