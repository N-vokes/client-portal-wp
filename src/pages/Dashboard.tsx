import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWedding } from '../contexts/WeddingContext';
import { DashboardSkeleton } from '../components/Skeleton';

interface DashboardProps {
  userRole: 'planner' | 'couple';
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { wedding, timelineEvents, contracts, moodBoardImages, loading } = useWedding();

  useEffect(() => {
    const coupleNames = wedding?.coupleNames || 'Demo Couple';
    if (userRole === 'planner') {
      document.title = `The Ever After Wedding Portal – Planner Dashboard`;
    } else {
      document.title = `The Ever After Wedding Portal – ${coupleNames} (Demo)`;
    }
  }, [userRole, wedding?.coupleNames]);

  if (loading) {
    return <DashboardSkeleton userRole={userRole} />;
  }

  const upcomingMilestones = timelineEvents
    .filter((event) => !event.completed)
    .slice(0, 3)
    .map((event) => {
      const daysUntil = Math.ceil(
        (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: event.id,
        title: event.title,
        daysUntil,
        category: event.category,
      };
    });

  const recentContracts = contracts.slice(0, 3).map((contract) => ({
    id: contract.id,
    vendor: contract.vendorName,
    type: contract.vendorType,
    status: 'Signed',
    icon: getVendorIcon(contract.vendorType),
    fileUrl: contract.fileUrl,
  }));

  const stats = [
    { label: 'Timeline Events', value: timelineEvents.length.toString(), color: 'bg-sand' },
    { label: 'Documents', value: contracts.length.toString(), color: 'bg-blush' },
    { label: 'Mood Board Items', value: moodBoardImages.length.toString(), color: 'bg-gold/10' },
    { label: 'Days Until Wedding', value: calculateDaysUntil(wedding?.weddingDate), color: 'bg-slate/10' },
  ];

  const completedCount = timelineEvents.filter((e) => e.completed).length;
  const totalCount = timelineEvents.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
          <h1 className="text-5xl font-serif text-charcoal mb-4">
            Welcome Back, {wedding?.coupleNames || 'Couple'} 💍
          </h1>
          <p className="text-lg text-slate max-w-2xl leading-relaxed">
            Your wedding is coming together beautifully. Here's your planning status at a glance.
          </p>
          {userRole === 'planner' && (
            <p className="text-sm text-slate mt-4 italic">
              ✨ Tip: Check in with vendors about pending contracts by Friday
            </p>
          )}
        </div>
      </div>
{/* Demo Banner - Premium Vibe */}
<div className="max-w-7xl mx-auto px-8 mt-6">
  <div className="bg-yellow-50 text-yellow-900 px-6 py-3 rounded-lg mb-6 text-sm border border-yellow-200 text-center shadow-sm font-medium tracking-wide">
    This is a demo wedding portal showing how planners can share progress with couples.
  </div>
</div>
      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-lg p-8 text-center`}>
              <p className="text-4xl font-serif text-charcoal mb-2">{stat.value}</p>
              <p className="text-sm text-slate">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Upcoming Milestones */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-charcoal">📅 Upcoming Milestones</h2>
              <Link to="/timeline" className="btn-secondary text-sm">View All</Link>
            </div>

            <div className="space-y-4">
              {upcomingMilestones.length > 0 ? (
                upcomingMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-4 bg-sand rounded-lg hover:bg-taupe/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-charcoal">{milestone.title}</h3>
                      <p className="text-xs text-slate mt-1">
                        Category: {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">{Math.max(0, milestone.daysUntil)} days</p>
                      <p className="text-xs text-slate">until deadline</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate italic">No upcoming milestones. All events completed! 🎉</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-2xl font-serif text-charcoal mb-8">✨ Planning Snapshot</h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-charcoal">Overall Progress</span>
                  <span className="text-sm text-slate">{progressPercent}%</span>
                </div>
                <div className="w-full bg-sand rounded-full h-2">
                  <div className="bg-charcoal h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gold/20">
                <p className="text-sm text-slate">
                  <span className="text-charcoal font-medium">Next Critical Task:</span>
                  <br />
                  {upcomingMilestones.length > 0
                    ? upcomingMilestones[0].title
                    : 'All milestones completed!'}
                </p>
              </div>

              <div className="pt-4 border-t border-gold/20">
                <p className="text-sm text-slate">
                  <span className="text-charcoal font-medium">Last Updated:</span>
                  <br />
                  Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Contracts */}
        <div className="card mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-charcoal">📄 Vendor Contracts</h2>
            <Link to="/contracts" className="btn-secondary text-sm">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentContracts.length > 0 ? (
              recentContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-6 border border-gold/20 rounded-lg hover:border-gold/50 transition-colors"
                >
                  <div className="text-3xl mb-3">{contract.icon}</div>
                  <h3 className="font-medium text-charcoal mb-1">{contract.vendor}</h3>
                  <p className="text-xs text-slate mb-4">{contract.type}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {contract.status}
                    </span>
                    <button
                      onClick={() => window.open(contract.fileUrl, '_blank')}
                      className="text-gold hover:text-charcoal transition-colors"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate italic col-span-3">No contracts uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Call to Action */}
        {userRole === 'couple' && (
          <div className="bg-blush rounded-lg p-12 text-center">
            <h3 className="text-2xl font-serif text-charcoal mb-4">Need Assistance?</h3>
            <p className="text-slate mb-6 max-w-2xl mx-auto">
              Our wedding planner is here to guide you through every step of the journey. Send a message
              anytime!
            </p>
            <Link to="/messages" className="btn-primary inline-block">Send Message to Planner</Link>
          </div>
        )}
      </div>
    </div>
  );
};

function getVendorIcon(vendorType: string): string {
  const icons: Record<string, string> = {
    caterer: '🍽️',
    photographer: '📸',
    florist: '🌹',
    venue: '🏛️',
    music: '🎵',
    other: '📦',
  };
  return icons[vendorType] || '📦';
}

function calculateDaysUntil(weddingDate?: string): string {
  if (!weddingDate) return '0';
  const daysUntil = Math.ceil((new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysUntil).toString();
}
