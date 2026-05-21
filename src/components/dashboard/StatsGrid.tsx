import React from 'react';

interface Stat {
  label: string;
  value: string;
  color: string;
}

interface Props {
  stats: Stat[];
}

export const StatsGrid: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className={`${stat.color} rounded-lg p-6 text-center`}>
          <p className="text-3xl font-serif text-charcoal">{stat.value}</p>
          <p className="text-sm text-slate">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};