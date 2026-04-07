import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function AgentCard({ agent, onClick, index = 0 }) {
  const Icon = agent.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      onClick={() => onClick(agent)}
      className="bg-bg-card border border-border rounded-xl p-5 text-left hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 group cursor-pointer w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{agent.name}</h3>
            <p className="text-xs text-text-muted">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: agent.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: agent.color }}
            />
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.capabilities.map((cap) => (
          <span
            key={cap}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${agent.color}12`,
              color: agent.color,
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[11px] text-text-muted font-medium">Open Workspace</span>
        <ChevronRight
          size={14}
          className="text-text-muted group-hover:translate-x-0.5 transition-transform"
          style={{ color: agent.color }}
        />
      </div>
    </motion.button>
  );
}
