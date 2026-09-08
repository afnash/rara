'use client';

import Link from 'next/link';
import { PawPrint, ArrowRight, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Role = 'parent' | 'sitter' | 'admin';
type DummyUser = { email: string; password: string; name: string; role: Role; pin: string };

const DEMO_USERS: DummyUser[] = [
  { email: 'parent@rara.test', password: 'Parent123!', name: 'Priya Parent', role: 'parent', pin: '238163' },
  { email: 'sitter@rara.test', password: 'Sitter123!', name: 'Sam Sitter', role: 'sitter', pin: '168732' },
  { email: 'admin', password: 'Afnash7', name: 'Admin', role: 'admin', pin: '000000' },
];

export default function AuthForm({
  mode,
  defaultRole = 'parent',
}: {
  mode: 'login' | 'signup';
  defaultRole?: 'parent' | 'sitter';
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccessNotice('');

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));

    if (mode === 'signup') {
      const name = String(form.get('name')).trim();
      const role = String(form.get('role')) as Role;
      const pin = String(form.get('pin')).trim();

      const user: DummyUser = { email, password, name, role, pin };
      const newUserId = 'usr_' + Date.now();

      // Persist new user registration directly into Supabase DB
      try {
        const supabase = createClient();
        await supabase.from('profiles').insert({
          id: newUserId,
          full_name: name,
          role: role,
          postal_code: pin,
        });

        if (role === 'sitter') {
          // New sitters register as UNVERIFIED (verified: false) awaiting Admin Confirmation
          await supabase.from('sitter_profiles').insert({
            id: newUserId,
            bio: 'Newly registered sitter awaiting Admin confirmation.',
            services: ['Pet sitting', 'Dog walking'],
            hourly_rate: 25,
            rating: 5.0,
            years_experience: 2,
            verified: false,
          });
        }
      } catch (err) {
        console.warn('Supabase DB registration sync notice:', err);
      }

      // Store in session storage
      const customUsers: DummyUser[] = JSON.parse(localStorage.getItem('rara_dummy_users') || '[]');
      localStorage.setItem(
        'rara_dummy_users',
        JSON.stringify([...customUsers.filter((x) => x.email !== email), user])
      );
      localStorage.setItem('rara_dummy_session', JSON.stringify(user));

      if (role === 'sitter') {
        setSuccessNotice('Registration Successful! Your sitter account is now PENDING ADMIN CONFIRMATION. The Admin will review and confirm your profile.');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        router.push('/dashboard');
      }
    } else {
      // Login mode
      const customUsers: DummyUser[] = JSON.parse(localStorage.getItem('rara_dummy_users') || '[]');
      const user = [...DEMO_USERS, ...customUsers].find((x) => x.email === email && x.password === password);

      if (!user) {
        setError('Incorrect username/email or password.');
        setBusy(false);
        return;
      }

      localStorage.setItem('rara_dummy_session', JSON.stringify(user));
      router.push('/dashboard');
    }
  }

  return (
    <main className="auth">
      <Link href="/" className="brand">
        <span>
          <PawPrint />
        </span>
        RaRa
      </Link>
      <form onSubmit={submit}>
        <p className="eyebrow">RA-RA LOCALITY PLATFORM</p>
        <h1>{mode === 'login' ? 'Sign in to RaRa' : 'Create your account'}</h1>

        {successNotice && (
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '600' }}>
            <Clock size={18} /> {successNotice}
          </div>
        )}

        {mode === 'signup' && (
          <>
            <label>
              Full name
              <input name="name" required placeholder="Your full name" />
            </label>
            <label>
              I am joining as
              <select name="role" defaultValue={defaultRole}>
                <option value="parent">Pet parent (Looking for sitters)</option>
                <option value="sitter">Pet sitter (Offers pet care)</option>
              </select>
            </label>
            <label>
              Singapore PIN / postal code
              <div className="input-icon">
                <MapPin />
                <input
                  name="pin"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6-digit postal code (e.g. 238163)"
                />
              </div>
              <small>Used to match parents and sitters within a 5km radius.</small>
            </label>
          </>
        )}

        <label>
          {mode === 'login' ? 'Username or email' : 'Email address'}
          <input
            type={mode === 'login' ? 'text' : 'email'}
            name="email"
            required
            placeholder={mode === 'login' ? 'Username or email' : 'you@example.com'}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            minLength={mode === 'login' ? 1 : 8}
            required
            placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="button" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          <ArrowRight />
        </button>

        {mode === 'login' && (
          <div className="demo-logins">
            <b>Demo accounts</b>
            <code>parent@rara.test / Parent123!</code>
            <code>sitter@rara.test / Sitter123!</code>
            <code>admin / Afnash7</code>
          </div>
        )}

        <p>
          {mode === 'login' ? (
            <>
              New here? <Link href="/signup">Create an account</Link>
            </>
          ) : (
            <>
              Already registered? <Link href="/login">Sign in</Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}

