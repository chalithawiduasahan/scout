import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Proof engine', href: '#proof-engine' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar({ onStart }: { onStart: (name: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const progress = useScrollProgress();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleStartScoutingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setShowDialog(true);
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userName.trim()) return;
    setShowDialog(false);
    onStart(userName);
  };

  return (
    <>
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

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? 'glass-strong py-3' : 'py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="#" className="group flex items-center gap-2.5">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Scout<span className="text-scout-400">.</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink-300 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <button
              onClick={handleStartScoutingClick}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-scout-400 to-aqua-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              <span className="relative z-10">Start scouting</span>
            </button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-ink-200 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Scroll progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-scout-400 to-aqua-500 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 top-0 h-full w-72 p-6 pt-24">
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-ink-200 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={handleStartScoutingClick}
                className="mt-4 rounded-full bg-gradient-to-r from-scout-400 to-aqua-500 px-5 py-3 text-center text-sm font-semibold text-ink-950"
              >
                Start scouting
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}