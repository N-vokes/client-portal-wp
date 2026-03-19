import React from 'react';
import { Link } from 'react-router-dom';

interface ClientHeaderProps {
  coupleNames: string;
  weddingDate: string;
  location: string;
  progress: number;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ coupleNames, weddingDate, location, progress }) => {
  return (
    <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-8 py-16 md:py-24">
        <h1 className="text-5xl font-serif text-charcoal mb-3">{coupleNames}</h1>
        <div className="grid gap-2 md:grid-cols-3 mb-4 text-sm text-slate">
          <div>Wedding date: {new Date(weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div>Location: {location}</div>
          <div>Progress: {progress}%</div>
        </div>
        <p className="text-lg text-slate max-w-2xl leading-relaxed">
          Detailed client profile for planning progress, wedding timing, and location details.
        </p>
        <div className="mt-4 inline-flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/20 text-gold">On track</span>
          <span className="text-sm text-slate">Vendor alignment and decor plan confirm key direction.</span>
        </div>
        <Link to="/clients" className="mt-6 inline-block btn-secondary">Back to Clients</Link>
      </div>
    </div>
  );
};