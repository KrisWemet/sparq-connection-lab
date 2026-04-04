import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { deriveMemoryWindow } from '@/lib/server/privacy';

type MemoryMode = 'off' | 'rolling_90_days' | 'indefinite';
type RelationshipMode = 'solo' | 'partnered';

type UserPreferences = {
  user_id: string;
  insights_visible: boolean;
  personalization_enabled: boolean;
  ai_memory_mode: MemoryMode;
  relationship_mode: RelationshipMode;
};

type ConsentState = {
  has_consented: boolean;
  consent_given_at: string | null;
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
  const [consent, setConsent] = useState<ConsentState>({ has_consented: false, consent_given_at: null });

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
          const consentData = payload.consent;
          if (data) {
            setPrefs({
              insights_visible: data.insights_visible ?? true,
              personalization_enabled: data.personalization_enabled ?? true,
              ai_memory_mode: data.ai_memory_mode ?? 'rolling_90_days',
              relationship_mode: data.relationship_mode ?? 'solo',
            });
          }
          if (consentData) {
            setConsent({
              has_consented: consentData.has_consented ?? false,
              consent_given_at: consentData.consent_given_at ?? null,
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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('consent_given_at')
        .eq('id', user.id)
        .maybeSingle();
      setConsent({
        has_consented: Boolean(profileData?.consent_given_at),
        consent_given_at: profileData?.consent_given_at ?? null,
      });
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
      if (response.ok) {
        const payload = await response.json();
        if (payload?.consent) {
          setConsent({
            has_consented: payload.consent.has_consented ?? false,
            consent_given_at: payload.consent.consent_given_at ?? null,
          });
        }
      }
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
            memory_window: deriveMemoryWindow({ ai_memory_mode: prefs.ai_memory_mode }),
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
          <h2 className="text-sm font-semibold text-slate-800">Consent Status</h2>
          <p className="mt-1 text-xs text-slate-500">
            Peter only uses your data after you say yes.
          </p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">
              {consent.has_consented ? 'Consent captured' : 'Consent required'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {consent.consent_given_at
                ? `Recorded on ${new Date(consent.consent_given_at).toLocaleString()}`
                : 'Without consent, Peter stays general and does not save new personal details.'}
            </p>
          </div>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">What stays private</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Your journal notes and chats stay private to you. If you later use a shared feature, Sparq should share the pattern, not your exact words.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Personalization Controls</h2>
          <p className="text-xs text-slate-500 mt-1">
            Journals stay private by default. These settings change how Peter learns from you.
          </p>

          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Show my insight labels"
              hint="Turn this off to hide labels while keeping Peter personal."
              checked={prefs.insights_visible}
              onToggle={() => setPrefs(p => ({ ...p, insights_visible: !p.insights_visible }))}
            />
            <ToggleRow
              label="Enable personalization"
              hint="If off, Peter gives more general help and does not adapt from old patterns."
              checked={prefs.personalization_enabled}
              onToggle={() => setPrefs(p => ({ ...p, personalization_enabled: !p.personalization_enabled }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">AI Memory Window</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <MemoryOption
              active={prefs.ai_memory_mode === 'off'}
              title="Memory off"
              detail="Peter will not save new details for later chats."
              onClick={() => setPrefs(p => ({ ...p, ai_memory_mode: 'off' }))}
            />
            <MemoryOption
              active={prefs.ai_memory_mode === 'rolling_90_days'}
              title="90-day rolling window"
              detail="Default. Peter remembers recent things only."
              onClick={() => setPrefs(p => ({ ...p, ai_memory_mode: 'rolling_90_days' }))}
            />
            <MemoryOption
              active={prefs.ai_memory_mode === 'indefinite'}
              title="Indefinite memory"
              detail="Peter keeps long-term memory on until you change it."
              onClick={() => setPrefs(p => ({ ...p, ai_memory_mode: 'indefinite' }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Relationship Mode</h2>
          <p className="text-xs text-slate-500 mt-1">Solo is the full default. Partnered mode just adds shared tools later.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ModeOption
              active={prefs.relationship_mode === 'solo'}
              title="Solo"
              detail="Full daily practice, private coaching, and self-led growth."
              onClick={() => setPrefs(p => ({ ...p, relationship_mode: 'solo' }))}
            />
            <ModeOption
              active={prefs.relationship_mode === 'partnered'}
              title="Partnered"
              detail="Adds shared prompts and reflections when both people join."
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
            <li>If you turn personalization off, Peter stops using stored traits and memories for new replies.</li>
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
