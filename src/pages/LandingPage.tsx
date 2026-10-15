import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero/hero.jpg';

const features = [
  {
    number: '01',
    title: 'A clear sense of what comes next',
    description: 'Bring important dates, decisions, and milestones into one shared timeline.',
  },
  {
    number: '02',
    title: 'Vendors and agreements, together',
    description: 'Keep vendor details and contracts organized and easy to return to.',
  },
  {
    number: '03',
    title: 'A private place for every couple',
    description: 'Give clients a dedicated wedding workspace to follow plans and take part in decisions.',
  },
  {
    number: '04',
    title: 'One shared creative vision',
    description: 'Gather inspiration and keep the look and feeling of the celebration in view.',
  },
];

const faqs = [
  {
    question: 'What is The Ever After?',
    answer: 'A wedding-planning platform for planners and couples to organize timelines, vendors, contracts, and inspiration.',
  },
  {
    question: 'Is it for planners or couples?',
    answer: 'Both. Planners can manage multiple weddings, while each couple can take part in their own private wedding workspace.',
  },
  {
    question: 'Can we plan together?',
    answer: 'Yes. Share timelines, vendor details, and wedding inspiration with the people involved in your celebration.',
  },
  {
    question: 'Do I need technical experience?',
    answer: 'No. The portal is designed to make wedding details approachable and simple to keep up with.',
  },
  {
    question: 'Is wedding information private?',
    answer: 'Wedding workspaces are built for private access by the people involved in that celebration.',
  },
];

const FocusMark: React.FC = () => (
  <span aria-hidden="true" className="mt-2 block h-px w-10 bg-[#B18B3B]" />
);

export const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-[#FAF8F3] text-[#282D29]">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#123C30] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Link to="/" aria-label="The Ever After home" className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B]">
          <svg aria-hidden="true" viewBox="0 0 32 28" fill="none" className="h-7 w-8 shrink-0 text-[#E5C77B]">
            <circle cx="12" cy="14" r="8.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="14" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>
            <span className="block font-serif text-xl leading-tight tracking-wide">The Ever After</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.24em] text-white/65">Wedding planning, thoughtfully</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-2 sm:gap-5">
          <a href="#approach" className="hidden rounded-sm px-2 py-2 text-sm text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B] md:inline-flex">
            Our approach
          </a>
          <a href="#features" className="hidden rounded-sm px-2 py-2 text-sm text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B] md:inline-flex">
            The experience
          </a>
          <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B]">
            Log in
          </Link>
          <Link to="/auth" className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#E5C77B] px-5 py-2 text-sm font-semibold text-[#19382E] transition hover:bg-[#F0D897] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123C30]">
            Get started
          </Link>
        </nav>
      </div>
    </header>

    <main>
      <section aria-labelledby="hero-heading" className="overflow-hidden bg-[#F6F2E9]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:py-16 md:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#75602F]">A calmer way to bring it all together</p>
            <FocusMark />
            <h1 id="hero-heading" className="mt-5 font-serif text-4xl leading-[1.12] tracking-[-0.025em] text-[#173A2F] sm:text-5xl lg:text-[3.65rem]">
              Make room for the moments that matter.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#555D56] sm:text-lg">
              A thoughtful planning home for professionals managing many celebrations—and the couples planning their own.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/auth" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15513E] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103F31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B18B3B] focus-visible:ring-offset-2">
                Begin planning
              </Link>
              <Link to="/auth" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#AEB8AE] bg-transparent px-7 py-3 text-sm font-semibold text-[#234538] transition hover:border-[#15513E] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B18B3B] focus-visible:ring-offset-2">
                Log in to your workspace
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-[#626B63]">
              One considered space for timelines, trusted vendors, shared decisions, and inspiration.
            </p>
          </div>

          <figure className="relative min-h-[300px] overflow-hidden rounded-[1.75rem] bg-[#DCE5DC] shadow-[0_24px_60px_rgba(29,55,42,0.14)] sm:min-h-[390px] lg:min-h-[500px]">
            <img
              src={heroImage}
              alt="A softly lit wedding ceremony surrounded by natural details"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_42%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#122D23]/55 via-transparent to-[#122D23]/5" />
            <figcaption className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
              <span className="max-w-xs font-serif text-xl leading-snug sm:text-2xl">A beautiful day, with a little more breathing room.</span>
              <span className="hidden shrink-0 rounded-full border border-white/50 bg-[#173A2F]/35 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm sm:inline-flex">Plan with intention</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="approach" aria-labelledby="approach-heading" className="scroll-mt-24 border-y border-[#E5E0D5] bg-[#FFFEFB]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[0.7fr_1.3fr] md:items-center md:px-8 md:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#75602F]">A shared foundation</p>
            <h2 id="approach-heading" className="mt-3 font-serif text-3xl leading-tight text-[#173A2F] sm:text-4xl">Every wedding has its own space.</h2>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 sm:gap-10">
            <article className="border-l-2 border-[#C4A65F] pl-5">
              <h3 className="font-serif text-xl text-[#243D32]">For planners</h3>
              <p className="mt-2 text-sm leading-6 text-[#59615B]">Keep multiple weddings in view, with a dedicated workspace and a clear picture of what needs attention.</p>
            </article>
            <article className="border-l-2 border-[#8EA895] pl-5">
              <h3 className="font-serif text-xl text-[#243D32]">For couples</h3>
              <p className="mt-2 text-sm leading-6 text-[#59615B]">Join your own private wedding workspace to follow the plans, share decisions, and enjoy the ideas taking shape.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="features" aria-labelledby="features-heading" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#75602F]">The experience</p>
            <h2 id="features-heading" className="mt-3 font-serif text-3xl leading-tight text-[#173A2F] sm:text-4xl">The details, held with care.</h2>
            <p className="mt-4 text-base leading-7 text-[#59615B]">
              The practical tools to keep planning moving, without losing sight of the celebration at the heart of it.
            </p>
          </div>

          <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.number} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#D9DED6] py-6 sm:py-7">
                <span className="pt-1 text-xs font-semibold tracking-[0.12em] text-[#8A713A]">{feature.number}</span>
                <div>
                  <h3 className="font-serif text-xl text-[#213E31]">{feature.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#59615B]">{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="border-y border-[#E6E1D6] bg-[#F1F2EB]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#75602F]">A gentle rhythm</p>
            <h2 id="steps-heading" className="mt-3 font-serif text-3xl leading-tight text-[#173A2F] sm:text-4xl">From first details to the day itself.</h2>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
            <li className="border-t border-[#C5CFC5] pt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A713A]">First</span>
              <h3 className="mt-3 font-serif text-xl text-[#213E31]">Gather the essentials</h3>
              <p className="mt-2 text-sm leading-6 text-[#59615B]">Bring the wedding details, date, and priorities into one considered place.</p>
            </li>
            <li className="border-t border-[#C5CFC5] pt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A713A]">Then</span>
              <h3 className="mt-3 font-serif text-xl text-[#213E31]">Shape the plan</h3>
              <p className="mt-2 text-sm leading-6 text-[#59615B]">Coordinate milestones, vendors, and agreements as the celebration comes together.</p>
            </li>
            <li className="border-t border-[#C5CFC5] pt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A713A]">Together</span>
              <h3 className="mt-3 font-serif text-xl text-[#213E31]">Stay close to the vision</h3>
              <p className="mt-2 text-sm leading-6 text-[#59615B]">Keep the right people connected and make space for thoughtful decisions.</p>
            </li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="inspiration-heading" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.8fr] md:items-center md:px-8 md:py-24">
        <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] bg-[#DCE5DC] sm:min-h-[360px]">
          <img
            src={heroImage}
            alt="Wedding inspiration in soft ivory and garden green"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#122D23]/45 to-transparent" />
          <p className="absolute bottom-5 left-6 font-serif text-2xl text-white">A vision, shared.</p>
        </div>
        <div className="py-2 md:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#75602F]">Mood & inspiration</p>
          <h2 id="inspiration-heading" className="mt-3 font-serif text-3xl leading-tight text-[#173A2F] sm:text-4xl">Let the feeling lead.</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#59615B]">
            Gather the colors, flowers, and thoughtful details that make the celebration feel unmistakably yours.
          </p>
          <div className="mt-7 flex max-w-xs gap-3" aria-label="A palette of garden green, ivory, and muted gold">
            <span className="h-9 flex-1 rounded-full bg-[#456A52]" />
            <span className="h-9 flex-1 rounded-full bg-[#AFC1A8]" />
            <span className="h-9 flex-1 rounded-full border border-[#E3DED3] bg-[#FAF8F3]" />
            <span className="h-9 flex-1 rounded-full bg-[#C8AE71]" />
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t border-[#E6E1D6] bg-[#FFFEFB]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#75602F]">A few things you may wonder</p>
            <h2 id="faq-heading" className="mt-3 font-serif text-3xl leading-tight text-[#173A2F] sm:text-4xl">Simple answers, considered.</h2>
            <dl className="mt-8 divide-y divide-[#E2E3DC] border-y border-[#E2E3DC]">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-5">
                  <dt className="font-serif text-lg text-[#243D32]">{faq.question}</dt>
                  <dd className="mt-2 max-w-2xl text-sm leading-6 text-[#59615B]">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="self-start rounded-[1.5rem] bg-[#173F32] p-7 text-white sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E5C77B]">Here to help</p>
            <h3 className="mt-3 font-serif text-2xl">Need support or a demo?</h3>
            <p className="mt-3 text-sm leading-6 text-white/80">Send your inquiry and we’ll respond within 24–48 hours.</p>
            <a href="mailto:hello@everafterportal.com" className="mt-7 inline-flex min-h-11 items-center rounded-full border border-white/40 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B]">
              hello@everafterportal.com
            </a>
          </aside>
        </div>
      </section>

      <section aria-labelledby="closing-heading" className="bg-[#FAF8F3] px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#C7AE72]/50 bg-[#123C30] px-6 py-12 text-center sm:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E5C77B]">Your next chapter starts here</p>
          <h2 id="closing-heading" className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">A little more calm in every wedding plan.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Bring the plans together, stay connected, and keep the celebration in focus.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/auth" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E5C77B] px-7 py-3 text-sm font-semibold text-[#19382E] transition hover:bg-[#F0D897] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123C30]">
              Get started
            </Link>
            <Link to="/auth" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C77B]">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  </div>
);
