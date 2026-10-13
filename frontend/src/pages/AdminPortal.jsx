import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { availability, REPORT_TYPES, STATUSES } from '../utils.js';
import { Empty, Modal, PageHeader, SkeletonRows } from '../components/ui.jsx';

const empty = { name: '', address: '', area: '', city: '', monthlyRent: '', roomType: 'Single', gender: 'any', facilities: '', ownerName: '', ownerContact: '', available: true, availableFrom: '' };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function Dashboard({ listings, reports, goto }) {
  if (!listings || !reports) return <SkeletonRows n={4} />;
  const stats = [
    ['Listings', listings.length, 'listings'],
    ['Available now', listings.filter((b) => b.available).length, 'listings'],
    ['Full', listings.filter((b) => !b.available).length, 'listings'],
    ['Pending reports', reports.filter((r) => r.status === 'Pending').length, 'reports'],
    ['In progress', reports.filter((r) => r.status === 'In Progress').length, 'reports'],
    ['Resolved', reports.filter((r) => r.status === 'Resolved').length, 'reports'],
  ];
  return (
    <>
      <motion.div className="stats" variants={stagger} initial="hidden" animate="show">
        {stats.map(([l, n, to]) => (
          <motion.button key={l} variants={rise} className="glass stat hoverable" onClick={() => goto(to)}>
            <span className="stat-n">{n}</span>
            <span>{l}</span>
          </motion.button>
        ))}
      </motion.div>
      <h2 className="section-title left">Latest <em>reports</em></h2>
      {reports.length === 0 ? (
        <Empty icon="📭" title="No reports yet" />
      ) : (
        <div className="stack">
          {reports.slice(0, 4).map((r) => (
            <div className="glass panel report" key={r._id}>
              <div className="report-top">
                <strong>{REPORT_TYPES[r.type]} <span className="muted">· {r.boarding?.name || 'General'}</span></strong>
                <span className={'status st-' + r.status.replace(' ', '')}>{r.status}</span>
              </div>
              <p>{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ListingForm({ initial, onSave, onCancel, busy }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <div className="row">
        <label>Name<input value={f.name} onChange={set('name')} required /></label>
        <label>Address<input value={f.address} onChange={set('address')} required /></label>
      </div>
      <div className="row">
        <label>Area<input value={f.area} onChange={set('area')} required /></label>
        <label>City<input value={f.city} onChange={set('city')} required /></label>
        <label>Monthly rent (LKR)<input type="number" min="0" value={f.monthlyRent} onChange={set('monthlyRent')} required /></label>
      </div>
      <div className="row">
        <label>Room type
          <select value={f.roomType} onChange={set('roomType')}>{['Single', 'Double', 'Shared', 'Annex'].map((r) => <option key={r}>{r}</option>)}</select>
        </label>
        <label>Gender
          <select value={f.gender} onChange={set('gender')}><option value="boys">Boys</option><option value="girls">Girls</option><option value="any">Any</option></select>
        </label>
        <label>Availability
          <select value={String(f.available)} onChange={(e) => setF({ ...f, available: e.target.value === 'true' })}><option value="true">Available now</option><option value="false">Full</option></select>
        </label>
        {!f.available && <label>Available from<input type="date" value={f.availableFrom} onChange={set('availableFrom')} /></label>}
      </div>
      <label>Facilities <small>(comma separated)</small><input placeholder="WiFi, Meals, Hot water" value={f.facilities} onChange={set('facilities')} /></label>
      <div className="row">
        <label>Owner name<input value={f.ownerName} onChange={set('ownerName')} /></label>
        <label>Owner contact<input value={f.ownerContact} onChange={set('ownerContact')} required /></label>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn glass-btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save listing'}</button>
      </div>
    </form>
  );
}

function Listings({ list, reload }) {
  const toast = useToast();
  const [modal, setModal] = useState(null); // null | {edit: listing|null}
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async (f) => {
    setBusy(true);
    try {
      const body = { name: f.name, address: f.address, area: f.area, city: f.city, monthlyRent: Number(f.monthlyRent), roomType: f.roomType, gender: f.gender, facilities: f.facilities, ownerName: f.ownerName, ownerContact: f.ownerContact, available: f.available, availableFrom: f.available ? '' : f.availableFrom };
      const id = modal.edit?._id;
      await api(id ? `/boardings/${id}` : '/boardings', { method: id ? 'PUT' : 'POST', body });
      toast.success(id ? 'Listing updated' : 'Listing added');
      setModal(null);
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api(`/boardings/${del._id}`, { method: 'DELETE' });
      toast.success('Listing deleted');
      setDel(null);
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const toggle = async (b) => {
    try {
      await api(`/boardings/${b._id}`, { method: 'PUT', body: { available: !b.available } });
      toast.success(`Marked as ${b.available ? 'full' : 'available'}`);
      reload();
    } catch (e) { toast.error(e.message); }
  };
  const initial = modal?.edit
    ? { ...empty, ...modal.edit, facilities: modal.edit.facilities.join(', '), availableFrom: modal.edit.availableFrom?.slice(0, 10) || '' }
    : empty;

  return (
    <>
      <div className="toolbar">
        <button className="btn primary" onClick={() => setModal({ edit: null })}>+ Add listing</button>
      </div>
      {!list ? <SkeletonRows /> : list.length === 0 ? (
        <Empty icon="🏠" title="No listings yet" text="Add your first boarding house." />
      ) : (
        <div className="glass table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Location</th><th>Rent (LKR)</th><th>Room</th><th>Gender</th><th>Availability</th><th><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {list.map((b) => {
                const av = availability(b);
                return (
                  <tr key={b._id}>
                    <td data-l="Name"><strong>{b.name}</strong></td>
                    <td data-l="Location">{b.area}, {b.city}</td>
                    <td data-l="Rent">{b.monthlyRent.toLocaleString()}</td>
                    <td data-l="Room">{b.roomType}</td>
                    <td data-l="Gender">{b.gender}</td>
                    <td data-l="Availability"><button className={'badge as-btn ' + av.tone} onClick={() => toggle(b)} title="Click to toggle available/full"><i aria-hidden="true" />{av.label}</button></td>
                    <td className="actions">
                      <button className="btn glass-btn sm" onClick={() => setModal({ edit: b })}>Edit</button>
                      <button className="btn danger sm" onClick={() => setDel(b)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.edit ? 'Edit listing' : 'Add listing'}>
        {modal && <ListingForm initial={initial} onSave={save} onCancel={() => setModal(null)} busy={busy} />}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete listing?">
        <p>This will permanently remove <strong>{del?.name}</strong>.</p>
        <div className="modal-actions">
          <button className="btn glass-btn" onClick={() => setDel(null)}>Cancel</button>
          <button className="btn danger" onClick={remove} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>
    </>
  );
}

function Reports({ list, reload }) {
  const toast = useToast();
  const setStatus = async (id, status) => {
    try {
      await api(`/reports/${id}/status`, { method: 'PATCH', body: { status } });
      toast.success(`Status set to ${status}`);
      reload();
    } catch (e) { toast.error(e.message); }
  };
  if (!list) return <SkeletonRows />;
  if (!list.length) return <Empty icon="📭" title="No reports" text="Customer reports will appear here." />;
  return (
    <div className="glass table-wrap">
      <table>
        <thead><tr><th>Date</th><th>User</th><th>Type</th><th>Listing</th><th>Message</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((r) => (
            <tr key={r._id}>
              <td data-l="Date">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td data-l="User">{r.user?.name}<br /><small className="muted">{r.user?.email}</small></td>
              <td data-l="Type">{REPORT_TYPES[r.type]}</td>
              <td data-l="Listing">{r.boarding?.name || '—'}</td>
              <td data-l="Message" className="msg">{r.message}</td>
              <td data-l="Status">
                <span className={'status st-' + r.status.replace(' ', '')}>{r.status}</span>
                <select className="glass-select mini" aria-label="Update status" value={r.status} onChange={(e) => setStatus(r._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HEADS = {
  dashboard: ['Staff Dashboard', <>Overview of <em>everything</em></>, 'Listings, availability and reports at a glance.'],
  listings: ['Listings & Rent', <>Manage <em>listings</em></>, 'Add, edit or remove boarding houses, rents and availability.'],
  reports: ['Customer Reports', <>Review <em>reports</em></>, 'Move reports from Pending to In Progress to Resolved.'],
};

export default function AdminPortal() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = ['dashboard', 'listings', 'reports'].includes(params.get('tab')) ? params.get('tab') : 'dashboard';
  const [listings, setListings] = useState(null);
  const [reports, setReports] = useState(null);
  const loadListings = () => api('/boardings').then(setListings).catch((e) => { setListings([]); toast.error(e.message); });
  const loadReports = () => api('/reports').then(setReports).catch((e) => { setReports([]); toast.error(e.message); });
  useEffect(() => { loadListings(); loadReports(); }, []); // eslint-disable-line
  const [tag, title, sub] = HEADS[tab];

  return (
    <>
      <PageHeader tag={tag} sub={sub}>{title}</PageHeader>
      <div className="glass tabs" role="tablist">
        {[['dashboard', 'Dashboard'], ['listings', 'Listings & Rent'], ['reports', 'Reports']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setParams(k === 'dashboard' ? {} : { tab: k })}>{l}</button>
        ))}
      </div>
      {tab === 'dashboard' && <Dashboard listings={listings} reports={reports} goto={(t) => setParams({ tab: t })} />}
      {tab === 'listings' && <Listings list={listings} reload={loadListings} />}
      {tab === 'reports' && <Reports list={reports} reload={loadReports} />}
    </>
  );
}
