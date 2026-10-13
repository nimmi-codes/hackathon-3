import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader } from '../components/ui.jsx';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', staffCode: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const u = isSignup ? await signup(f.name, f.email, f.password, f.staffCode) : await login(f.email, f.password);
      toast.success(`Welcome, ${u.name}`);
      nav(homeFor(u), { replace: true });
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <PageHeader tag={isSignup ? 'Join us' : 'Welcome back'} sub={isSignup ? 'Create a customer account. Staff can add a staff code.' : 'One sign in for customers and staff.'}>
        {isSignup ? <>Create your <em>account</em></> : <>Sign <em>in</em></>}
      </PageHeader>
      <form className="glass panel form auth" onSubmit={submit}>
        {err && <div className="alert" role="alert">{err}</div>}
        {isSignup && (
          <label>Full name<input placeholder="Your name" value={f.name} onChange={set('name')} required autoComplete="name" /></label>
        )}
        <label>Email<input type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Password<input type="password" placeholder="Min 6 characters" value={f.password} onChange={set('password')} required autoComplete={isSignup ? 'new-password' : 'current-password'} /></label>
        {isSignup && (
          <label>Staff code <small>(optional)</small><input placeholder="Leave empty for a customer account" value={f.staffCode} onChange={set('staffCode')} /></label>
        )}
        <button className="btn primary" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Sign in'}</button>
        <p className="muted center-text">
          {isSignup ? <>Have an account? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/signup">Sign up</Link></>}
        </p>
      </form>
    </div>
  );
}
