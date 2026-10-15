import React from 'react';

interface ClientOverviewCardsProps {
  totalVendors: number;
  bookedVendors: number;
  paymentsDue: number;
  paymentsPaid: number;
  vendorReadiness: number | null;
  paymentReadiness: number | null;
  milestoneCompletion: number | null;
  overallReadiness: number | null;
  overallStatus: string | null;
}

export const ClientOverviewCards: React.FC<ClientOverviewCardsProps> = ({
  totalVendors,
  bookedVendors,
  paymentsDue,
  paymentsPaid,
  vendorReadiness,
  paymentReadiness,
  milestoneCompletion,
  overallReadiness,
  overallStatus,
}) => {
  const percentText = (value: number | null) => value === null ? '—' : `${value}%`;
  const hasReadiness = vendorReadiness !== null && paymentReadiness !== null && milestoneCompletion !== null && overallReadiness !== null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">Total vendors</p>
        <p className="text-xl sm:text-2xl font-serif text-charcoal">{totalVendors}</p>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">Vendors booked</p>
        <p className="text-xl sm:text-2xl font-serif text-charcoal">{bookedVendors}</p>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">Payments due</p>
        <p className="text-xl sm:text-2xl font-serif text-charcoal">{paymentsDue}</p>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm">
        <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">Payments paid</p>
        <p className="text-xl sm:text-2xl font-serif text-charcoal">{paymentsPaid}</p>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-white p-4 shadow-sm md:col-span-4">
        <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">Readiness</p>
        <p className="text-base sm:text-lg font-semibold text-charcoal leading-relaxed">
          {hasReadiness
            ? `Vendor: ${percentText(vendorReadiness)} | Payment: ${percentText(paymentReadiness)} | Milestone: ${percentText(milestoneCompletion)}`
            : 'Readiness is still loading'}
        </p>
        <p className="text-sm sm:text-base font-medium text-slate mt-1">
          {hasReadiness
            ? `Overall: ${overallReadiness}% (${overallStatus})`
            : 'Waiting for wedding data'}
        </p>
        <div className="w-full bg-sand rounded-full h-2 mt-2 overflow-hidden shadow-inner">
          <div className="bg-gold h-2 rounded-full" style={{ width: `${hasReadiness ? overallReadiness : 0}%` }} />
        </div>
      </div>
    </div>
  );
};