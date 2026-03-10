import React from 'react';

interface MessagesPageProps {
  userRole: 'planner' | 'couple';
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ userRole }) => {
  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h1 className="text-5xl font-serif text-charcoal mb-4">💬 Messages</h1>
          <p className="text-lg text-slate max-w-3xl">
            Communicate with your {userRole === 'planner' ? 'couple' : 'planner'} and keep everyone aligned on the details that matter.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-serif text-charcoal mb-4">Conversations</h2>
              <div className="space-y-2">
                {['Sarah & Michael', 'Venue Coordinator', 'Photographer'].map((name, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      idx === 0
                        ? 'bg-charcoal text-cream'
                        : 'bg-sand hover:bg-taupe text-charcoal'
                    }`}
                  >
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs opacity-70 mt-1">Last message...</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm h-96 p-6 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-sand flex-shrink-0" />
                  <div className="bg-sand rounded-lg p-3 max-w-sm">
                    <p className="text-sm text-charcoal">Hi there! Just checking in on the timeline.</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-charcoal text-cream rounded-lg p-3 max-w-sm">
                    <p className="text-sm">Everything is on track! The venue confirmed for October.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blush flex-shrink-0" />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                />
                <button className="btn-primary text-sm">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
