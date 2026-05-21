import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  action: string;
  hint: string;
  cta: string;
  link: string;
}

export const NextActionCard: React.FC<Props> = ({
  title,
  action,
  hint,
  cta,
  link,
}) => {
  return (
    <div className="mb-12 bg-white/60 p-6 rounded-2xl">
      <p className="text-xs uppercase text-slate mb-2">{title}</p>
      <h3 className="text-xl font-serif">{action}</h3>
      <p className="text-slate mb-4">{hint}</p>

      <Link to={link} className="btn-primary">
        {cta}
      </Link>
    </div>
  );
};