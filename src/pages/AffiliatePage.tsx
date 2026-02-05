import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { supabase } from '../lib/supabase';
import type { AffiliateProfile, AffiliateReferralRow } from '../lib/types';

function AffiliateLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Unable to sign in. Contact admin if your account is not active.');
      return;
    }

    setMessage('Signed in successfully.');
  };

  const handleMagicLinkLogin = async () => {
    setError(null);
    setMessage(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/affiliate`,
      },
    });

    if (otpError) {
      setError('Unable to send magic link. Please verify your account setup with admin.');
      return;
    }

    setMessage('Magic link sent. Check your email to continue.');
  };

  return (
    <PageShell title="Affiliate Access" subtitle="Authorized affiliates only.">
      <form className="space-y-4" onSubmit={handlePasswordLogin}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            Sign In
          </button>
          <button
            type="button"
            onClick={handleMagicLinkLogin}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Send Magic Link
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function AffiliateDashboard({ profile }: { profile: AffiliateProfile }) {
  const [rows, setRows] = useState<AffiliateReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('affiliate_referrals')
        .select('id, payout_status, student_registrations(full_name, status)')
        .eq('affiliate_id', profile.id)
        .order('id', { ascending: false });

      if (data) {
        setRows(data as AffiliateReferralRow[]);
      }

      setLoading(false);
    };

    void load();
  }, [profile.id]);

  return (
    <PageShell title={`Welcome, ${profile.name}`} subtitle={`Referral code: ${profile.referral_code}`}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
        >
          Sign Out
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading referrals...</p> : null}

      {!loading && rows.length === 0 ? <p className="text-sm text-slate-600">No referrals yet.</p> : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-2 py-2 font-semibold">Student Name</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{row.student_registrations?.full_name ?? 'Unknown student'}</td>
                  <td className="px-2 py-2 capitalize">{row.student_registrations?.status ?? 'registered'}</td>
                  <td className="px-2 py-2 capitalize">{row.payout_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageShell>
  );
}

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user.email) {
        setLoading(false);
        return;
      }

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, name, referral_code, email, is_active')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .maybeSingle();

      if (!affiliate) {
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setProfile(affiliate as AffiliateProfile);
      setIsAffiliate(true);
      setLoading(false);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <PageShell title="Affiliate Access">Checking access...</PageShell>;
  }

  if (!isAffiliate) {
    return <AffiliateLogin />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  return <AffiliateDashboard profile={profile} />;
}
