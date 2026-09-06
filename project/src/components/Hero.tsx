import { useState } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
  Mail,
  Database,
  FileText,
  Bot,
  X 
} from 'lucide-react';
import { useMousePosition } from '@/hooks/useMousePosition';

export default function Hero({ onStart }: { onStart: (name: string) => void }) {
  const mouse = useMousePosition();
  const [niche, setNiche] = useState('wedding planners');
  const [location, setLocation] = useState('Colombo');
  const [submitted, setSubmitted] = useState(false);
  
  const [showDialog, setShowDialog] = useState(false);
  const [userName, setUserName] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userName.trim()) return;
    setShowDialog(false);
    onStart(userName); 
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" 
            onClick={() => setShowDialog(false)} 
          />
          
          <div className="glass-strong relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl animate-fade-up">
            <button 
              onClick={() => setShowDialog(false)}
              className="absolute right-4 top-4 text-ink-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="mb-2 font-display text-2xl font-bold text-white">Who is scouting?</h3>
            <p className="mb-6 text-sm text-ink-300">Enter your name before we fire up the agents.</p>
            
            <form onSubmit={handleFinalSubmit}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-ink-500 focus:border-scout-400 focus:outline-none"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!userName.trim()}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-scout-400 to-aqua-500 py-3 font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scout-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-scout-400" />
              </span>
              Powered by Strands Agents SDK + Claude Haiku on AWS Bedrock
            </div>

            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              Find leads.
              <br />
              <span className="text-gradient-scout">Prove value.</span>
              <br />
              Send the pitch.
            </h1>

            <p
              className="mt-6 max-w-lg text-lg leading-relaxed text-ink-300 animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              Scout discovers real businesses, builds a working automation as
              proof, and drafts a personalized cold email with visual evidence —
              all before you hit send.
            </p>

            <form
              onSubmit={handleInitialSubmit}
              className="mt-8 max-w-lg animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="glass-strong rounded-2xl p-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2 px-3">
                    <Search className="h-4 w-4 shrink-0 text-scout-400" />
                    <input
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Niche"
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-ink-400 focus:outline-none"
                    />
                  </div>
                  <div className="hidden h-8 w-px bg-white/10 sm:block" />
                  <div className="flex flex-1 items-center gap-2 px-3">
                    <MapPin className="h-4 w-4 shrink-0 text-aqua-400" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location"
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-ink-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-scout-400 to-aqua-500 px-5 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    {submitted ? (
                      <>
                        <Check className="h-4 w-4" />
                        Scouting...
                      </>
                    ) : (
                      <>
                        Scout
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Try: "wedding planners in Colombo" or "dentists in Mumbai"
              </p>
            </form>

            <div className="mt-10 flex gap-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {[
                { v: '3', l: 'Visual proofs' },
                { v: '<2min', l: 'Per lead' },
                { v: '100%', l: 'Personalized' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-white">{s.v}</div>
                  <div className="text-xs text-ink-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative perspective-2000 h-[520px]">
            <div
              className="relative h-full w-full"
              style={{
                transform: `rotateY(${mouse.x * 8}deg) rotateX(${mouse.y * -6}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <div
                className="glass-strong absolute left-[8%] top-[6%] w-[78%] rounded-2xl p-5"
                style={{
                  transform: 'translateZ(20px) rotate(-4deg)',
                  opacity: 0.5,
                }}
              >
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Mail className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium text-ink-300">Auto-reply email</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-3/4 rounded-full bg-white/10" />
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="h-2 w-5/6 rounded-full bg-white/5" />
                </div>
              </div>

              <div
                className="glass-strong absolute left-[4%] top-[18%] w-[80%] rounded-2xl p-5"
                style={{
                  transform: 'translateZ(60px) rotate(2deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-scout-400" />
                    <span className="text-xs font-medium text-ink-200">Airtable CRM</span>
                  </div>
                  <span className="rounded-full bg-scout-500/15 px-2 py-0.5 text-[10px] font-semibold text-scout-300">
                    New lead
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {[
                    { k: 'Name', v: 'Sarah Wijesinghe' },
                    { k: 'Email', v: 'sarah.w@gmail.com' },
                    { k: 'Event date', v: 'Dec 14, 2025' },
                    { k: 'Status', v: 'Auto-replied' },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between text-xs">
                      <span className="text-ink-400">{row.k}</span>
                      <span className="font-medium text-ink-100">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="glass-strong absolute left-[10%] top-[34%] w-[76%] rounded-2xl p-5"
                style={{
                  transform: 'translateZ(100px) rotate(-1deg)',
                }}
              >
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <FileText className="h-4 w-4 text-aqua-400" />
                  <span className="text-xs font-medium text-ink-200">Tally form — Booking inquiry</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-400">Full name</div>
                    <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink-100">
                      Sarah Wijesinghe
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-400">Event type</div>
                    <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink-100">
                      Wedding — 120 guests
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-scout-500/10 px-3 py-2 text-xs text-scout-300">
                    <Bot className="h-3.5 w-3.5" />
                    Playwright is filling this form...
                  </div>
                </div>
              </div>

              <div
                className="glass absolute right-[2%] top-[2%] flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  transform: `translateZ(140px) translateX(${mouse.x * 15}px) translateY(${mouse.y * 15}px)`,
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-medium text-ink-200">discovery_agent</span>
              </div>
              <div
                className="glass absolute right-[0%] top-[52%] flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  transform: `translateZ(140px) translateX(${mouse.x * -12}px) translateY(${mouse.y * -12}px)`,
                }}
              >
                <Bot className="h-3.5 w-3.5 text-scout-400" />
                <span className="text-[10px] font-medium text-ink-200">research_agent</span>
              </div>
              <div
                className="glass absolute left-[0%] bottom-[2%] flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  transform: `translateZ(140px) translateX(${mouse.x * 10}px) translateY(${mouse.y * 10}px)`,
                }}
              >
                <Mail className="h-3.5 w-3.5 text-aqua-400" />
                <span className="text-[10px] font-medium text-ink-200">outreach_agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-ink-400">
          <span className="text-xs">Scroll to explore</span>
          <div className="h-10 w-6 rounded-full border border-white/15">
            <div className="mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-scout-400" />
          </div>
        </div>
      </div>
    </section>
  );
}