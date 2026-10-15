import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWedding } from '../../contexts/useWedding';
import { EmptyState } from '../../components/StateCards';
import { db } from '../../lib/supabase';
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
}) => {
  const { wedding } = useWedding();
  const [resolvedCover, setResolvedCover] = React.useState<{
    weddingId: string;
    storagePath: string;
    url: string;
  } | null>(null);
  const weddingId = wedding?.id;
  const storagePath = wedding?.coverImagePath;

  React.useEffect(() => {
    let isCurrent = true;
    setResolvedCover(null);

    if (!weddingId || !storagePath) {
      return () => {
        isCurrent = false;
      };
    }

    const resolveCover = async () => {
      try {
        const url = await db.getWeddingCoverPhotoSignedUrl(weddingId, storagePath);
        if (isCurrent) {
          setResolvedCover({ weddingId, storagePath, url });
        }
      } catch (error) {
        if (isCurrent) {
          console.error(`Unable to load cover photo for wedding ${weddingId}:`, error);
        }
      }
    };

    void resolveCover();

    return () => {
      isCurrent = false;
    };
  }, [weddingId, storagePath]);

  const coverUrl =
    resolvedCover &&
    resolvedCover.weddingId === weddingId &&
    resolvedCover.storagePath === storagePath
      ? resolvedCover.url
      : null;

  return (
    <div className="relative min-h-[280px] overflow-hidden border-b border-[#D4A843]/35 bg-[#EAF1EB] md:min-h-[360px]">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={wedding?.coupleNames ? `Cover photograph for ${wedding.coupleNames}` : 'Wedding cover photograph'}
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
          onError={() => {
            setResolvedCover((current) =>
              current &&
              current.weddingId === weddingId &&
              current.storagePath === storagePath
                ? null
                : current
            );
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#FFFFFF_0%,_#EAF1EB_55%,_#DCE9DF_100%)]"
        >
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#D4A843]/30" />
          <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-[#075B46]/10" />
        </div>
      )}

      <div className={`absolute inset-0 ${coverUrl ? 'bg-[#FAF8F6]/45' : 'bg-[#FAF8F6]/10'}`} />

      <div className="relative z-10 bg-gradient-to-br from-[#F5EFE8]/45 to-[#FAF8F6]/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24">
          <div className="mb-4">
            <h1 className="flex items-center gap-3 font-serif text-3xl text-[#172D26] md:text-5xl">
              {heroCopy.supportingLabel && (
                <svg aria-hidden="true" viewBox="0 0 36 28" fill="none" className="h-7 w-9 shrink-0 text-[#A98635] md:h-9 md:w-11">
                  <circle cx="13" cy="14" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="23" cy="14" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              )}
              <span>{heroCopy.heading}</span>
            </h1>
            {heroCopy.supportingLabel && (
              <p className="mt-1 pl-12 text-sm font-medium tracking-wide text-[#73796F] md:mt-0.5 md:pl-14 md:text-base">
                {heroCopy.supportingLabel}
              </p>
            )}
          </div>

          <p className="text-[#514B45] max-w-2xl">
            {heroCopy.message}
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const { userRole } = useAuth();
  const { wedding } = useWedding();
  const basePath =
    userRole === 'planner'
      ? wedding?.id
        ? `/dashboard/${wedding.id}`
        : '/portfolio'
      : '/couple/dashboard';

  return (
    <div className="mb-16">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-serif text-charcoal">
        {heading}
      </h2>

      <Link to={`${basePath}/contracts`} className="btn-secondary text-sm">
        View All
      </Link>
    </div>

    {recentContracts.length === 0 ? (
      <EmptyState
        icon="📄"
        title="No contracts uploaded yet"
        message="Keep your wedding agreement library complete by uploading or linking your first contract. Contracts help everyone stay aligned."
        actionLabel="View all contracts"
        onAction={() => navigate(`${basePath}/contracts`)}
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
