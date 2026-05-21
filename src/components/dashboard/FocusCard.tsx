import React from 'react';

interface Props {
  title: string;
  highlight: string;
  message: string;
}

export const FocusCard: React.FC<Props> = ({
  title,
  highlight,
  message,
}) => {
  return (
    <div className="mb-10 bg-gradient-to-r from-sand/40 to-cream/40 p-6 rounded-2xl">
      <p className="text-xs uppercase text-slate mb-2">{title}</p>
      <h3 className="text-xl font-serif">{highlight}</h3>
      <p className="text-slate">{message}</p>
    </div>
  );
};