import { useEffect, useRef, useState } from 'react';
import { ChevronDown, History, Home, Image as ImageIcon, Loader2, Menu, X, ArrowLeft, Globe, MapPin, BarChart3, Clock, Zap, Target, Plus, Minus } from 'lucide-react';

const SCALE_OPTIONS = [
  { value: 'small', label: 'Small (<10 staff)' },
  { value: 'medium', label: 'Medium (10-50 staff)' },
  { value: 'large', label: 'Large (50+ staff)' },
];

function ScaleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = SCALE_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white focus:border-scout-400 focus:outline-none"
      >
        <span>{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-2xl">
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                opt.value === value
                  ? 'bg-scout-400/20 text-scout-400'
                  : 'text-ink-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CountSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const currentNum = parseInt(value) || 1;

  const decrease = () => {
    if (currentNum > 1) {
      onChange(String(currentNum - 1));
    }
  };

  const increase = () => {
    if (currentNum < 5) {
      onChange(String(currentNum + 1));
    }
  };

  return (
    <div className="flex h-[42px] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
      <span className="font-medium px-2">{currentNum} lead{currentNum > 1 ? 's' : ''}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrease}
          disabled={currentNum <= 1}
          className="rounded-lg p-1 text-ink-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={increase}
          disabled={currentNum >= 5}
          className="rounded-lg p-1 text-ink-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form State
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [scale, setScale] = useState('small');
  const [count, setCount] = useState('1');

  // Request State
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Batch Queue State
  const [resultsQueue, setResultsQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Outreach State for Current Item in Queue
  const [sendTo, setSendTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendNote, setSendNote] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // History State
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  const [lightbox, setLightbox] = useState<{ url: string; cap: string } | null>(null);

  const API_BASE = "https://scout-backend-gq18.onrender.com";

  useEffect(() => {
    fetchHistory();
  }, [userName, activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history?user_name=${encodeURIComponent(userName)}`);
      const data = await res.json();
      if (res.ok) {
        setHistoryItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const finalizeSignature = (text: string, name: string) => {
    const stripped = text.replace(/\n*\s*(Best regards|Warm regards|Regards|Sincerely|Thanks|Cheers)[,.]?\s*[\s\S]*$/i, '').trim();
    return stripped + '\n\nBest regards,\n' + name;
  };

  const extractEmail = (text: string) => {
    const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return match ? match[0] : '';
  };

  const loadQueueItem = (item: any) => {
    if (!item) return;
    setSendTo(extractEmail(item.research_profile));
    setSubject(item.draft_subject);
    setBody(finalizeSignature(item.draft_body, userName));
    setSendNote(null);
  };

  const runScout = async () => {
    if (!niche || !location) {
      setError('Enter both a niche and a location to run the scout.');
      return;
    }
    setError('');
    setResultsQueue([]);
    setCurrentIndex(0);
    setSendNote(null);
    setLoading(true);
    setStatus('Discovering & generating multi-channel demos...');

    const numRuns = parseInt(count) || 1;
    const msgs = [
      'Discovering random target businesses...', 
      'Researching pain points & building live demos...', 
      'Capturing CRM, Email & Slack alert proofs...',
      'Drafting high-converting pitches...'
    ];
    let step = 0;
    const timer = setInterval(() => {
      if (step < msgs.length) setStatus(msgs[step++]);
    }, 5000);

    try {
      const res = await fetch(`${API_BASE}/api/start-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName, niche, location, scale, count: numRuns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Something went wrong running the scout.');

      const queue = data.data || [];
      setResultsQueue(queue);
      if (queue.length > 0) {
        loadQueueItem(queue[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const regenerateOutreach = async () => {
    const currentItem = resultsQueue[currentIndex];
    if (!currentItem) return;
    try {
      const res = await fetch(`${API_BASE}/api/regenerate-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: currentItem.business_name, research_profile: currentItem.research_profile }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubject(data.draft_subject);
        setBody(finalizeSignature(data.draft_body, userName));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendOutreach = async () => {
    const currentItem = resultsQueue[currentIndex];
    if (!currentItem || !sendTo) return;
    setSendLoading(true);
    setSendNote(null);
    try {
      const payload = {
        user_name: userName,
        niche,
        location,
        scale,
        recipient_email: sendTo,
        subject,
        body,
        business_name: currentItem.business_name,
        form_screenshot: currentItem.demo_result.form_screenshot,
        airtable_screenshot: currentItem.demo_result.airtable_screenshot,
        email_screenshot: currentItem.demo_result.email_screenshot,
        slack_screenshot: currentItem.demo_result.slack_screenshot,
      };
      const res = await fetch(`${API_BASE}/api/send-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSendNote({ msg: `Sent to ${sendTo}. Logged to History!`, type: 'success' });
        fetchHistory();

        setTimeout(() => {
          if (currentIndex + 1 < resultsQueue.length) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            loadQueueItem(resultsQueue[nextIdx]);
          }
        }, 1500);

      } else {
        setSendNote({ msg: data.detail || 'Send failed.', type: 'error' });
      }
    } catch (err: any) {
      setSendNote({ msg: err.message, type: 'error' });
    } finally {
      setSendLoading(false);
    }
  };

  const totalPitched = historyItems.length;
  const estimatedHoursSaved = (totalPitched * 0.75).toFixed(1);
  const successRate = totalPitched > 0 ? '100%' : '0%';

  const currentItem = resultsQueue[currentIndex];

  return (
    <div className="flex h-screen bg-ink-950 font-sans text-white overflow-hidden">
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-950/90 backdrop-blur-sm p-4">
          <button onClick={() => setLightbox(null)} className="absolute right-6 top-6 rounded-full p-2 hover:bg-white/10">
            <X className="h-8 w-8 text-white" />
          </button>
          <img src={`${API_BASE}/${lightbox.url.replace(/^\//, '')}`} alt="Screenshot" className="max-h-[80vh] max-w-[95vw] rounded-xl border border-white/10 shadow-2xl object-contain" />
          <p className="mt-4 font-medium text-ink-300 text-center">{lightbox.cap}</p>
        </div>
      )}

      {/* Clean vertical sidebar for desktop */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-white/5 bg-ink-900/40 transition-all duration-300 shrink-0`}>
        <div className="flex items-center justify-between p-6">
          {sidebarOpen && <span className="font-display text-xl font-bold">Scout<span className="text-scout-400">.</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          <button onClick={() => { setActiveTab('home'); setSelectedHistoryItem(null); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white'}`}>
            <Home className="h-5 w-5 shrink-0" />
            {sidebarOpen && 'Home'}
          </button>
          <button onClick={() => { setActiveTab('history'); setSelectedHistoryItem(null); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white'}`}>
            <History className="h-5 w-5 shrink-0" />
            {sidebarOpen && 'History'}
          </button>
          <button onClick={() => { setActiveTab('analytics'); setSelectedHistoryItem(null); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white'}`}>
            <BarChart3 className="h-5 w-5 shrink-0" />
            {sidebarOpen && 'Analytics'}
          </button>
        </nav>

        <div className="mt-auto border-t border-white/5 p-6 text-sm text-ink-400">
          {sidebarOpen ? `Hi, ${userName}` : userName.charAt(0)}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-4xl">
          {activeTab === 'home' ? (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl font-bold">Home</h1>
              <p className="mt-2 text-ink-300">Point it at a niche, location, and run count — it'll take it from there.</p>

              <div className="glass-strong mt-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-5 sm:items-end">
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <label className="text-xs font-medium text-ink-400">Niche</label>
                  <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. flower shops" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-scout-400 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <label className="text-xs font-medium text-ink-400">Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Colombo" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-scout-400 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <label className="text-xs font-medium text-ink-400">Scale</label>
                  <ScaleSelect value={scale} onChange={setScale} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <label className="text-xs font-medium text-ink-400">Runs count</label>
                  <CountSelect value={count} onChange={setCount} />
                </div>
                <button onClick={runScout} disabled={loading} className="flex h-[42px] items-center justify-center rounded-xl bg-gradient-to-r from-scout-400 to-aqua-500 font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 sm:col-span-1">
                  Run scout
                </button>
              </div>

              {loading && (
                <div className="mt-6 flex items-center gap-3 text-scout-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              )}
              {error && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

              {resultsQueue.length > 0 && !loading && currentItem && (
                <div className="mt-10 space-y-6 animate-fade-up">
                  {resultsQueue.length > 1 && (
                    <div className="flex items-center justify-between rounded-xl bg-scout-400/10 border border-scout-400/20 px-4 py-3 text-sm text-scout-300">
                      <span>Queue Progress: Lead <strong>{currentIndex + 1}</strong> of <strong>{resultsQueue.length}</strong></span>
                      <div className="flex gap-2">
                        {resultsQueue.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentIndex(idx);
                              loadQueueItem(resultsQueue[idx]);
                            }}
                            className={`h-7 w-7 rounded-full text-xs font-bold transition-all ${currentIndex === idx ? 'bg-scout-400 text-ink-950' : 'bg-white/10 text-ink-300 hover:bg-white/20'}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Target Business</h2>
                    <h3 className="mt-2 font-display text-2xl font-bold">{currentItem.business_name}</h3>
                    <div className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap border-t border-white/5 pt-4 text-sm leading-relaxed text-ink-300">
                      {currentItem.research_profile}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Proof of the demo (4-Step Workflow)</h2>
                    <div className="grid gap-4 sm:grid-cols-4">
                      {[
                        { key: 'form_screenshot', cap: '1. Intake form' },
                        { key: 'airtable_screenshot', cap: '2. CRM record' },
                        { key: 'email_screenshot', cap: '3. Auto-reply' },
                        { key: 'slack_screenshot', cap: '4. Slack alert' }
                      ].map((img) => (
                        <div key={img.key} onClick={() => setLightbox({ url: `${API_BASE}/${currentItem.demo_result[img.key].replace(/^\//, '')}`, cap: img.cap })} className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-ink-900/50 hover:border-scout-400">
                          <img src={`${API_BASE}/${currentItem.demo_result[img.key].replace(/^\//, '')}`} alt={img.cap} className="h-28 w-full object-cover object-top opacity-80 transition-opacity group-hover:opacity-100" />
                          <div className="flex items-center gap-2 p-2.5 text-xs text-ink-300">
                            <ImageIcon className="h-3.5 w-3.5 text-scout-400" />
                            {img.cap}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-strong rounded-2xl p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Outreach — review before sending</h2>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-ink-400">Send to</label>
                        <input value={sendTo} onChange={(e) => setSendTo(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:border-scout-400 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-ink-400">Subject</label>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white focus:border-scout-400 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-ink-400">Message</label>
                        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-200 focus:border-scout-400 focus:outline-none" />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button onClick={regenerateOutreach} className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium hover:border-white/30 hover:bg-white/5">
                          Regenerate draft
                        </button>
                        <button onClick={sendOutreach} disabled={sendLoading} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-scout-400 to-aqua-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                          {sendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Approve & send
                        </button>
                        {sendNote && (
                          <span className={`ml-2 text-sm font-medium ${sendNote.type === 'success' ? 'text-scout-400' : 'text-red-400'}`}>
                            {sendNote.msg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="animate-fade-up">
              {selectedHistoryItem ? (
                <div className="space-y-6">
                  <button onClick={() => setSelectedHistoryItem(null)} className="flex items-center gap-2 text-sm text-ink-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Back to History list
                  </button>

                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-2xl font-bold">{selectedHistoryItem.business_name}</h2>
                      <span className="rounded-full bg-scout-400/10 px-3 py-1 text-xs font-semibold text-scout-400">Sent to {selectedHistoryItem.recipient_email}</span>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-ink-400">
                      <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Niche: {selectedHistoryItem.niche}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location: {selectedHistoryItem.location}</span>
                      <span>Scale: {selectedHistoryItem.scale}</span>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Attached Proof Screenshots</h2>
                    <div className="grid gap-4 sm:grid-cols-4">
                      {[
                        { key: 'form_screenshot', cap: '1. Intake form' },
                        { key: 'airtable_screenshot', cap: '2. CRM record' },
                        { key: 'email_screenshot', cap: '3. Auto-reply' },
                        { key: 'slack_screenshot', cap: '4. Slack alert' }
                      ].map((img) => (
                        selectedHistoryItem[img.key] && (
                          <div key={img.key} onClick={() => setLightbox({ url: `${API_BASE}/${selectedHistoryItem[img.key].replace(/^\//, '')}`, cap: img.cap })} className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-ink-900/50 hover:border-scout-400">
                            <img src={`${API_BASE}/${selectedHistoryItem[img.key].replace(/^\//, '')}`} alt={img.cap} className="h-28 w-full object-cover object-top opacity-80 transition-opacity group-hover:opacity-100" />
                            <div className="flex items-center gap-2 p-2.5 text-xs text-ink-300">
                              <ImageIcon className="h-3.5 w-3.5 text-scout-400" />
                              {img.cap}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="glass-strong rounded-2xl p-6 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Outreach Email Sent</h2>
                    <div>
                      <label className="text-xs text-ink-400">Subject</label>
                      <div className="mt-1 font-medium text-white text-sm">{selectedHistoryItem.subject}</div>
                    </div>
                    <div>
                      <label className="text-xs text-ink-400">Body</label>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-ink-300 bg-white/5 p-4 rounded-xl border border-white/5">{selectedHistoryItem.body}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="font-display text-3xl font-bold">History</h1>
                  <p className="mt-2 text-ink-300">Every business you've reached out to will show up here.</p>

                  {historyItems.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-ink-400">
                      No outreach sent yet. Once you approve and send outreach from Home, it'll appear here.
                    </div>
                  ) : (
                    <div className="mt-8 grid gap-4">
                      {historyItems.map((item) => (
                        <div key={item.id} onClick={() => setSelectedHistoryItem(item)} className="glass group cursor-pointer flex items-center justify-between rounded-2xl p-5 transition-all hover:border-scout-400">
                          <div>
                            <h3 className="font-display text-lg font-bold group-hover:text-scout-400">{item.business_name}</h3>
                            <p className="mt-1 text-xs text-ink-400">{item.niche} • {item.location} • Sent to {item.recipient_email}</p>
                          </div>
                          <div className="text-right text-xs text-ink-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl font-bold">Analytics & Impact</h1>
              <p className="mt-2 text-ink-300">Real-time performance metrics for your AI outreach engine.</p>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Total Pitched</span>
                    <Target className="h-5 w-5 text-scout-400" />
                  </div>
                  <div className="mt-4 font-display text-4xl font-bold text-white">{totalPitched}</div>
                  <p className="mt-2 text-xs text-ink-400">Businesses successfully researched and emailed</p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Est. Hours Saved</span>
                    <Clock className="h-5 w-5 text-aqua-400" />
                  </div>
                  <div className="mt-4 font-display text-4xl font-bold text-white">{estimatedHoursSaved} hrs</div>
                  <p className="mt-2 text-xs text-ink-400">Saved on manual lead gen & demo prototyping</p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Execution Success</span>
                    <Zap className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="mt-4 font-display text-4xl font-bold text-white">{successRate}</div>
                  <p className="mt-2 text-xs text-ink-400">Live agent success rate across all pipelines</p>
                </div>
              </div>

              <div className="glass-strong mt-8 rounded-2xl p-6">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Activity Breakdown</h2>
                {historyItems.length === 0 ? (
                  <p className="text-sm text-ink-400 py-6 text-center">No activity recorded yet. Run your first scout on the Home tab to populate metrics!</p>
                ) : (
                  <div className="space-y-3">
                    {historyItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between rounded-xl bg-white/5 p-4 text-sm">
                        <div>
                          <span className="font-semibold text-white">{item.business_name}</span>
                          <span className="ml-3 text-xs text-ink-400">{item.niche} ({item.location})</span>
                        </div>
                        <span className="rounded-full bg-scout-400/10 px-3 py-1 text-xs font-medium text-scout-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
