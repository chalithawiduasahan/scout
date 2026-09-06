import { useState } from 'react';
import { Compass, ChevronDown } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const faqs = [
  {
    q: 'How does Scout find real businesses?',
    a: 'The discovery_agent uses Tavily web search to find verifiable businesses in your target niche and location. Every lead is a real, operating company with an online footprint — no scraped directories or stale databases.',
  },
  {
    q: 'What does the "Show, Don\'t Tell" engine actually do?',
    a: 'Scout uses Playwright browser automation to generate visual proof: it fills out a live Tally form as a realistic customer lead, the submission pings your Airtable CRM, and it generates an HTML auto-reply email mockup. Each step is screenshotted and attached to the cold email.',
  },
  {
    q: 'Which AI models power the agents?',
    a: 'Scout is built on the Strands Agents SDK with Claude Haiku running on AWS Bedrock. The multi-agent pipeline includes a discovery_agent (finds businesses), research_agent (identifies bottlenecks), and outreach_agent (drafts the email).',
  },
  {
    q: 'Do I have control over what gets sent?',
    a: "Absolutely. Nothing sends without your approval. Every lead, screenshot, and email draft surfaces on your dashboard. You can edit the email copy, review the evidence, and only hit Approve & Send when you're satisfied.",
  },
  {
    q: 'How are emails delivered?',
    a: 'When you approve, outreach.py sends the email via AWS SES with the three screenshots attached. Delivery is trackable and reliable.',
  },
  {
    q: 'Can Scout work with any niche or location?',
    a: 'Yes. Scout adapts to whatever niche and location you enter — from wedding planners in Colombo to dentists in Mumbai. The agents tailor their research and pitch to the specific business.',
  },
];

function FAQItem({ faq, i }: { faq: typeof faqs[0]; i: number }) {
  const [open, setOpen] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`glass overflow-hidden rounded-2xl transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${i * 50}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{faq.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-ink-300">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Questions, <span className="text-gradient-scout">answered</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} faq={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-scout-400 to-aqua-500">
              <Compass className="h-4 w-4 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-white">Scout</span>
          </div>

          <div className="flex gap-6 text-sm text-ink-400">
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
            <a href="#proof-engine" className="transition-colors hover:text-white">Proof engine</a>
            <a href="#dashboard" className="transition-colors hover:text-white">Dashboard</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
          </div>

          <p className="text-xs text-ink-500">
            Built with Strands Agents SDK · Claude Haiku · AWS Bedrock
          </p>
        </div>
      </div>
    </footer>
  );
}
