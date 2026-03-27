import React from 'react';

interface RoleEntryProps {
  onSelectRole: (role: 'planner' | 'couple') => void;
}

export const RoleEntry: React.FC<RoleEntryProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-serif text-charcoal mb-6">
          The Ever After
        </h1>

        {/* Subtext */}
        <p className="text-slate text-sm sm:text-base mb-10 leading-relaxed">
          This is a guided wedding planning experience designed to bring clarity,
          calm, and structure to your journey.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          
          {/* Planner */}
          <button
            onClick={() => onSelectRole('planner')}
            className="w-full rounded-xl bg-charcoal text-cream py-3 text-sm sm:text-base font-medium hover:bg-charcoal/90 transition"
          >
            Enter as Planner
          </button>

          <p className="text-xs text-slate -mt-2 mb-2">
            Full control and planning workspace
          </p>

          {/* Couple */}
          <button
            onClick={() => onSelectRole('couple')}
            className="w-full rounded-xl border border-gold/30 bg-white py-3 text-sm sm:text-base font-medium text-charcoal hover:bg-sand transition"
          >
            Enter as Couple
          </button>

          <p className="text-xs text-slate -mt-2">
            A calm space to explore and share your vision
          </p>

        </div>
      </div>
    </div>
  );
};