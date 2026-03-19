import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockClients } from '../data/mockClients';

interface ClientsProps {
  userRole: 'planner' | 'couple';
}

export const Clients: React.FC<ClientsProps> = ({ userRole }) => {
  useEffect(() => {
    document.title = 'The Ever After Wedding Portal – Clients';
  }, []);

  if (userRole !== 'planner') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-charcoal mb-4">Access Restricted</h1>
          <p className="text-slate">This page is only available to wedding planners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
          <h1 className="text-5xl font-serif text-charcoal mb-4">
            Your Clients 💍
          </h1>
          <p className="text-lg text-slate max-w-2xl leading-relaxed">
            Manage and track the progress of all your wedding clients in one elegant view.
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockClients.map((client) => (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="bg-white rounded-lg shadow-sm border border-gold/20 p-6 hover:shadow-md transition-shadow no-underline"
            >
              <h3 className="text-xl font-serif text-charcoal mb-2">{client.coupleNames}</h3>
              <p className="text-sm text-slate mb-1">
                <span className="font-medium">Wedding Date:</span> {new Date(client.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-slate mb-4">
                <span className="font-medium">Location:</span> {client.location}
              </p>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate">Progress</span>
                  <span className="text-sm font-medium text-charcoal">{client.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-full bg-gold text-white px-4 py-2 rounded-md text-center hover:bg-gold/80 transition-colors font-medium">
                View Profile
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};