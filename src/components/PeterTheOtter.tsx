import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { PeterEnvironment } from '@/lib/peter-presentation';

export type MascotStatus = 'idle' | 'thinking' | 'speaking';
export interface PeterTheOtterProps {
  status?: MascotStatus;
  message?: string | null;
  environment?: PeterEnvironment;
}

/** An in-flow note keeps Peter beside the work and clear of controls and navigation. */
export function PeterTheOtter({ status = 'idle', message, environment = 'flow' }: PeterTheOtterProps) {
  if (!message && status === 'idle') return null;
  return (
    <aside className="mx-auto my-6 flex w-full max-w-lg items-start gap-3 px-4">
      <PeterAvatar size={48} state={status === 'thinking' ? 'listening' : 'reflective'} environment={environment} />
      <div className="min-w-0 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">Peter</p>
        <p role={status === 'thinking' ? 'status' : undefined}>{message || 'Peter is responding…'}</p>
      </div>
    </aside>
  );
}
export default PeterTheOtter;
