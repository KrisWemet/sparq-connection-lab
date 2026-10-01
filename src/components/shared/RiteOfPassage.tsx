import { useState } from 'react';
import { motion } from 'framer-motion';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { RITE_FIELDS, type RiteField } from '@/lib/rites';

/**
 * A rite of passage (constitution v1.2 §11C): after a real growth arc, the
 * user writes what changed — every line optional, every word theirs. Shown
 * one prompt at a time so it feels like a quiet ritual, not a form.
 */
export function RiteOfPassage({
  arcKey,
  intro,
  fields = RITE_FIELDS.map(f => f.key),
  onDone,
}: {
  arcKey: string;
  intro: string;
  fields?: RiteField[];
  onDone?: () => void;
}) {
  const prompts = RITE_FIELDS.filter(f => fields.includes(f.key));
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Partial<Record<RiteField, string>>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const current = prompts[index];
  const isLast = index === prompts.length - 1;
  const hasAny = Object.values(values).some(v => v && v.trim());

  async function save() {
    if (!hasAny || saving) return;
    setSaving(true);
    setError('');
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/me/growth-arc', { method: 'POST', headers, body: JSON.stringify({ arc_key: arcKey, fields: values }) });
      if (!res.ok) throw new Error('save failed');
      setDone(true);
      onDone?.();
    } catch {
      setError("That didn't save. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return <p className="font-serif text-brand-espresso text-[15px]">Kept, in your words. That&apos;s a real chapter. 🦦</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-text-secondary leading-relaxed">{intro}</p>
      <motion.div key={current.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <p className="font-serif text-brand-espresso text-[15px]">{current.prompt}</p>
        <textarea
          value={values[current.key] ?? ''}
          onChange={e => setValues(v => ({ ...v, [current.key]: e.target.value }))}
          rows={2}
          maxLength={500}
          aria-label={current.prompt}
          className="w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
      </motion.div>
      <p className="text-xs text-brand-text-secondary">{index + 1} of {prompts.length} · skip any you like</p>
      {error && <p className="text-xs text-brand-hover">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {!isLast && (
          <button type="button" onClick={() => setIndex(i => i + 1)}
            className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90">
            Next
          </button>
        )}
        {index > 0 && (
          <button type="button" onClick={() => setIndex(i => i - 1)}
            className="rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-brand-espresso hover:bg-white/60">
            Back
          </button>
        )}
        {(isLast || hasAny) && (
          <button type="button" disabled={!hasAny || saving} onClick={save}
            className="rounded-full border border-brand-primary/30 px-5 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5 disabled:opacity-50">
            {saving ? 'Saving…' : 'Keep this'}
          </button>
        )}
      </div>
    </div>
  );
}
