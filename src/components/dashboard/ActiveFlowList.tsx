import React from 'react';

interface FlowItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
}

interface Props {
  items: FlowItem[];
}

export const ActiveFlowList: React.FC<Props> = ({ items }) => {
  return (
    <div className="space-y-5 mb-12">
      {items.map((item) => {
        const tag = item.tag.toLowerCase();

        return (
          <div
            key={item.id}
            className="bg-white/60 p-6 rounded-2xl border border-gold/10"
          >
            <span className="text-xs uppercase bg-sand px-3 py-1 rounded-full">
              {item.tag}
            </span>

            <h3 className="mt-3 font-serif text-lg">{item.title}</h3>
            <p className="text-slate">{item.subtitle}</p>

            <span
              className={`inline-block w-2 h-2 mt-3 rounded-full ${
                tag.includes('progress')
                  ? 'bg-green-400'
                  : tag.includes('pending')
                  ? 'bg-amber-400'
                  : tag.includes('upcoming')
                  ? 'bg-slate-400'
                  : 'bg-slate-300'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};