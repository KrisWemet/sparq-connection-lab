import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  createVisualSnapshot,
  INITIAL_VISUAL_GROWTH,
  mergeVisualSnapshots,
  parseVisualSnapshot,
  practiceDaysToGrowth,
  serializeVisualSnapshot,
  type VisualSnapshot,
} from '@/lib/visual-emotion';

interface VisualEmotionContextValue {
  growth: number;
  observePracticeDays: (practiceDays: number) => void;
  snapshot: VisualSnapshot | null;
}

const NEUTRAL_CONTEXT: VisualEmotionContextValue = {
  growth: INITIAL_VISUAL_GROWTH,
  observePracticeDays: () => {},
  snapshot: null,
};

const VisualEmotionContext = createContext<VisualEmotionContextValue>(NEUTRAL_CONTEXT);
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function storageKey(accountId: string): string {
  return `sparq:visual-emotion:v1:${encodeURIComponent(accountId)}`;
}

function readSnapshot(accountId: string): VisualSnapshot | null {
  try {
    return parseVisualSnapshot(window.localStorage.getItem(storageKey(accountId)));
  } catch {
    // Private browsing and disabled storage should retain the neutral scene.
    return null;
  }
}

/** Observes existing API results; never fetches or infers data. Account changes
 * reset only the decorative context, without remounting forms or page content. */
export function VisualEmotionProvider({ children }: { children: ReactNode }) {
  const { user, session, loading } = useAuth();
  const accountId = !loading && user?.id && session?.user.id === user.id ? user.id : null;
  const [state, setState] = useState<{ accountId: string | null; snapshot: VisualSnapshot | null }>({ accountId: null, snapshot: null });
  const activeAccount = useRef<string | null>(null);
  const snapshot = state.accountId === accountId ? state.snapshot : null;

  useClientLayoutEffect(() => {
    activeAccount.current = accountId;
    return () => { activeAccount.current = null; };
  }, [accountId]);

  useEffect(() => {
    const stored = accountId ? readSnapshot(accountId) : null;
    setState(current => ({ accountId, snapshot: mergeVisualSnapshots(current.accountId === accountId ? current.snapshot : null, stored) }));
    if (!accountId) return;
    const onStorage = (event: StorageEvent) => {
      if (activeAccount.current !== accountId || event.key !== storageKey(accountId)) return;
      const incoming = parseVisualSnapshot(event.newValue);
      setState(current => ({ accountId, snapshot: mergeVisualSnapshots(current.accountId === accountId ? current.snapshot : null, incoming) }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [accountId]);

  useEffect(() => {
    if (!accountId || !snapshot || activeAccount.current !== accountId) return;
    try {
      const highest = mergeVisualSnapshots(snapshot, readSnapshot(accountId));
      if (!highest) return;
      if (highest.practiceDays > snapshot.practiceDays) setState({ accountId, snapshot: highest });
      const serialized = serializeVisualSnapshot(highest);
      if (serialized) window.localStorage.setItem(storageKey(accountId), serialized);
    } catch { /* The in-memory scene still works when persistence is unavailable. */ }
  }, [accountId, snapshot]);

  const observePracticeDays = useCallback((practiceDays: number) => {
    // A response started for an old account must never affect the new one.
    if (!accountId || activeAccount.current !== accountId) return;
    const incoming = createVisualSnapshot(practiceDays);
    if (!incoming) return;
    setState(current => ({ accountId, snapshot: mergeVisualSnapshots(current.accountId === accountId ? current.snapshot : null, incoming) }));
  }, [accountId]);

  const value = useMemo<VisualEmotionContextValue>(() => ({
    growth: snapshot ? practiceDaysToGrowth(snapshot.practiceDays) : INITIAL_VISUAL_GROWTH,
    observePracticeDays,
    snapshot,
  }), [snapshot, observePracticeDays]);
  return <VisualEmotionContext.Provider value={value}>{children}</VisualEmotionContext.Provider>;
}

export function useVisualEmotion(): VisualEmotionContextValue {
  return useContext(VisualEmotionContext);
}
