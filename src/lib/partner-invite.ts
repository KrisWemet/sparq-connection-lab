// An invite link opened while signed out is remembered here, so the code is
// waiting after sign-up and onboarding (the dashboard sends them back).
export const PENDING_INVITE_KEY = 'sparq.pendingInviteCode';

export function readPendingInvite(): string {
  try { return localStorage.getItem(PENDING_INVITE_KEY) || ''; } catch { return ''; }
}

export function writePendingInvite(code: string | null) {
  try {
    if (code) localStorage.setItem(PENDING_INVITE_KEY, code);
    else localStorage.removeItem(PENDING_INVITE_KEY);
  } catch { /* storage blocked: the code is still in the link */ }
}
