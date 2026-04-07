import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AGENTS from '../../config/agentConfig';
import AgentCard from './AgentCard';
import AgentWorkspace from './AgentWorkspace';

export default function AgentGrid() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  if (selectedAgent) {
    return (
      <AnimatePresence mode="wait">
        <AgentWorkspace
          key={selectedAgent.id}
          agent={selectedAgent}
          onBack={() => setSelectedAgent(null)}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {AGENTS.map((agent, i) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          index={i}
          onClick={setSelectedAgent}
        />
      ))}
    </div>
  );
}
