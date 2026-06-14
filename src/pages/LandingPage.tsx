import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero/hero.jpg';

const featureItems = [
  {
    icon: '📅',
    title: 'Timeline Planning',
    description: 'Coordinate every milestone with a shared timeline that keeps every detail on schedule.',
  },
  {
    icon: '🤝',
    title: 'Vendor Management',
    description: 'Track vendors, contracts, and approvals in one calm, organized workspace.',
  },
  {
    icon: '🧾',
    title: 'Contracts Vault',
    description: 'Keep every agreement secure, accessible, and simple to review as plans evolve.',
  },
  {
    icon: '🎨',
    title: 'Mood Board',
    description: 'Collect imagery, colors, and ideas in one elegant shared vision space.',
  },
  {
    icon: '💡',
    title: 'Planner Intelligence',
    description: 'See the next right action so you stay focused on what matters most.',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <header className="border-b border-gold/20 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">💍</span>
            <div>
              <p className="text-base font-semibold tracking-[0.22em] uppercase text-slate">Ever After</p>
              <p className="text-xs text-slate/80">Wedding Portal</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 justify-start sm:justify-end">
            <Link to="/auth" className="text-sm font-medium text-charcoal hover:text-charcoal/80 transition">
              Login
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-gold text-charcoal px-5 py-2.5 text-sm font-medium shadow-sm shadow-gold/20 hover:bg-gold/90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="Soft wedding ceremony scene"
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 saturate-90 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-blush opacity-80" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.32em] text-gold mb-4">Wedding planning software</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight text-charcoal mb-6">
                  Plan weddings effortlessly with clarity, beauty, and control
                </h1>
                <p className="text-base sm:text-lg text-slate max-w-2xl leading-relaxed mb-8">
                  A polished platform for planners and couples to manage timelines, vendors, contracts, and inspiration with calm confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-charcoal/10 hover:bg-charcoal/90 transition"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-6 py-3 text-sm font-semibold text-charcoal hover:bg-sand transition"
                  >
                    Login
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gold/10 bg-white/90 p-8 shadow-xl shadow-slate-200/70">
                <div className="space-y-5">
                  <div className="rounded-[1.75rem] bg-sand/80 p-8">
                    <p className="text-sm uppercase tracking-[0.24em] text-gold font-semibold mb-3">Trusted workflows</p>
                    <ul className="space-y-3 text-sm text-charcoal/80">
                      <li>• Shared planning views for every team member</li>
                      <li>• Fast vendor approvals and contract tracking</li>
                      <li>• Clear next actions for every wedding day</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.75rem] bg-white/95 p-8 border border-gold/10 shadow-sm shadow-slate-200/40">
                    <p className="text-sm uppercase tracking-[0.24em] text-gold font-semibold mb-3">Designed for calm</p>
                    <p className="text-sm text-charcoal/80 leading-relaxed">
                      Every screen is crafted to reduce clutter, improve focus, and make planning feel effortless.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mx-auto max-w-2xl mb-10">
            <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">The essential tools for beautiful wedding planning</h2>
            <p className="text-slate text-base leading-relaxed">
              Core workflows designed to keep every wedding organized, collaborative, and moving forward gracefully.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureItems.map((item) => (
              <article key={item.title} className="rounded-3xl border border-gold/10 bg-white p-8 shadow-sm shadow-slate-200/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blush/20 text-2xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">{item.title}</h3>
                <p className="text-slate leading-relaxed text-sm">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-sand/70 py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-serif text-charcoal">Three simple steps to a calm wedding workflow</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-gold/10 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
                <div className="text-3xl mb-4">01</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Create your wedding</h3>
                <p className="text-slate text-sm leading-relaxed">
                  Add event details, dates, and milestone priorities in one polished setup.
                </p>
              </div>
              <div className="rounded-3xl border border-gold/10 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
                <div className="text-3xl mb-4">02</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Add vendors & timeline</h3>
                <p className="text-slate text-sm leading-relaxed">
                  Invite vendors, share contracts, and align tasks across your planning team.
                </p>
              </div>
              <div className="rounded-3xl border border-gold/10 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
                <div className="text-3xl mb-4">03</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Plan effortlessly together</h3>
                <p className="text-slate text-sm leading-relaxed">
                  Collaborate in one place so everyone stays confident, connected, and ahead of the day.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mx-auto max-w-2xl mb-12">
            <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold mb-3">Mood & inspiration</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal">A subtle, elegant palette for your wedding vision</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-[2rem] border border-gold/10 bg-white shadow-sm shadow-slate-200/40">
                <img
                  src={heroImage}
                  alt="Wedding inspiration image"
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold mb-3">Frequently asked questions</p>
              <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-6">Simple answers that build trust</h2>
              <div className="space-y-4">
                <div className="rounded-3xl border border-gold/10 bg-white p-6 shadow-sm shadow-slate-200/50">
                  <p className="font-semibold text-charcoal mb-2">What is Ever After Wedding Portal?</p>
                  <p className="text-slate text-sm leading-relaxed">
                    A wedding planning platform for planners and couples to manage tasks, vendors, contracts, and inspiration.
                  </p>
                </div>
                <div className="rounded-3xl border border-gold/10 bg-white p-6 shadow-sm shadow-slate-200/50">
                  <p className="font-semibold text-charcoal mb-2">Is this for planners or couples?</p>
                  <p className="text-slate text-sm leading-relaxed">
                    Designed for both. Planners gain workflow control and couples stay aligned with the details.
                  </p>
                </div>
                <div className="rounded-3xl border border-gold/10 bg-white p-6 shadow-sm shadow-slate-200/50">
                  <p className="font-semibold text-charcoal mb-2">Can I collaborate with my partner?</p>
                  <p className="text-slate text-sm leading-relaxed">
                    Yes. Share timelines, vendor notes, and mood board inspiration with your planning partner.
                  </p>
                </div>
                <div className="rounded-3xl border border-gold/10 bg-white p-6 shadow-sm shadow-slate-200/50">
                  <p className="font-semibold text-charcoal mb-2">Do I need technical experience?</p>
                  <p className="text-slate text-sm leading-relaxed">
                    No. The portal is built to be intuitive and approachable for every planning team.
                  </p>
                </div>
                <div className="rounded-3xl border border-gold/10 bg-white p-6 shadow-sm shadow-slate-200/50">
                  <p className="font-semibold text-charcoal mb-2">Is my data secure?</p>
                  <p className="text-slate text-sm leading-relaxed">
                    Yes. We secure wedding details with modern protections and private access controls.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-gold/10 bg-white p-10 shadow-xl shadow-slate-200/60">
              <p className="text-sm uppercase tracking-[0.32em] text-gold font-semibold mb-4">Contact</p>
              <h3 className="text-2xl font-semibold text-charcoal mb-5">Need support or a demo?</h3>
              <p className="text-slate text-sm leading-relaxed mb-8">
                Send your inquiry and we�ll respond within 24�48 hours.
              </p>
              <div className="rounded-3xl border border-charcoal/10 bg-cream p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate mb-2">Email</p>
                <p className="text-base font-medium text-charcoal">hello@everafterportal.com</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="rounded-[2rem] border border-gold/10 bg-white p-10 text-center shadow-xl shadow-slate-200/60">
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">Start planning your perfect wedding today</h2>
            <p className="text-slate text-base leading-relaxed max-w-2xl mx-auto mb-8">
              Discover the calm, elegant wedding planning system trusted by planners and couples alike.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-charcoal/10 hover:bg-charcoal/90 transition"
              >
                Get Started
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-6 py-3 text-sm font-semibold text-charcoal hover:bg-sand transition"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
