import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

/** A real response status stays readable even with every animation disabled. */
export function PeterResponseStatus({ label = 'Peter is responding…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
      <PeterAvatar size={36} state="listening" motion="still" />
      <span>{label}</span>
    </div>
  );
}
