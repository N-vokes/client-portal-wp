import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlannerFocus } from '../../hooks/usePlannerFocus';
import { isVendorType } from '../../utils/vendorTypeGuard';
import { usePlannerActions } from '../../domain/plannerActions';

/**
 * Planner Focus Panel Component
 * ⚠️ WEDDING-SCOPED: Displays insights derived from active wedding context
 * Read-only UI component for planner daily workflow guidance
 * 
 * Shows:
 * - Today's focus (overdue, upcoming, vendor gaps)
 * - Next 3 actions (auto-prioritized)
 * - Risk flags (critical and warning level)
 */
export const PlannerFocusPanel: React.FC = () => {
  const focusData = usePlannerFocus();
  const { executePlannerAction } = usePlannerActions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Group risk flags by severity for visual hierarchy
  const criticalRisks = focusData.riskFlags.filter(
    (f) => f.severity === 'critical'
  );
  const warningRisks = focusData.riskFlags.filter(
    (f) => f.severity === 'warning'
  );

  return (
    <div className="space-y-6">
      {/* === TODAY'S FOCUS SECTION === */}
      <div className="bg-gradient-to-br from-sand/20 to-blush/10 border border-gold/20 rounded-2xl p-6">
        <h2 className="text-xl font-serif text-charcoal mb-4">📍 Today's Focus</h2>

        <div className="space-y-4">
          {/* Overdue Tasks */}
          {focusData.overdueTasks.length > 0 && (
            <div className="bg-red-50/50 border border-red-200/30 rounded-lg p-4">
              <p className="text-sm font-medium text-charcoal mb-2">
                ⚠️ {focusData.overdueTasks.length} Overdue Task
                {focusData.overdueTasks.length > 1 ? 's' : ''}
              </p>
              <ul className="space-y-1">
                {focusData.overdueTasks.slice(0, 2).map((task) => (
                  <li
                    key={task.id}
                    className="text-sm text-slate flex items-center justify-between gap-3"
                  >
                    <div>
                      • <span className="font-medium">{task.title}</span> ({task.daysOverdue} days
                      late)
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            setProcessingId(String(task.id));
                            await executePlannerAction({
                              type: 'MARK_TIMELINE_COMPLETE',
                              id: task.id,
                            });
                          } catch (err) {
                            console.error('Mark overdue done failed', err);
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === String(task.id)}
                        className="text-xs px-2 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
                      >
                        Mark done
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {focusData.overdueTasks.length > 2 && (
                <p className="text-xs text-slate mt-2">
                  +{focusData.overdueTasks.length - 2} more overdue
                </p>
              )}
            </div>
          )}

          {/* Upcoming Milestones (7-14 days) */}
          {focusData.upcomingMilestones.length > 0 && (
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
              <p className="text-sm font-medium text-charcoal mb-2">
                📅 {focusData.upcomingMilestones.length} Due in Next 2 Weeks
              </p>
              <ul className="space-y-1">
                {focusData.upcomingMilestones.slice(0, 2).map((milestone) => (
                  <li key={milestone.id} className="text-sm text-slate flex items-center justify-between gap-3">
                    <div>
                      • <span className="font-medium">{milestone.title}</span> in{' '}
                      <span className="text-charcoal font-medium">{milestone.daysUntil}</span> days
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            setProcessingId(String(milestone.id));
                            await executePlannerAction({
                              type: 'MARK_TIMELINE_COMPLETE',
                              id: milestone.id,
                            });
                          } catch (err) {
                            console.error('Mark milestone done failed', err);
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === String(milestone.id)}
                        className="text-xs px-2 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
                      >
                        Mark done
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {focusData.upcomingMilestones.length > 2 && (
                <p className="text-xs text-slate mt-2">
                  +{focusData.upcomingMilestones.length - 2} more upcoming
                </p>
              )}
            </div>
          )}

          {/* Vendor Gaps */}
          {focusData.vendorGaps.length > 0 && (
            <div className="bg-blush/10 border border-blush/20 rounded-lg p-4">
              <p className="text-sm font-medium text-charcoal mb-2">
                👥 {focusData.vendorGaps.length} Vendors Not Yet Booked
              </p>
              <div className="flex flex-wrap gap-2">
                {focusData.vendorGaps.map((gap) => (
                  <div key={gap.vendorType} className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 border border-blush/30 rounded-full text-xs">
                      <span>{gap.icon}</span>
                      <span className="capitalize font-medium">{gap.vendorType}</span>
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          // runtime safety: ensure vendorType is valid
                          if (!isVendorType(gap.vendorType)) {
                            console.warn('Invalid vendor type, aborting create:', gap.vendorType);
                            return;
                          }

                          setProcessingId(gap.vendorType);
                          await executePlannerAction({
                            type: 'CREATE_CONTRACT_FROM_VENDOR_GAP',
                            vendorType: gap.vendorType,
                          });
                        } catch (err) {
                          console.error('Create contract failed', err);
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      disabled={processingId === gap.vendorType}
                      className="text-xs px-2 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
                    >
                      Create {gap.vendorType}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {focusData.overdueTasks.length === 0 &&
            focusData.upcomingMilestones.length === 0 &&
            focusData.vendorGaps.length === 0 && (
              <div className="bg-green-50/50 border border-green-200/30 rounded-lg p-4 text-center">
                <p className="text-sm text-charcoal">✅ Everything is on track!</p>
              </div>
            )}
        </div>
      </div>

      {/* === NEXT 3 ACTIONS SECTION === */}
      {focusData.nextActions.length > 0 && (
        <div className="bg-white/70 border border-gold/10 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-charcoal mb-4">
            🎯 Next {Math.min(3, focusData.nextActions.length)} Actions
          </h3>

          <ol className="space-y-3">
            {focusData.nextActions.map((action, index) => (
              <li key={action.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-charcoal text-cream font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-charcoal font-medium">{action.title}</p>
                  <p className="text-xs text-slate">
                    Priority:{' '}
                    <span
                      className={`font-medium ${
                        action.priority === 'critical'
                          ? 'text-red-600'
                          : 'text-gold'
                      }`}
                    >
                      {action.priority.toUpperCase()}
                    </span>
                  </p>
                </div>
                {action.type === 'overdue-event' ? (
                  <div className="flex-shrink-0">
                    <button
                      onClick={async () => {
                        try {
                          // action.id is formatted like `overdue-<eventId>`
                          const extractedId = action.id.replace(/^overdue-/, '');
                          setProcessingId(action.id);
                          await executePlannerAction({
                            type: 'MARK_TIMELINE_COMPLETE',
                            id: extractedId,
                          });
                        } catch (err) {
                          console.error('Resolve action failed', err);
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      disabled={processingId === action.id}
                      className="text-xs px-2 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                ) : (
                  <Link
                    to={action.actionUrl}
                    className="flex-shrink-0 text-gold hover:text-charcoal transition-colors text-sm font-medium"
                  >
                    Go →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* === RISK FLAGS SECTION === */}
      {focusData.riskFlags.length > 0 && (
        <div className="space-y-3">
          {/* Critical Risks */}
          {criticalRisks.length > 0 && (
            <div className="bg-red-50/70 border border-red-200/40 rounded-lg p-4">
              <h4 className="text-sm font-serif text-red-700 mb-2">🚨 Critical Alerts</h4>
              <div className="space-y-2">
                {criticalRisks.map((flag) => (
                  <p key={flag.id} className="text-sm text-red-600">
                    • {flag.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Warning Risks */}
          {warningRisks.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/40 rounded-lg p-4">
              <h4 className="text-sm font-serif text-amber-700 mb-2">⚡ Warnings</h4>
              <div className="space-y-2">
                {warningRisks.map((flag) => (
                  <p key={flag.id} className="text-sm text-amber-700">
                    • {flag.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
