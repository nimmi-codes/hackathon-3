import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { availability, REPORT_TYPES, STATUSES } from '../utils.js';
import { Empty, PageHeader, SkeletonCards, SkeletonRows } from '../components/ui.jsx';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function BoardingCard({ b, open, onToggle, onReport }) {
  const av = availability(b);
  const toggleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };
  return (
    <motion.article variants={item} className={'glass card hoverable' + (open ? ' open' : '')}>
      <div className="card-main" role="button" tabIndex={0} aria-expanded={open} onClick={onToggle} onKeyDown={toggleKey}>
        <div className="card-top">
          <h3>{b.name}</h3>
          <span className={'badge ' + av.tone}><i aria-hidden="true" />{av.label}</span>
        </div>
        <p className="muted">{b.address}, {b.area}, {b.city}</p>
        <p className="rent">LKR {b.monthlyRent.toLocaleString()} <small>/ month</small></p>
        <p className="meta">
          <span className="pill">{b.roomType}</span>
          <span className="pill">{b.gender === 'any' ? 'Boys & girls' : b.gender === 'boys' ? 'Boys' : 'Girls'}</span>
        </p>
        <span className="more-hint">{open ? 'Hide details' : 'View details'}</span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="card-more" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="card-more-inner">
              <h4>Facilities</h4>
              {b.facilities.length ? (
                <ul className="facilities">{b.facilities.map((f) => <li key={f}>{f}</li>)}</ul>
              ) : (
                <p className="muted">No facilities listed.</p>
              )}
              <h4>Owner contact</h4>
              <p>{b.ownerName ? b.ownerName + ' · ' : ''}<a href={`tel:${b.ownerContact}`}>{b.ownerContact}</a></p>
              <button className="btn glass-btn sm" onClick={() => onReport(b._id)}>Report this listing</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function Finder({ onReport }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [roomType, setRoomType] = useState('');
  const [gender, setGender] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [all, setAll] = useState([]);
  const [list, setList] = useState(null); // null = loading
  const [runId, setRunId] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [showSug, setShowSug] = useState(false);
  const [active, setActive] = useState(-1);
  const resultsRef = useRef(null);

  const search = (scroll) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (gender) p.set('gender', gender);
    if (maxRent) p.set('maxRent', maxRent);
    setList(null);
    api('/boardings?' + p)
      .then((r) => {
        setList(r);
        setRunId((n) => n + 1);
        if (scroll) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      })
      .catch((e) => { setList([]); toast.error(e.message); });
  };
  useEffect(() => {
    search(false);
    api('/boardings').then(setAll).catch(() => {});
  }, []); // eslint-disable-line

  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const names = new Set();
    all.forEach((b) => { names.add(b.area); names.add(b.city); });
    return [...names].filter((n) => n && n.toLowerCase().includes(t) && n.toLowerCase() !== t).slice(0, 6);
  }, [all, q]);

  const shown = list ? list.filter((b) => !roomType || b.roomType === roomType) : null;
  const pick = (s) => { setQ(s); setShowSug(false); setActive(-1); };
  const onKey = (e) => {
    if (!showSug || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === 'Escape') setShowSug(false);
  };

  return (
    <>
      <form className="glass searchbar" onSubmit={(e) => { e.preventDefault(); setShowSug(false); search(true); }} role="search">
        <div className="field area">
          <label htmlFor="area" className="sr">Area or city</label>
          <input id="area" placeholder="Area or city (e.g. Kandy, Nugegoda)" value={q} autoComplete="off" role="combobox" aria-expanded={showSug && suggestions.length > 0} aria-autocomplete="list" aria-controls="area-list"
            onChange={(e) => { setQ(e.target.value); setShowSug(true); setActive(-1); }} onFocus={() => setShowSug(true)} onBlur={() => setTimeout(() => setShowSug(false), 120)} onKeyDown={onKey} />
          {showSug && suggestions.length > 0 && (
            <ul className="glass suggest" id="area-list" role="listbox">
              {suggestions.map((s, i) => (
                <li key={s} role="option" aria-selected={i === active} className={i === active ? 'active' : ''} onMouseDown={() => pick(s)}>{s}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="field">
          <label htmlFor="rt" className="sr">Room type</label>
          <select id="rt" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="">Any room type</option>
            {['Single', 'Double', 'Shared', 'Annex'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="btn primary">Search</button>
      </form>
      <div className="filters">
        <label className="sr" htmlFor="gn">Gender</label>
        <select id="gn" className="glass-select" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Any gender</option><option value="boys">Boys</option><option value="girls">Girls</option><option value="any">Mixed</option>
        </select>
        <label className="sr" htmlFor="mr">Max rent</label>
        <input id="mr" className="glass-select" type="number" min="0" placeholder="Max rent (LKR)" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} />
      </div>

      <div ref={resultsRef} className="results-anchor">
        {shown === null && <SkeletonCards />}
        {shown && shown.length === 0 && (
          <Empty icon="🔍" title="No boarding houses found" text="Try another area, room type or a higher rent limit." />
        )}
        {shown && shown.length > 0 && (
          <motion.div key={runId} className="grid" variants={container} initial="hidden" animate="show">
            {shown.map((b) => (
              <BoardingCard key={b._id} b={b} open={openId === b._id} onToggle={() => setOpenId(openId === b._id ? null : b._id)} onReport={onReport} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}

function ReportForm({ preset, onDone }) {
  const toast = useToast();
  const [boardings, setBoardings] = useState([]);
  const [f, setF] = useState({ boarding: preset || '', type: 'wrong_info', message: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/boardings').then(setBoardings).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/reports', { method: 'POST', body: f });
      toast.success('Report submitted. We will look into it.');
      onDone();
    } catch (er) {
      toast.error(er.message);
      setBusy(false);
    }
  };
  return (
    <form className="glass panel form narrow" onSubmit={submit}>
      <label>Boarding house <small>(optional)</small>
        <select value={f.boarding} onChange={(e) => setF({ ...f, boarding: e.target.value })}>
          <option value="">Select a listing</option>
          {boardings.map((b) => <option key={b._id} value={b._id}>{b.name} ({b.area})</option>)}
        </select>
      </label>
      <label>Issue type
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {Object.entries(REPORT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>Details
        <textarea rows="5" placeholder="Describe the problem" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required />
      </label>
      <button className="btn primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit report'}</button>
    </form>
  );
}

function Tracker({ status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="tracker" aria-label={`Status: ${status}`}>
      {STATUSES.map((s, i) => (
        <li key={s} className={i <= idx ? 'done' : ''}><i aria-hidden="true" />{s}</li>
      ))}
    </ol>
  );
}

function MyReports({ onNew }) {
  const [list, setList] = useState(null);
  useEffect(() => { api('/reports/mine').then(setList).catch(() => setList([])); }, []);
  if (list === null) return <SkeletonRows />;
  if (!list.length) return <Empty icon="📭" title="No reports yet" text="Spotted a wrong detail or a scam? Let us know." />;
  return (
    <motion.div className="stack" variants={container} initial="hidden" animate="show">
      {list.map((r) => (
        <motion.div key={r._id} variants={item} className="glass panel report">
          <div className="report-top">
            <div>
              <strong>{REPORT_TYPES[r.type]}</strong>
              <span className="muted"> · {r.boarding?.name || 'General'} · {new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <span className={'status st-' + r.status.replace(' ', '')}>{r.status}</span>
          </div>
          <p>{r.message}</p>
          <Tracker status={r.status} />
        </motion.div>
      ))}
    </motion.div>
  );
}

const HEADS = {
  find: ['Sri Lanka Boarding Houses', <>Find your <em>room</em> in seconds</>, 'Search by area, compare rent and facilities, contact owners directly.'],
  report: ['Report an Issue', <>Help keep listings <em>honest</em></>, 'Tell us about wrong info, full houses or scam listings.'],
  mine: ['Your Reports', <>Track your <em>reports</em></>, 'See where each report stands.'],
};

export default function CustomerPortal() {
  const [params, setParams] = useSearchParams();
  const tab = ['find', 'report', 'mine'].includes(params.get('tab')) ? params.get('tab') : 'find';
  const [preset, setPreset] = useState('');
  const go = (k) => { setPreset(''); setParams(k === 'find' ? {} : { tab: k }); };
  const [tag, title, sub] = HEADS[tab];

  return (
    <>
      <PageHeader tag={tag} sub={sub}>{title}</PageHeader>
      <div className="glass tabs" role="tablist">
        {[['find', 'Boarding Finder'], ['report', 'Report Issue'], ['mine', 'My Reports']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => go(k)}>{l}</button>
        ))}
      </div>
      {tab === 'find' && <Finder onReport={(id) => { setPreset(id); setParams({ tab: 'report' }); }} />}
      {tab === 'report' && <ReportForm key={preset} preset={preset} onDone={() => { setPreset(''); setParams({ tab: 'mine' }); }} />}
      {tab === 'mine' && <MyReports />}
    </>
  );
}
