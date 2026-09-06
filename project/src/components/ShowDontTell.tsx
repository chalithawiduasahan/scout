import { useState } from 'react';
import { FileText, Database, Mail, MonitorPlay, Bot, Check, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const screenshots = [
  {
    id: 0,
    icon: FileText,
    label: 'Tally form submission',
    sub: 'Playwright fills a live booking inquiry',
    color: 'from-aqua-400 to-aqua-600',
    accent: 'text-aqua-400',
    mock: <TallyMockup />,
  },
  {
    id: 1,
    icon: Database,
    label: 'Airtable CRM — new lead',
    sub: 'The submission lands in your database',
    color: 'from-scout-400 to-scout-600',
    accent: 'text-scout-400',
    mock: <AirtableMockup />,
  },
  {
    id: 2,
    icon: Mail,
    label: 'Auto-reply email mockup',
    sub: 'Instant HTML email, ready to send',
    color: 'from-amber-400 to-amber-500',
    accent: 'text-amber-400',
    mock: <EmailMockup />,
  },
];

function TallyMockup() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-aqua-500/20 flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-aqua-400" />
          </div>
          <span className="text-xs font-semibold text-ink-100">Booking Inquiry</span>
        </div>
        <span className="text-[10px] text-ink-400">tally.so/r/wedding-planner</span>
      </div>
      <div>
        <div className="text-[10px] uppercase text-ink-400">Full name</div>
        <div className="mt-1 rounded-lg border border-aqua-400/30 bg-aqua-400/5 px-3 py-2 text-xs text-ink-100">
          Sarah Wijesinghe
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase text-ink-400">Email</div>
        <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink-100">
          sarah.w@gmail.com
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase text-ink-400">Event type & guests</div>
        <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink-100">
          Wedding — 120 guests, Dec 14
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-aqua-500/10 px-3 py-2">
        <Bot className="h-3.5 w-3.5 text-aqua-400" />
        <span className="text-[10px] text-aqua-300">Playwright typing...</span>
        <span className="ml-auto flex gap-1">
          <span className="h-1 w-1 animate-bounce rounded-full bg-aqua-400" style={{ animationDelay: '0s' }} />
          <span className="h-1 w-1 animate-bounce rounded-full bg-aqua-400" style={{ animationDelay: '0.15s' }} />
          <span className="h-1 w-1 animate-bounce rounded-full bg-aqua-400" style={{ animationDelay: '0.3s' }} />
        </span>
      </div>
      <button className="w-full rounded-lg bg-gradient-to-r from-aqua-400 to-aqua-600 py-2 text-xs font-semibold text-ink-950">
        Submit
      </button>
    </div>
  );
}

function AirtableMockup() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-scout-500/20 flex items-center justify-center">
            <Database className="h-3.5 w-3.5 text-scout-400" />
          </div>
          <span className="text-xs font-semibold text-ink-100">Leads · CRM</span>
        </div>
        <span className="rounded-full bg-scout-500/15 px-2 py-0.5 text-[10px] font-semibold text-scout-300">
          +1 new
        </span>
      </div>
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <div className="grid grid-cols-3 gap-px bg-white/5 text-[10px] font-medium text-ink-400">
          <div className="bg-ink-850 px-2 py-1.5">Name</div>
          <div className="bg-ink-850 px-2 py-1.5">Source</div>
          <div className="bg-ink-850 px-2 py-1.5">Status</div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/5 text-[10px]">
          <div className="bg-ink-900 px-2 py-2 text-ink-100">Sarah W.</div>
          <div className="bg-ink-900 px-2 py-2 text-ink-300">Tally form</div>
          <div className="bg-ink-900 px-2 py-2">
            <span className="rounded-full bg-scout-500/15 px-1.5 py-0.5 text-scout-300">Auto-replied</span>
          </div>
        </div>
        {[
          { n: 'John P.', s: 'Tally form', st: 'Auto-replied' },
          { n: 'Amara D.', s: 'Tally form', st: 'Auto-replied' },
        ].map((r) => (
          <div key={r.n} className="grid grid-cols-3 gap-px bg-white/5 text-[10px] opacity-60">
            <div className="bg-ink-900 px-2 py-2 text-ink-200">{r.n}</div>
            <div className="bg-ink-900 px-2 py-2 text-ink-400">{r.s}</div>
            <div className="bg-ink-900 px-2 py-2">
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-ink-300">{r.st}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-scout-500/10 px-3 py-2">
        <Check className="h-3.5 w-3.5 text-scout-400" />
        <span className="text-[10px] text-scout-300">Lead captured via crm.py webhook</span>
      </div>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-amber-500/20 flex items-center justify-center">
            <Mail className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-ink-100">Auto-Reply</span>
        </div>
        <span className="text-[10px] text-ink-400">instant</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-[10px] text-ink-400">Subject</div>
        <div className="mt-0.5 text-xs font-medium text-ink-100">
          Re: Your wedding inquiry — we'd love to help!
        </div>
      </div>
      <div className="space-y-1.5 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-xs text-ink-100">Hi Sarah,</div>
        <div className="text-[11px] leading-relaxed text-ink-300">
          Thank you for reaching out! We received your inquiry for a 120-guest
          wedding on December 14th. Here's a quick overview of our packages...
        </div>
        <div className="text-[11px] leading-relaxed text-ink-300">
          We'll follow up within 24 hours with a detailed quote. In the meantime,
          feel free to check our portfolio.
        </div>
        <div className="pt-1 text-xs text-ink-100">— The Wedding Co. Team</div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
        <Check className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[10px] text-amber-300">HTML mockup generated & screenshotted</span>
      </div>
    </div>
  );
}

export default function ShowDontTell() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>();
  const ActiveMock = screenshots[active].mock;

  return (
    <section id="proof-engine" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
            <MonitorPlay className="h-3.5 w-3.5 text-amber-400" />
            The "Show, Don't Tell" engine
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Not just talk. <span className="text-gradient-warm">Visual proof.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-300">
            Scout uses Playwright to build undeniable evidence — a form filled, a
            database updated, an email drafted — then attaches the screenshots to
            your pitch.
          </p>
        </div>

        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: selector list */}
          <div className="space-y-4">
            {screenshots.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'glass-strong border-white/15 scale-[1.02]'
                      : 'glass border-white/5 hover:border-white/10'
                  } ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-scout-400 to-aqua-500" />
                  )}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                      <Icon className="h-5 w-5 text-ink-950" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-ink-200'}`}>
                        {s.label}
                      </div>
                      <div className="text-xs text-ink-400">{s.sub}</div>
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-all ${isActive ? `${s.accent} translate-x-0 opacity-100` : 'text-ink-500 -translate-x-2 opacity-0'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: mockup display */}
          <div className="relative perspective-1000">
            <div
              key={active}
              className="glass-strong relative overflow-hidden rounded-2xl animate-scale-in"
              style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5), 0 0 40px -10px rgba(16,185,129,0.2)' }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-scout-400/60" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-ink-400">
                  {active === 0 && 'tally.so/forms/wedding-inquiry'}
                  {active === 1 && 'airtable.com/leads'}
                  {active === 2 && 'preview.auto-reply.html'}
                </div>
                <div className={`text-[10px] font-medium ${screenshots[active].accent}`}>
                  screenshot.png
                </div>
              </div>
              {/* Mockup content */}
              <div className="min-h-[340px] bg-ink-900/50">{ActiveMock}</div>
            </div>

            {/* Floating glow */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-scout-500/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
