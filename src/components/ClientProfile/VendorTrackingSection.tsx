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
    <div id="vendor-section" className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-charcoal">Vendor Tracking</h2>
        <span className="text-sm text-slate">{vendors.length} vendors</span>
      </div>

      <div className="bg-sand/50 p-4 rounded-lg border border-gold/20 mb-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-name">Vendor name</label>
            <input
              id="vendor-name"
              value={vendorName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Gold Ribbon Catering"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-category">Category</label>
            <input
              id="vendor-category"
              value={vendorCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="photographer, catering, decor"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal mb-2" htmlFor="vendor-status">Status</label>
            <select
              id="vendor-status"
              value={vendorStatus}
              onChange={(e) => onStatusChange(e.target.value as 'pending' | 'contacted' | 'booked')}
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
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
              className="w-full rounded-lg border border-gold/20 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Key detail for next step"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={onAddVendor}
            className="bg-gold text-white px-4 py-2 rounded-md hover:bg-gold/80 transition-colors font-medium"
          >
            Add Vendor
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {vendors.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gold/20 text-slate">No vendors tracked yet. Add vendor contacts above.</div>
        ) : (
          vendors.slice().reverse().map((vendor) => (
            <div key={vendor.id} className="bg-white p-4 rounded-lg border border-gold/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-charcoal">{vendor.vendorName}</h3>
                  <p className="text-sm text-slate">{vendor.category}</p>
                  {vendor.note && <p className="text-sm text-slate mt-1">{vendor.note}</p>}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${vendor.status === 'booked' ? 'bg-emerald-100 text-emerald-700' : vendor.status === 'contacted' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
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