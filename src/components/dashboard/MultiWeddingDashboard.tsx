import React from 'react';
import { Link } from 'react-router-dom';
import type { MultiWeddingDashboardItem } from '../../data/multiWeddingDashboardData';

interface MultiWeddingDashboardProps {
  items: MultiWeddingDashboardItem[];
}

export const MultiWeddingDashboard: React.FC<MultiWeddingDashboardProps> = ({ items }) => {
  const totalActiveWeddings = items.length;
  const weddingsNeedingAttention = items.filter((item) => item.attentionFlag).length;
  const pendingVendorItems = items.filter((item) =>
    item.attentionFlag?.toLowerCase().includes('vendor')
  ).length;
  const paymentsDue = items.filter((item) =>
    item.attentionFlag?.toLowerCase().includes('payment')
  ).length;

  return (
    <section className="mt-8 mb-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-serif text-charcoal mb-2">Multi-Wedding Overview</h2>
        <p className="text-slate">
          A quick snapshot of active weddings, planner priorities, and items needing attention.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate mb-2">Active Weddings</p>
          <p className="text-3xl font-serif text-charcoal">{totalActiveWeddings}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate mb-2">Need Attention</p>
          <p className="text-3xl font-serif text-charcoal">{weddingsNeedingAttention}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate mb-2">Pending Vendor Items</p>
          <p className="text-3xl font-serif text-charcoal">{pendingVendorItems}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate mb-2">Payments Due</p>
          <p className="text-3xl font-serif text-charcoal">{paymentsDue}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gold/20 px-6 py-4">
          <h3 className="text-lg md:text-xl font-serif text-charcoal">Wedding Pipeline</h3>
        </div>

        <div className="divide-y divide-gold/10">
          {items.map((item) => (
            <div
  key={item.id}
  className="px-4 md:px-6 py-5 hover:bg-sand/30 transition-colors"
>
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h4 className="text-base md:text-lg font-medium text-charcoal">{item.coupleNames}</h4>
      <p className="text-xs md:text-sm text-slate mt-1 leading-relaxed">
        {new Date(item.weddingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}{' '}
        • {item.location}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        <Link
          to={`/clients/${item.id}`}
          className="text-xs sm:text-sm px-3 py-2 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
        >
          Open
        </Link>

        <button
          type="button"
          className="text-xs px-3 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
        >
          + Note
        </button>

        <button
          type="button"
          className="text-xs px-3 py-1 rounded-full border border-gold/30 text-charcoal hover:bg-sand transition-colors"
        >
          + Vendor
        </button>
      </div>
    </div>

    <div className="w-full lg:w-72">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate">Progress</span>
        <span className="text-sm font-medium text-charcoal">{item.progress}%</span>
      </div>

      <div className="w-full bg-sand rounded-full h-2 overflow-hidden">
        <div
          className="bg-gold h-2 rounded-full transition-all"
          style={{ width: `${item.progress}%` }}
        />
      </div>

      {item.attentionFlag ? (
        <p className="text-sm text-gold mt-3">{item.attentionFlag}</p>
      ) : (
        <p className="text-sm text-slate mt-3">On track</p>
      )}
    </div>
  </div>
</div>
          ))}
        </div>
      </div>
    </section>
  );
};