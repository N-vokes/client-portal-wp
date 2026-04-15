import React from 'react';

interface ClientIntakeSectionProps {
  userRole: 'planner' | 'couple';
  coupleNames: string;
  weddingDate: string;
  ceremonyVenue: string;
  receptionVenue: string;
  guestCount: string;
  budget: string;
  planningStage: string;
  weddingStyle: string;
  preferredColors: string;
  topPriorities: string;
  mustHaves: string;
  doNotWant: string;
  mainHelpNeeded: string;
  biggestConcern: string;
  communicationPreference: string;
  additionalNotes: string;
  onCoupleNamesChange: (value: string) => void;
  onWeddingDateChange: (value: string) => void;
  onCeremonyVenueChange: (value: string) => void;
  onReceptionVenueChange: (value: string) => void;
  onGuestCountChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onPlanningStageChange: (value: string) => void;
  onWeddingStyleChange: (value: string) => void;
  onPreferredColorsChange: (value: string) => void;
  onTopPrioritiesChange: (value: string) => void;
  onMustHavesChange: (value: string) => void;
  onDoNotWantChange: (value: string) => void;
  onMainHelpNeededChange: (value: string) => void;
  onBiggestConcernChange: (value: string) => void;
  onCommunicationPreferenceChange: (value: string) => void;
  onAdditionalNotesChange: (value: string) => void;
}

export const ClientIntakeSection: React.FC<ClientIntakeSectionProps> = ({
  userRole,
  coupleNames,
  weddingDate,
  ceremonyVenue,
  receptionVenue,
  guestCount,
  budget,
  planningStage,
  weddingStyle,
  preferredColors,
  topPriorities,
  mustHaves,
  doNotWant,
  mainHelpNeeded,
  biggestConcern,
  communicationPreference,
  additionalNotes,
  onCoupleNamesChange,
  onWeddingDateChange,
  onCeremonyVenueChange,
  onReceptionVenueChange,
  onGuestCountChange,
  onBudgetChange,
  onPlanningStageChange,
  onWeddingStyleChange,
  onPreferredColorsChange,
  onTopPrioritiesChange,
  onMustHavesChange,
  onDoNotWantChange,
  onMainHelpNeededChange,
  onBiggestConcernChange,
  onCommunicationPreferenceChange,
  onAdditionalNotesChange,
}) => {
  return (
    <section className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-5 lg:p-6 shadow-sm">
      <div className="mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-serif text-charcoal mb-2">Client Intake</h3>

<p className="text-sm sm:text-base text-slate leading-relaxed mb-3">
  A simple overview of the couple’s preferences, priorities, and planning needs.
</p>

{userRole === 'planner' && (
  <p className="text-xs sm:text-sm text-gold/80 font-medium">
    Start here — fill this in as you understand the couple better.
  </p>
)}

{userRole === 'couple' && (
  <p className="text-xs sm:text-sm text-slate font-medium">
    This is your shared wedding summary so you can both stay aligned.
  </p>
)}
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h4 className="text-base sm:text-lg font-serif text-charcoal mb-4">Basic Wedding Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Couple Names</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={coupleNames}
    onChange={(e) => onCoupleNamesChange(e.target.value)}
    placeholder="e.g. Sarah & Michael"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {coupleNames || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Wedding Date</label>

{userRole === 'planner' ? (
  <input
    type="date"
    value={weddingDate}
    onChange={(e) => onWeddingDateChange(e.target.value)}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {weddingDate
      ? new Date(weddingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Ceremony Venue</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={ceremonyVenue}
    onChange={(e) => onCeremonyVenueChange(e.target.value)}
    placeholder="Enter ceremony venue"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {ceremonyVenue || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Reception Venue</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={receptionVenue}
    onChange={(e) => onReceptionVenueChange(e.target.value)}
    placeholder="Enter reception venue"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {receptionVenue || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Estimated Guest Count</label>

{userRole === 'planner' ? (
  <input
    type="number"
    value={guestCount}
    onChange={(e) => onGuestCountChange(e.target.value)}
    placeholder="e.g. 150"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {guestCount ? `${guestCount} guests` : '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Estimated Budget</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={budget}
    onChange={(e) => onBudgetChange(e.target.value)}
    placeholder="e.g. $20,000"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {budget || '—'}
  </div>
)}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Planning Stage</label>

{userRole === 'planner' ? (
  <select
    value={planningStage}
    onChange={(e) => onPlanningStageChange(e.target.value)}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
  >
    <option value="">Select planning stage</option>
    <option value="Just getting started">Just getting started</option>
    <option value="Exploring ideas">Exploring ideas</option>
    <option value="Some vendors booked">Some vendors booked</option>
    <option value="Most key vendors booked">Most key vendors booked</option>
    <option value="Finalizing details">Finalizing details</option>
  </select>
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {planningStage || '—'}
  </div>
)}
            </div>
          </div>
        </div>

        <div className="border-t border-gold/15 pt-6">
          <h4 className="text-base sm:text-lg font-serif text-charcoal mb-4">Wedding Vision</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Wedding Style / Vibe</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={weddingStyle}
    onChange={(e) => onWeddingStyleChange(e.target.value)}
    placeholder="e.g. elegant, modern, garden, intimate"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {weddingStyle || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Preferred Colors</label>

{userRole === 'planner' ? (
  <input
    type="text"
    value={preferredColors}
    onChange={(e) => onPreferredColorsChange(e.target.value)}
    placeholder="e.g. sage green, ivory, gold"
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {preferredColors || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Top Priorities</label>

{userRole === 'planner' ? (
  <textarea
    value={topPriorities}
    onChange={(e) => onTopPrioritiesChange(e.target.value)}
    placeholder="What matters most for the wedding?"
    rows={3}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3 whitespace-pre-line">
    {topPriorities || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Must-Haves</label>

{userRole === 'planner' ? (
  <textarea
    value={mustHaves}
    onChange={(e) => onMustHavesChange(e.target.value)}
    placeholder="List any must-have details"
    rows={3}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3 whitespace-pre-line">
    {mustHaves || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Do-Not-Want List</label>

{userRole === 'planner' ? (
  <textarea
    value={doNotWant}
    onChange={(e) => onDoNotWantChange(e.target.value)}
    placeholder="Anything the couple wants to avoid?"
    rows={3}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3 whitespace-pre-line">
    {doNotWant || '—'}
  </div>
)}
            </div>
          </div>
        </div>

        <div className="border-t border-gold/15 pt-6">
          <h4 className="text-base sm:text-lg font-serif text-charcoal mb-4">Support Needs</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Main Area of Help Needed</label>

{userRole === 'planner' ? (
  <select
    value={mainHelpNeeded}
    onChange={(e) => onMainHelpNeededChange(e.target.value)}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
  >
    <option value="">Select main area</option>
    <option value="Full Planning">Full Planning</option>
    <option value="Vendor Coordination">Vendor Coordination</option>
    <option value="Budget Planning">Budget Planning</option>
    <option value="Design / Styling">Design / Styling</option>
    <option value="Timeline Management">Timeline Management</option>
    <option value="Guest Experience">Guest Experience</option>
  </select>
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {mainHelpNeeded || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Biggest Concern Right Now</label>

{userRole === 'planner' ? (
  <textarea
    value={biggestConcern}
    onChange={(e) => onBiggestConcernChange(e.target.value)}
    placeholder="What is the couple most worried about right now?"
    rows={3}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3 whitespace-pre-line">
    {biggestConcern || '—'}
  </div>
)}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Preferred Communication Method</label>

{userRole === 'planner' ? (
  <select
    value={communicationPreference}
    onChange={(e) => onCommunicationPreferenceChange(e.target.value)}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
  >
    <option value="">Select communication method</option>
    <option value="WhatsApp">WhatsApp</option>
    <option value="Email">Email</option>
    <option value="Phone Call">Phone Call</option>
    <option value="Video Call">Video Call</option>
  </select>
) : (
  <div className="text-sm sm:text-base text-charcoal py-3">
    {communicationPreference || '—'}
  </div>
)}
            </div>
          </div>
        </div>

        <div className="border-t border-gold/15 pt-6">
          <h4 className="text-base sm:text-lg font-serif text-charcoal mb-4">Additional Notes</h4>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Notes</label>

{userRole === 'planner' ? (
  <textarea
    value={additionalNotes}
    onChange={(e) => onAdditionalNotesChange(e.target.value)}
    placeholder="Anything else the planner should know?"
    rows={4}
    className="w-full rounded-xl border border-gold/20 px-4 py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <div className="text-sm sm:text-base text-charcoal py-3 whitespace-pre-line">
    {additionalNotes || '—'}
  </div>
)}
          </div>
        </div>
      </div>
    </section>
  );
};