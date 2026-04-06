import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { supabase } from '@/lib/supabase';

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getPeterMood(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

interface PeterGreetingProps {
  firstName: string;
}

export function PeterGreeting({ firstName }: PeterGreetingProps) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_insights')
          .select('next_greeting_text')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.next_greeting_text) {
          setGreeting(data.next_greeting_text);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const fallback = `${getTimeGreeting()}${firstName ? `, ${firstName}` : ''}. Ready for today's practice?`;
  const displayText = greeting || fallback;

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3.5"
    >
      <PeterAvatar mood={getPeterMood()} size={50} />
      <div className="flex-1 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary/70">
          A note from Peter
        </p>
        <p className="pt-2 font-serif italic text-[17px] leading-relaxed text-brand-text-secondary">
          {displayText}
        </p>
      </div>
    </motion.div>
  );
}
