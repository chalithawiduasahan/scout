import { useEffect, useState, useRef } from 'react';
import { Radar, Building2, MapPin } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const blips = [
  { angle: 35, dist: 0.55, name: 'Eternal Weddings Co.', niche: 'Wedding planner' },
  { angle: 120, dist: 0.72, name: 'Smile Dental Clinic', niche: 'Dentist' },
  { angle: 200, dist: 0.4, name: 'Urban Fitness Studio', niche: 'Gym' },
  { angle: 280, dist: 0.82, name: 'Bloom Florists', niche: 'Florist' },
  { angle: 75, dist: 0.88, name: 'Ceylon Tours', niche: 'Tour operator' },
  { angle: 160, dist: 0.6, name: 'Luxe Spa & Wellness', niche: 'Spa' },
  { angle: 340, dist: 0.5, name: 'Pixel Photography', niche: 'Photographer' },
];

export default function RadarScout() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [sweepAngle, setSweepAngle] = useState(0);
  const [activeBlips, setActiveBlips] = useState<Set<number>>(new Set());
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;
    lastRef.current = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastRef.current) / 1000;
      lastRef.current = now;

      setSweepAngle((prev) => {
        const next = (prev + delta * 55) % 360;

        setActiveBlips((prevSet) => {
          const nextSet = new Set(prevSet);
          blips.forEach((b, i) => {
            const blipAngle = (b.angle + 360) % 360;
            const diff = ((blipAngle - next + 360) % 360);
            if (diff < 10) {
              nextSet.add(i);
            } else if (diff > 35) {
              nextSet.delete(i);
            }
          });
          return nextSet;
        });

        return next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView]);

  const size = 420;
  const center = size / 2;
  const maxRadius = size / 2 - 20;

  return (
    <section className="relative py-24">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-ink-200">
            <Radar className="h-3.5 w-3.5 text-scout-400" />
            Scanning the field
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Always <span className="text-gradient-scout">scouting</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-300">
            Scout continuously sweeps your target market, detecting real
            businesses and flagging their bottlenecks as they appear on the radar.
          </p>
        </div>

        {/* 3D-tilted radar */}
        <div
          className={`relative mx-auto transition-all duration-1000 ${
            inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ maxWidth: size, perspective: '1200px' }}
        >
          <div
            className="relative mx-auto aspect-square w-full"
            style={{
              transform: 'rotateX(52deg) rotateZ(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Glow under radar */}
            <div className="absolute inset-0 rounded-full bg-scout-500/10 blur-[60px]" />

            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.12)" />
                  <stop offset="60%" stopColor="rgba(16,185,129,0.04)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0)" />
                  <stop offset="60%" stopColor="rgba(16,185,129,0.12)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.45)" />
                </linearGradient>
              </defs>

              {/* Background fill */}
              <circle cx={center} cy={center} r={maxRadius} fill="url(#radarBg)" />

              {/* Concentric rings */}
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <circle
                  key={r}
                  cx={center}
                  cy={center}
                  r={maxRadius * r}
                  fill="none"
                  stroke="rgba(16,185,129,0.18)"
                  strokeWidth="1"
                />
              ))}

              {/* Crosshair lines */}
              <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(16,185,129,0.12)" strokeWidth="1" />
              <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(16,185,129,0.12)" strokeWidth="1" />

              {/* Sweep beam */}
              <g style={{ transform: `rotate(${sweepAngle}deg)`, transformOrigin: `${center}px ${center}px` }}>
                <path
                  d={`M ${center} ${center} L ${center + maxRadius} ${center} A ${maxRadius} ${maxRadius} 0 0 0 ${center + maxRadius * Math.cos(-Math.PI / 6)} ${center + maxRadius * Math.sin(-Math.PI / 6)} Z`}
                  fill="url(#sweepGrad)"
                />
                <line
                  x1={center}
                  y1={center}
                  x2={center + maxRadius}
                  y2={center}
                  stroke="rgba(52,211,153,0.7)"
                  strokeWidth="1.5"
                />
              </g>

              {/* Center pulsing dot */}
              <circle cx={center} cy={center} r="4" fill="#34d399" />
              <circle cx={center} cy={center} r="4" fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth="1">
                <animate attributeName="r" values="4;16;4" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Blips */}
              {blips.map((b, i) => {
                const rad = (b.angle * Math.PI) / 180;
                const x = center + maxRadius * b.dist * Math.cos(rad);
                const y = center + maxRadius * b.dist * Math.sin(rad);
                const isActive = activeBlips.has(i);
                return (
                  <g key={i}>
                    {isActive && (
                      <circle cx={x} cy={y} r="3" fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth="1">
                        <animate attributeName="r" values="3;14;3" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 4.5 : 2.5}
                      fill={isActive ? '#34d399' : 'rgba(52,211,153,0.25)'}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Floating labels — rendered flat (not tilted) so text is readable */}
          <div className="pointer-events-none absolute inset-0">
            {blips.map((b, i) => {
              const rad = (b.angle * Math.PI) / 180;
              // Approximate position on the tilted disc projected to screen
              const xPct = 50 + 42 * b.dist * Math.cos(rad);
              const yPct = 50 + 42 * b.dist * Math.sin(rad) * 0.45; // squashed by tilt
              const isActive = activeBlips.has(i);
              return (
                <div
                  key={i}
                  className={`absolute transition-all duration-500 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="glass-strong whitespace-nowrap rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-scout-400" />
                      <span className="text-[10px] font-semibold text-white">{b.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-ink-400" />
                      <span className="text-[9px] text-ink-400">{b.niche}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corner brackets */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-scout-400/30" />
            <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-scout-400/30" />
            <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-scout-400/30" />
            <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-scout-400/30" />
          </div>
        </div>

        {/* Status bar */}
        <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-6 text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-scout-400" />
            Scanning
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-scout-400" />
            {activeBlips.size} active leads
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-scout-400">{Math.round(sweepAngle)}°</span>
            bearing
          </div>
        </div>
      </div>
    </section>
  );
}
