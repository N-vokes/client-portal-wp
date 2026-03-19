import React from 'react';

interface ClientOverviewCardsProps {
  totalVendors: number;
  bookedVendors: number;
  paymentsDue: number;
  paymentsPaid: number;
  vendorReadiness: number;
  paymentReadiness: number;
  milestoneCompletion: number;
  overallReadiness: number;
  overallStatus: string;
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
        <p className="text-base sm:text-lg font-semibold text-charcoal leading-relaxed">Vendor: {vendorReadiness}% | Payment: {paymentReadiness}% | Milestone: {milestoneCompletion}%</p>
        <p className="text-sm sm:text-base font-medium text-slate mt-1">Overall: {overallReadiness}% ({overallStatus})</p>
        <div className="w-full bg-sand rounded-full h-2 mt-2 overflow-hidden shadow-inner">
          <div className="bg-gold h-2 rounded-full" style={{ width: `${overallReadiness}%` }} />
        </div>
      </div>
    </div>
  );
};