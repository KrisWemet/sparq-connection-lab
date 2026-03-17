import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, CheckCircle, Zap } from 'lucide-react';

type Phase = 'loading' | 'morning' | 'evening' | 'complete';

interface DailyTimelineProps {
  phase: Phase;
  actionVerified?: boolean;
}

export function DailyTimeline({ phase, actionVerified = false }: DailyTimelineProps) {
  const steps = [
    { id: 'morning', label: 'Morning Story', icon: Sun },
    { id: 'action', label: 'Daily Action', icon: Zap },
    { id: 'evening', label: 'Evening Reflection', icon: Moon },
  ];

  const getStatus = (stepId: string) => {
    if (phase === 'complete') return 'completed';
    
    if (stepId === 'morning') {
      return phase === 'morning' ? 'active' : 'completed';
    }
    
    if (stepId === 'action') {
      if (phase === 'morning') return 'pending';
      return actionVerified ? 'completed' : 'active';
    }
    
    if (stepId === 'evening') {
      if (phase === 'evening' && actionVerified) return 'active';
      return 'pending';
    }
    
    return 'pending';
  };

  return (
    <div className="w-full bg-white border-b border-zinc-100 px-6 py-4">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-zinc-100 -z-0" />
        <motion.div 
          className="absolute top-5 left-8 h-[2px] bg-brand-primary -z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: phase === 'complete' ? 1 : 
                    (phase === 'evening' && actionVerified) ? 1 :
                    (phase === 'evening') ? 0.5 :
                    0.1
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ width: 'calc(100% - 4rem)' }}
        />

        {steps.map((step, idx) => {
          const status = getStatus(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: status === 'completed' ? '#007AFF' : status === 'active' ? '#FFFFFF' : '#F2F2F7',
                  borderColor: status === 'active' ? '#007AFF' : 'transparent',
                  color: status === 'completed' ? '#FFFFFF' : status === 'active' ? '#007AFF' : '#A1A1AA',
                  scale: status === 'active' ? 1.1 : 1,
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors duration-300`}
              >
                {status === 'completed' ? (
                  <CheckCircle size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </motion.div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-tight ${
                status === 'active' ? 'text-brand-primary' : 'text-zinc-400'
              }`}>
                {step.label.split(' ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
