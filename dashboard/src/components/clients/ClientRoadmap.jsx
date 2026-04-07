import { CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROADMAP_STAGES } from '../../utils/constants';
import { calcDaysUntilDeadline } from '../../utils/calculations';

export default function ClientRoadmap({ client, dispatch, readOnly = false }) {
  const completedStages = client.completedStages || [];
  const currentStage = client.roadmapStage;
  const currentIdx = ROADMAP_STAGES.indexOf(currentStage);
  const daysLeft = calcDaysUntilDeadline(client.deadline);
  const progress = ROADMAP_STAGES.length > 0
    ? Math.round((completedStages.length / ROADMAP_STAGES.length) * 100)
    : 0;

  function handleStageClick(stage) {
    if (readOnly || !dispatch) return;
    if (completedStages.includes(stage)) return;
    dispatch({
      type: 'COMPLETE_STAGE',
      payload: { clientId: client.id, stage },
    });
  }

  function deadlineBadge() {
    if (daysLeft === null) return null;
    let color = 'bg-success/15 text-success';
    let label = `${daysLeft}d left`;
    if (daysLeft < 0) {
      color = 'bg-danger/15 text-danger';
      label = `${Math.abs(daysLeft)}d overdue`;
    } else if (daysLeft <= 7) {
      color = 'bg-danger/15 text-danger';
    } else if (daysLeft <= 14) {
      color = 'bg-warning/15 text-warning';
    }
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
        <Clock size={12} />
        {label}
      </span>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Project Roadmap</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted">{progress}%</span>
          {deadlineBadge()}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-success"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Milestone stepper */}
      <div className="relative pt-2">
        <div className="flex items-center">
          {ROADMAP_STAGES.map((stage, i) => {
            const isComplete = completedStages.includes(stage);
            const isCurrent = i === currentIdx && !isComplete;
            const isLast = i === ROADMAP_STAGES.length - 1;
            const isClickable = !readOnly && dispatch && !isComplete;

            return (
              <div key={stage} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                {/* Node */}
                <div className="flex flex-col items-center relative">
                  <motion.button
                    type="button"
                    onClick={() => handleStageClick(stage)}
                    disabled={!isClickable}
                    whileTap={isClickable ? { scale: 0.9 } : {}}
                    whileHover={isClickable ? { scale: 1.15 } : {}}
                    className={`relative z-10 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    title={isComplete ? `${stage} - Completed` : isCurrent ? `${stage} - In Progress` : isClickable ? `Click to complete ${stage}` : stage}
                  >
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <CheckCircle size={22} className="text-success" />
                      </motion.div>
                    ) : isCurrent ? (
                      <div className="w-5.5 h-5.5 rounded-full border-2 border-accent bg-accent/15 flex items-center justify-center">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-accent"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    ) : (
                      <Circle size={22} className="text-text-muted/30" />
                    )}
                  </motion.button>
                  <span className={`absolute top-7 text-[10px] font-medium whitespace-nowrap ${
                    isComplete ? 'text-success' : isCurrent ? 'text-accent' : 'text-text-muted/50'
                  }`}>
                    {stage}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-1 rounded overflow-hidden bg-border">
                    <motion.div
                      className="h-full bg-success rounded"
                      initial={{ width: '0%' }}
                      animate={{ width: isComplete ? '100%' : '0%' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next step hint */}
      {!readOnly && currentStage && !completedStages.includes(currentStage) && (
        <p className="text-xs text-text-muted pt-4">
          Next step: <span className="text-accent font-medium">{currentStage}</span>
          {' '}&mdash; click the stage above to mark it complete
        </p>
      )}
      {completedStages.length === ROADMAP_STAGES.length && (
        <p className="text-xs text-success font-medium pt-4">
          All milestones completed!
        </p>
      )}
    </div>
  );
}
