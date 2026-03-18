import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';

type MemoryMode = 'rolling_90_days' | 'indefinite';
type RelationshipMode = 'solo' | 'partnered';

type UserPreferences = {
  user_id: string;
  insights_visible: boolean;
  personalization_enabled: boolean;
  ai_memory_mode: MemoryMode;
  relationship_mode: RelationshipMode;
};

const DEFAULT_PREFS: Omit<UserPreferences, 'user_id'> = {
  insights_visible: true,
  personalization_enabled: true,
  ai_memory_mode: 'rolling_90_days',
  relationship_mode: 'solo',
};

export default function TrustCenterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const response = await fetch('/api/preferences', { headers });
        if (response.ok) {
          const payload = await response.json();
          const data = payload.preferences;
          if (data) {
            setPrefs({
              insights_visible: data.insights_visible ?? true,
              personalization_enabled: data.personalization_enabled ?? true,
              ai_memory_mode: data.ai_memory_mode ?? 'rolling_90_days',
              relationship_mode: data.relationship_mode ?? 'solo',
            });
          }
          setIsLoading(false);
          return;
        }
      } catch {
        // Fall back to direct client query when auth header flow is unavailable.
      }

      const { data } = await supabase
        .from('user_preferences')
        .select('insights_visible, personalization_enabled, ai_memory_mode, relationship_mode')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPrefs({
          insights_visible: data.insights_visible ?? true,
          personalization_enabled: data.personalization_enabled ?? true,
          ai_memory_mode: data.ai_memory_mode ?? 'rolling_90_days',
          relationship_mode: data.relationship_mode ?? 'solo',
        });
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const save = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaved(false);
    let savedViaApi = false;

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(prefs),
      });
      savedViaApi = response.ok;
    } catch {
      savedViaApi = false;
    }

    if (!savedViaApi) {
      await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            ...prefs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Trust Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
          <h1 className="text-base font-semibold text-slate-800">Trust Center</h1>
          <button
            onClick={save}
            disabled={isSaving}
            className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Personalization Controls</h2>
          <p className="text-xs text-slate-500 mt-1">
            Journals are private by default. You can hide insight labels and adjust AI memory behavior.
          </p>

          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Show my insight labels"
              hint="Turn this off to hide profile labels while keeping personalization available."
              checked={prefs.insights_visible}
              onToggle={() => setPrefs(p => ({ ...p, insights_visible: !p.insights_visible }))}
            />
            <ToggleRow
              label="Enable personalization"
              hint="If off, Peter uses generic guidance and does not adapt from prior patterns."
              checked={prefs.personalization_enabled}
              onToggle={() => setPrefs(p => ({ ...p, personalization_enabled: !p.personalization_enabled }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">AI Memory Window</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <MemoryOption
              active={prefs.ai_memory_mode === 'rolling_90_days'}
              title="90-day rolling window"
              detail="Default. AI memory context is limited to recent activity."
              onClick={() => setPrefs(p => ({ ...p, ai_memory_mode: 'rolling_90_days' }))}
            />
            <MemoryOption
              active={prefs.ai_memory_mode === 'indefinite'}
              title="Indefinite memory"
              detail="Keeps long-term memory enabled until you change this."
              onClick={() => setPrefs(p => ({ ...p, ai_memory_mode: 'indefinite' }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Relationship Mode</h2>
          <p className="text-xs text-slate-500 mt-1">Sparq launches solo-first, with optional partner sync later.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ModeOption
              active={prefs.relationship_mode === 'solo'}
              title="Solo"
              detail="Private growth journey, individual coaching."
              onClick={() => setPrefs(p => ({ ...p, relationship_mode: 'solo' }))}
            />
            <ModeOption
              active={prefs.relationship_mode === 'partnered'}
              title="Partnered"
              detail="Prepares your profile for shared prompts when enabled."
              onClick={() => setPrefs(p => ({ ...p, relationship_mode: 'partnered' }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">Safety & Data Boundaries</h2>
          <ul className="mt-2 text-xs text-amber-900 space-y-1">
            <li>Journals stay private unless you explicitly share an item.</li>
            <li>Sparq is not therapy and does not provide diagnosis.</li>
            <li>In crisis moments, coaching pauses and safety resources are prioritized.</li>
          </ul>
        </section>

        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
      </main>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onToggle,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-left hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            checked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {checked ? 'On' : 'Off'}
        </span>
      </div>
    </button>
  );
}

function MemoryOption({
  active,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left ${
        active ? 'border-indigo-400 bg-brand-linen' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
    </button>
  );
}

function ModeOption({
  active,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left ${
        active ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
    </button>
  );
}
