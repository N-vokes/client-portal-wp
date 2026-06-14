import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/StateCards';

import heroImage from '../../assets/images/hero/hero.jpg';
import type {
  DashboardHeroCopy,
  UpcomingMilestone,
  RecentContract,
  PrimaryAction,
} from '../../adapters/dashboardAdapters';

type DashboardHeroProps = {
  heroCopy: DashboardHeroCopy;
};

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  heroCopy,
}) => (
  <div className="relative border-b border-gold/20 overflow-hidden">
    <img
      src={heroImage}
      alt="Wedding hero"
      className="absolute inset-0 w-full h-full object-cover object-[50%_35%]"
    />

    <div className="absolute inset-0 bg-cream/40" />

    <div className="relative z-10 bg-gradient-to-br from-sand/40 to-cream/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24">
        <h1 className="text-3xl md:text-5xl font-serif text-charcoal mb-4">
          {heroCopy.heading}
        </h1>

        <p className="text-slate max-w-2xl">
          {heroCopy.message}
        </p>
      </div>
    </div>
  </div>
);

type DashboardProgressProps = {
  upcomingMilestones: UpcomingMilestone[];
  progressPercent: number;
};

export const DashboardProgress: React.FC<DashboardProgressProps> = ({
  upcomingMilestones,
  progressPercent,
}) => (
  <div className="bg-white/70 border border-gold/10 rounded-2xl p-6 mb-12">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-serif text-charcoal">
        Overall Progress
      </h2>

      <span className="text-sm text-slate">
        {progressPercent}%
      </span>
    </div>

    <div className="w-full bg-sand rounded-full h-3 overflow-hidden">
      <div
        className="bg-charcoal h-full rounded-full transition-all duration-500"
        style={{ width: `${progressPercent}%` }}
      />
    </div>

    <div className="mt-4 text-sm text-slate">
      {upcomingMilestones.length > 0
        ? `Next milestone: ${upcomingMilestones[0].title}`
        : 'Add your first milestone to begin tracking progress.'}
    </div>
  </div>
);

type DashboardContractsProps = {
  heading: string;
  recentContracts: RecentContract[];
};

export const DashboardContracts: React.FC<DashboardContractsProps> = ({
  heading,
  recentContracts,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-16">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-serif text-charcoal">
        {heading}
      </h2>

      <Link to="/dashboard/contracts" className="btn-secondary text-sm">
        View All
      </Link>
    </div>

    {recentContracts.length === 0 ? (
      <EmptyState
        icon="📄"
        title="No contracts uploaded yet"
        message="Keep your wedding agreement library complete by uploading or linking your first contract. Contracts help everyone stay aligned."
        actionLabel="View all contracts"
        onAction={() => navigate('/dashboard/contracts')}
        className="py-12"
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white/70 border border-gold/10 rounded-2xl p-6"
          >
            <div className="text-3xl mb-3">{contract.icon}</div>

            <h3 className="font-medium text-charcoal mb-1">
              {contract.vendor}
            </h3>

            <p className="text-sm text-slate mb-4">
              {contract.type}
            </p>

            <button
              onClick={() => {
                if (contract.fileUrl && contract.fileUrl !== '#') {
                  window.open(contract.fileUrl, '_blank');
                }
              }}
              className="text-gold hover:text-charcoal transition-colors"
            >
              View →
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

type DashboardFinalCtaProps = {
  primaryAction: PrimaryAction;
};

export const DashboardFinalCta: React.FC<DashboardFinalCtaProps> = ({
  primaryAction,
}) => (
  <div className="bg-blush rounded-2xl p-8 md:p-12 text-center">
    <h3 className="text-2xl font-serif text-charcoal mb-4">
      {primaryAction.title}
    </h3>

    <p className="text-slate mb-6 max-w-2xl mx-auto">
      {primaryAction.text}
    </p>

    <Link to={primaryAction.buttonLink} className="btn-primary inline-block">
      {primaryAction.buttonLabel}
    </Link>
  </div>
);
