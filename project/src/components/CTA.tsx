import { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section id="cta" className="relative py-32">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <div
          className={`relative overflow-hidden rounded-3xl glass-strong p-12 text-center transition-all duration-1000 lg:p-20 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Glow */}
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-scout-500/20 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-aqua-500/15 blur-[100px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Start your first scout run
            </div>

            <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop researching.
              <br />
              <span className="text-gradient-scout">Start proving.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-300">
              Enter your email and we'll send you an invite. Your first 10 scout
              runs are on us.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm text-white placeholder:text-ink-400 focus:border-scout-400/50 focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-scout-400 to-aqua-500 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105 active:scale-95"
              >
                {sent ? (
                  <>
                    <Check className="h-4 w-4" />
                    You're in
                  </>
                ) : (
                  <>
                    Get invite
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-xs text-ink-400">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
