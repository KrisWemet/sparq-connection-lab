import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();

  return (
    <motion.div
      // Path only: a ?query change (sign in ↔ create account) is the same page,
      // so it must not remount it and wipe what the user typed.
      key={router.asPath.split(/[?#]/)[0]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
