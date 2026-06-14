import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface GettingStartedStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
  completed: boolean;
}

interface GettingStartedGuideProps {
  steps: GettingStartedStep[];
  userRole: 'planner' | 'couple';
}

export const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({ steps, userRole }) => {
  const navigate = useNavigate();
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white/70 border border-gold/10 rounded-2xl p-6 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-charcoal">Getting Started</h2>
          <p className="text-sm text-slate mt-1">
            {completedCount} of {steps.length} steps completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-charcoal">{Math.round(progressPercent)}%</div>
        </div>
      </div>

      <div className="w-full bg-sand rounded-full h-2 overflow-hidden mb-8">
        <div
          className="bg-charcoal h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-6 rounded-xl border-2 transition-all ${
              step.completed
                ? 'border-gold/30 bg-gold/5'
                : 'border-gold/10 bg-cream/50 hover:border-gold/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{step.icon}</div>
              {step.completed && <span className="text-lg">✓</span>}
            </div>

            <h3 className="font-semibold text-charcoal mb-2">
              Step {index + 1}: {step.title}
            </h3>

            <p className="text-sm text-slate mb-4 leading-relaxed">{step.description}</p>

            {!step.completed && (
              <button
                type="button"
                onClick={() => navigate(step.link)}
                className="text-sm font-medium text-charcoal hover:text-gold transition-colors"
              >
                Get started →
              </button>
            )}

            {step.completed && (
              <p className="text-sm text-gold font-medium">Completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
