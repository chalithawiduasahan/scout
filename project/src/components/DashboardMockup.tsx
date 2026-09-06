import { useState } from 'react';
import {
  Building2,
  MapPin,
  Star,
  FileText,
  Database,
  Mail,
  Check,
  Send,
  Edit3,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useInView } from '@/hooks/useInView';

export default function DashboardMockup() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [approved, setApproved] = useState(false);

  return (
    <section id="dashboard" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
            <Users className="h-3.5 w-3.5 text-aqua-400" />
            Your command center
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Review everything on <span className="text-gradient-scout">one dashboard</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-300">
            The target business, the generated screenshots, the email copy — all
            in one place. Edit, then approve.
          </p>
        </div>

        <div
          ref={ref}
          className={`transition-all duration-1000 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div
            className="glass-strong relative overflow-hidden rounded-3xl p-6 lg:p-8"
            style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 60px -20px rgba(16,185,129,0.15)' }}
          >
            {/* Dashboard header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-scout-400 to-aqua-500">
                  <Building2 className="h-5 w-5 text-ink-950" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Scout Dashboard</div>
                  <div className="text-xs text-ink-400">Lead #042 — Ready for review</div>
                </div>
              </div>
              <div className="hidden gap-3 sm:flex">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-ink-300">
                  <Clock className="h-3.5 w-3.5 text-scout-400" />
                  Generated in 1m 42s
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-scout-500/10 px-3 py-1.5 text-xs text-scout-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  High intent
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: business info */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/5 bg-ink-900/50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-scout-400/20 text-lg font-bold text-amber-400">
                      EW
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Eternal Weddings Co.</div>
                      <div className="flex items-center gap-1 text-xs text-ink-400">
                        <MapPin className="h-3 w-3" />
                        Colombo, Sri Lanka
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-xs text-ink-400">4.8 · 127 reviews</span>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                    {[
                      { k: 'Scale', v: 'Mid-size (8 planners)' },
                      { k: 'Bottleneck', v: 'Manual booking replies' },
                      { k: 'Avg response', v: '~6 hours' },
                    ].map((r) => (
                      <div key={r.k} className="flex justify-between text-xs">
                        <span className="text-ink-400">{r.k}</span>
                        <span className="font-medium text-ink-100">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screenshots preview */}
                <div className="rounded-2xl border border-white/5 bg-ink-900/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-aqua-400" />
                    <span className="text-xs font-semibold text-ink-200">Attached proofs (3)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: FileText, c: 'text-aqua-400', b: 'border-aqua-400/20' },
                      { icon: Database, c: 'text-scout-400', b: 'border-scout-400/20' },
                      { icon: Mail, c: 'text-amber-400', b: 'border-amber-400/20' },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={i}
                          className={`group flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border ${s.b} bg-white/5 transition-all hover:scale-105 hover:bg-white/10`}
                        >
                          <Icon className={`h-5 w-5 ${s.c}`} />
                          <span className="text-[8px] text-ink-400">shot_{i + 1}.png</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: email editor */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-white/5 bg-ink-900/50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-scout-400" />
                      <span className="text-xs font-semibold text-ink-200">Cold email draft</span>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-ink-300 transition-colors hover:bg-white/10 hover:text-white">
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-ink-400">To</div>
                      <div className="mt-0.5 text-xs text-ink-100">hello@eternalweddings.lk</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-ink-400">Subject</div>
                      <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink-100">
                        I built a working automation for your booking inquiries
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-ink-400">Body</div>
                      <div className="mt-1 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-ink-200">
                        <p>Hi team at Eternal Weddings,</p>
                        <p>
                          I noticed you're a well-reviewed wedding planning team
                          in Colombo — but you're responding to booking inquiries
                          manually, averaging about 6 hours per reply. That delay
                          costs you leads.
                        </p>
                        <p>
                          So I built a working automation for you. I filled out a
                          live Tally form as a realistic customer, the submission
                          landed in an Airtable CRM automatically, and an instant
                          auto-reply email went out — all within seconds. I've
                          attached screenshots of each step.
                        </p>
                        <p>
                          If you'd like, I can set this up for your business in
                          under an hour. Worth a quick call?
                        </p>
                        <p className="text-ink-100">— [Your name]</p>
                      </div>
                    </div>
                  </div>

                  {/* Approve bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <Check className="h-3.5 w-3.5 text-scout-400" />
                      3 screenshots attached · AWS SES ready
                    </div>
                    <button
                      onClick={() => setApproved(true)}
                      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                        approved
                          ? 'bg-scout-500/15 text-scout-300'
                          : 'bg-gradient-to-r from-scout-400 to-aqua-500 text-ink-950 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {approved ? (
                        <>
                          <Check className="h-4 w-4" />
                          Sent via SES
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Approve & Send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
