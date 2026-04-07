import { useMemo, useEffect, useState } from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '../../context/ClientContext';
import { calcGoalProgress } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

const RING_SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function GoalTracker() {
  const { clients } = useClients();
  const goal = useMemo(() => calcGoalProgress(clients), [clients]);
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(goal.percentage), 100);
    return () => clearTimeout(timer);
  }, [goal.percentage]);

  const strokeDashoffset = CIRCUMFERENCE - (animatedPct / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-bg-card border border-border rounded-xl p-6"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Circular progress ring */}
        <div className="relative shrink-0 animate-pulse-glow">
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6c5ce7" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Progress */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold gradient-text-goal">{goal.percentage}%</span>
            <span className="text-[10px] text-text-muted font-medium mt-0.5">of $1M</span>
          </div>
        </div>

        {/* Right side content */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Target size={18} className="text-accent" />
              <h2 className="text-xl font-bold gradient-text-goal">Road to $1M</h2>
            </div>
            <p className="text-xs text-text-muted">Track your agency's journey to the million-dollar milestone</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success/5 border border-success/15 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={14} className="text-success" />
                <span className="text-xs text-text-muted">Revenue Earned</span>
              </div>
              <p className="text-lg font-bold text-success font-mono">{formatCurrency(goal.revenue)}</p>
            </div>
            <div className={`${goal.achieved ? 'bg-success/5 border-success/15' : 'bg-danger/5 border-danger/15'} border rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={14} className={goal.achieved ? 'text-success' : 'text-danger'} />
                <span className="text-xs text-text-muted">{goal.achieved ? 'Goal Achieved!' : 'Shortfall'}</span>
              </div>
              <p className={`text-lg font-bold font-mono ${goal.achieved ? 'text-success' : 'text-danger'}`}>
                {goal.achieved ? 'Done!' : formatCurrency(goal.shortfall)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
