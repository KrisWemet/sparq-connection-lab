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
      key={router.asPath}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
