import React from 'react';
import type { PaymentEntry } from '../../types/clientProfile';

interface PaymentTrackingSectionProps {
  payments: PaymentEntry[];
  paymentTitle: string;
  paymentAmount: string;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentDueDate: string;
  paymentNote: string;
  onTitleChange: (next: string) => void;
  onAmountChange: (next: string) => void;
  onStatusChange: (next: 'paid' | 'partial' | 'unpaid') => void;
  onDueDateChange: (next: string) => void;
  onNoteChange: (next: string) => void;
  onAddPayment: () => void;
}

export const PaymentTrackingSection: React.FC<PaymentTrackingSectionProps> = ({
  payments,
  paymentTitle,
  paymentAmount,
  paymentStatus,
  paymentDueDate,
  paymentNote,
  onTitleChange,
  onAmountChange,
  onStatusChange,
  onDueDateChange,
  onNoteChange,
  onAddPayment,
}) => {
  return (
    <div id="payment-section" className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-charcoal">Payment Tracking</h2>
        <span className="text-sm text-slate">{payments.length} items</span>
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-gold/20 mb-6">
        <div className="grid gap-3">
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="payment-title">Title / Item</label>
            <input
              id="payment-title"
              value={paymentTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Venue balance"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-charcoal mb-2" htmlFor="payment-amount">Amount</label>
              <input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal mb-2" htmlFor="payment-due-date">Due date</label>
              <input
                id="payment-due-date"
                type="date"
                value={paymentDueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
                className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="payment-status">Status</label>
            <select
              id="payment-status"
              value={paymentStatus}
              onChange={(e) => onStatusChange(e.target.value as 'paid' | 'partial' | 'unpaid')}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="payment-note">Optional note</label>
            <input
              id="payment-note"
              value={paymentNote}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Client note or reference"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={onAddPayment}
            className="bg-gold text-white px-4 py-2 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Payment
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gold/20 text-slate">No payment entries yet. Add one above to track costs.</div>
        ) : (
          payments.slice().reverse().map((payment) => (
            <div key={payment.id} className="bg-white p-4 rounded-lg border border-gold/20 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-charcoal">{payment.title}</h3>
                <p className="text-sm text-slate">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(payment.amount)} • due {new Date(payment.dueDate).toLocaleDateString('en-US')}</p>
                {payment.note && <p className="text-sm text-slate mt-1">{payment.note}</p>}
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                {payment.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};