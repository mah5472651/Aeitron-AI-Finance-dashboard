import { CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '../../context/ClientContext';
import { ROADMAP_STAGES } from '../../utils/constants';

export default function PublicClientView({ clientId }) {
  const { clients } = useClients();
  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-bg-card border border-border rounded-2xl p-10 text-center max-w-md">
          <ExternalLink size={40} className="mx-auto mb-4 text-text-muted opacity-40" />
          <h1 className="text-xl font-semibold text-text mb-2">Project Not Found</h1>
          <p className="text-sm text-text-muted">This project link may be invalid or has been removed.</p>
        </div>
      </div>
    );
  }

  const completedStages = client.completedStages || [];
  const currentStage = client.roadmapStage;
  const progress = ROADMAP_STAGES.length > 0
    ? Math.round((completedStages.length / ROADMAP_STAGES.length) * 100)
    : 0;

  const nextStage = ROADMAP_STAGES.find((s) => !completedStages.includes(s));

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-retainer p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {client.clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold">{client.companyName}</h1>
              <p className="text-sm text-white/70">{client.serviceType}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-text">Project Progress</h2>
              <span className="text-sm font-bold text-accent">{progress}%</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-success"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Milestone Stepper */}
          <div>
            <h2 className="text-sm font-semibold text-text mb-4">Milestones</h2>
            <div className="space-y-3">
              {ROADMAP_STAGES.map((stage, i) => {
                const isComplete = completedStages.includes(stage);
                const isCurrent = stage === currentStage && !isComplete;

                return (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isComplete
                        ? 'bg-success/5 border-success/20'
                        : isCurrent
                        ? 'bg-accent/5 border-accent/20'
                        : 'bg-bg border-border'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle size={20} className="text-success shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-accent bg-accent/15 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-text-muted/30 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      isComplete ? 'text-success' : isCurrent ? 'text-accent' : 'text-text-muted'
                    }`}>
                      {stage}
                    </span>
                    {isComplete && (
                      <span className="text-xs text-success/70 ml-auto">Completed</span>
                    )}
                    {isCurrent && (
                      <span className="text-xs text-accent/70 ml-auto">In Progress</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          {nextStage && (
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-accent mb-1">Next Steps</h3>
              <p className="text-sm text-text-secondary">
                The project is moving into the <span className="font-semibold text-accent">{nextStage}</span> phase.
                {nextStage === 'Discovery' && ' We are gathering requirements and understanding your needs.'}
                {nextStage === 'Strategy' && ' We are planning the approach and defining the project roadmap.'}
                {nextStage === 'Build' && ' Development is underway — your solution is being built.'}
                {nextStage === 'QA' && ' Quality assurance testing to ensure everything works perfectly.'}
                {nextStage === 'Delivery' && ' Final delivery and handover of your completed project.'}
                {nextStage === 'Maintenance' && ' Ongoing support and maintenance for your solution.'}
              </p>
            </div>
          )}

          {completedStages.length === ROADMAP_STAGES.length && (
            <div className="bg-success/5 border border-success/15 rounded-lg p-4 text-center">
              <h3 className="text-sm font-semibold text-success mb-1">Project Complete!</h3>
              <p className="text-sm text-text-secondary">All milestones have been successfully delivered.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 text-center">
          <p className="text-xs text-text-muted">
            Powered by <span className="font-semibold text-accent">Aeitron AI</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
