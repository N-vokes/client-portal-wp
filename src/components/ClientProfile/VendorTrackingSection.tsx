import React from 'react';
import type { VendorEntry } from '../../types/clientProfile';

interface VendorTrackingSectionProps {
  vendors: VendorEntry[];
  vendorName: string;
  vendorCategory: string;
  vendorStatus: 'pending' | 'contacted' | 'booked';
  vendorNote: string;
  onNameChange: (next: string) => void;
  onCategoryChange: (next: string) => void;
  onStatusChange: (next: 'pending' | 'contacted' | 'booked') => void;
  onNoteChange: (next: string) => void;
  onAddVendor: () => void;
}

export const VendorTrackingSection: React.FC<VendorTrackingSectionProps> = ({
  vendors,
  vendorName,
  vendorCategory,
  vendorStatus,
  vendorNote,
  onNameChange,
  onCategoryChange,
  onStatusChange,
  onNoteChange,
  onAddVendor,
}) => {
  return (
    <div id="vendor-section" className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-serif text-charcoal">Vendor Tracking</h2>
        <span className="text-sm text-slate">{vendors.length} vendors</span>
      </div>

      <div className="bg-sand/50 p-3 sm:p-4 rounded-lg border border-gold/20 mb-5 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-name">Vendor name</label>
            <input
              id="vendor-name"
              value={vendorName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Gold Ribbon Catering"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-category">Category</label>
            <input
              id="vendor-category"
              value={vendorCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="photographer, catering, decor"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-status">Status</label>
            <select
              id="vendor-status"
              value={vendorStatus}
              onChange={(e) => onStatusChange(e.target.value as 'pending' | 'contacted' | 'booked')}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="booked">Booked</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-note">Optional note</label>
            <input
              id="vendor-note"
              value={vendorNote}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Key detail for next step"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={onAddVendor}
            className="w-full sm:w-auto bg-gold text-white px-4 py-2.5 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Vendor
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {vendors.length === 0 ? (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20 text-slate text-sm sm:text-base">
  No vendors tracked yet. Add vendor contacts above.
</div>
        ) : (
          vendors.slice().reverse().map((vendor) => (
            <div key={vendor.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gold/20">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-charcoal break-words">{vendor.vendorName}</h3>
                  <p className="text-sm sm:text-base text-slate break-words">{vendor.category}</p>
                  {vendor.note && (
  <p className="text-sm sm:text-base text-slate mt-1 leading-relaxed break-words">
    {vendor.note}
  </p>
)}
                </div>
                <span className={`w-fit px-3 py-1 text-xs font-semibold rounded-full uppercase ${vendor.status === 'booked' ? 'bg-emerald-100 text-emerald-700' : vendor.status === 'contacted' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};