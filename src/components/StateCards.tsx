import React from 'react';

export interface StateCardProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const baseButtonStyles =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200';

const StateCardShell: React.FC<StateCardProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[2rem] border border-gold/20 bg-cream/95 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-sand/60 text-4xl">
        {icon}
      </div>

      <h3 className="text-2xl font-serif text-charcoal mb-3">{title}</h3>

      <p className="text-slate max-w-2xl mx-auto leading-relaxed">{message}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`${baseButtonStyles} mt-8 bg-charcoal text-cream hover:bg-slate`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC<StateCardProps> = (props) => (
  <StateCardShell {...props} />
);

export const ErrorState: React.FC<StateCardProps> = ({
  icon = '⚠️',
  title,
  message,
  actionLabel = 'Try again',
  onAction,
  className,
}) => (
  <StateCardShell
    icon={icon}
    title={title}
    message={message}
    actionLabel={actionLabel}
    onAction={onAction}
    className={className}
  />
);
