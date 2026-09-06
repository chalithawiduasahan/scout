import { Bot, Search, Mail, Database, FileText, Send, Zap, Shield, Globe } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const features = [
  {
    icon: Bot,
    title: 'Multi-agent pipeline',
    desc: 'discovery_agent, research_agent, and outreach_agent work in sequence — each handing off to the next.',
    color: 'text-scout-400',
    bg: 'bg-scout-500/10',
  },
  {
    icon: Search,
    title: 'Tavily-powered discovery',
    desc: 'Real web search finds verifiable businesses — no stale directories, no fake leads.',
    color: 'text-aqua-400',
    bg: 'bg-aqua-500/10',
  },
  {
    icon: FileText,
    title: 'Playwright browser automation',
    desc: 'Headless browsers fill live forms, capture screenshots, and generate HTML mockups as visual proof.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Database,
    title: 'Airtable CRM sync',
    desc: 'crm.py connects Tally submissions to your Airtable base automatically — leads appear in real time.',
    color: 'text-scout-400',
    bg: 'bg-scout-500/10',
  },
  {
    icon: Mail,
    title: 'AWS SES delivery',
    desc: 'outreach.py sends the final email with screenshots attached via Amazon SES — trackable and reliable.',
    color: 'text-aqua-400',
    bg: 'bg-aqua-500/10',
  },
  {
    icon: Zap,
    title: 'Strands Agents SDK',
    desc: 'Built on the Strands framework with Claude Haiku on AWS Bedrock — fast, cheap, and capable.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Human-in-the-loop',
    desc: 'Nothing sends without your approval. Review every email, edit every word, approve only when ready.',
    color: 'text-scout-400',
    bg: 'bg-scout-500/10',
  },
  {
    icon: Globe,
    title: 'Any niche, any location',
    desc: 'From wedding planners in Colombo to dentists in Mumbai — Scout adapts to whatever you target.',
    color: 'text-aqua-400',
    bg: 'bg-aqua-500/10',
  },
];

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const Icon = f.icon;

  return (
    <div
      ref={ref}
      className={`group glass relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:glass-strong hover:scale-[1.03] ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${i * 60}ms` }}
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${f.bg} blur-2xl opacity-50 transition-opacity group-hover:opacity-100`} />
      <div className="relative">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} transition-transform group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${f.color}`} strokeWidth={2} />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-white">{f.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{f.desc}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
            <Zap className="h-3.5 w-3.5 text-scout-400" />
            Built for scale
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything in the <span className="text-gradient-scout">pipeline</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-300">
            A complete stack — from discovery to delivery — wired together so you
            can go from search to sent in minutes.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
