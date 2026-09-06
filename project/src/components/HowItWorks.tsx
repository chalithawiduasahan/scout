import { Target, Search, FileSearch, Mail, Send } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const steps = [
  {
    icon: Target,
    title: 'Targeting',
    subtitle: 'The Input',
    desc: 'Through a sleek dark-mode frontend, the user punches in a niche and a location — like "wedding planners in Colombo." That query becomes the seed for everything that follows.',
    color: 'from-scout-400 to-scout-600',
    glow: 'bg-scout-500/20',
  },
  {
    icon: Search,
    title: 'Discovery',
    subtitle: 'Finding real businesses',
    desc: 'The discovery_agent uses Tavily to find verifiable businesses in that area. No scraped directories — every lead is a real, operating company with an online footprint.',
    color: 'from-aqua-400 to-aqua-600',
    glow: 'bg-aqua-500/20',
  },
  {
    icon: FileSearch,
    title: 'Research',
    subtitle: 'Identifying the bottleneck',
    desc: 'The research_agent scans their online presence to gauge scale and pinpoint a specific manual bottleneck — like responding to booking inquiries by hand.',
    color: 'from-amber-400 to-amber-500',
    glow: 'bg-amber-500/20',
  },
  {
    icon: Mail,
    title: 'The Pitch',
    subtitle: 'Show, don\'t tell',
    desc: 'The outreach_agent drafts a personalized cold email that calls out the bottleneck and references three attached screenshots — "I noticed you do this manually, so I already built a working automation for you."',
    color: 'from-scout-400 to-aqua-500',
    glow: 'bg-scout-500/20',
  },
  {
    icon: Send,
    title: 'Review & Send',
    subtitle: 'You stay in control',
    desc: 'Everything surfaces on your dashboard. Review the business, inspect the screenshots, edit the email copy, and the moment you hit Approve & Send, outreach.py fires it off via AWS SES with the screenshots attached.',
    color: 'from-aqua-400 to-scout-500',
    glow: 'bg-aqua-500/20',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-8 ${isEven ? '' : 'flex-row-reverse'}`}
    >
      {/* Card */}
      <div
        className={`flex-1 transition-all duration-700 ${
          inView
            ? 'opacity-100 translate-y-0'
            : `opacity-0 ${isEven ? 'translate-x-[-40px]' : 'translate-x-[40px]'}`
        }`}
      >
        <div className="glass-strong group relative overflow-hidden rounded-2xl p-7 transition-transform hover:scale-[1.02]">
          {/* Glow */}
          <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full ${step.glow} blur-3xl opacity-50`} />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                <Icon className="h-6 w-6 text-ink-950" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-400">
                  Step {index + 1} · {step.subtitle}
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{step.title}</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-300">{step.desc}</p>
          </div>
        </div>
      </div>

      {/* Center node */}
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full ${step.glow} blur-xl transition-opacity duration-700 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-full glass-strong transition-transform duration-700 ${
            inView ? 'scale-100' : 'scale-50'
          }`}
        >
          <span className="font-display text-xl font-bold text-gradient-scout">
            {index + 1}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
            <Target className="h-3.5 w-3.5 text-scout-400" />
            The full pipeline
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            From a single query to a <span className="text-gradient-scout">sent email</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-300">
            Five steps. Zero manual research. Scout handles discovery, proof-building, and outreach — you just review and approve.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-scout-500/0 via-scout-500/30 to-scout-500/0" />

          <div className="space-y-16">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
