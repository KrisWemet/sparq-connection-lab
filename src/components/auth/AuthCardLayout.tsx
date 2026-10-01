import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { SparqLogo } from '@/components/brand/SparqMark';

/** Simple centered card used by the forgot / reset password pages. */
export function AuthCardLayout({ title, heading, intro, children }: {
  title: string;
  heading: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <title>{title} - Sparq</title>
      </Head>
      <div className="min-h-dvh bg-brand-linen flex flex-col font-sans">
        <header className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-4">
          <Link href="/login" className="flex items-center w-fit">
            <SparqLogo />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-8 space-y-5"
          >
            <div className="flex items-center gap-3">
              <PeterAvatar mood="afternoon" size={40} />
              <h1 className="font-serif text-2xl text-brand-espresso">{heading}</h1>
            </div>
            <p className="text-sm text-brand-text-secondary leading-relaxed">{intro}</p>
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
}
