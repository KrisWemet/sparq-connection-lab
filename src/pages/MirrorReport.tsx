import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import PeterTheOtter, { MascotStatus } from '../components/PeterTheOtter';

export default function MirrorReport() {
  const router = useRouter();
  const [peterStatus, setPeterStatus] = useState<MascotStatus>('idle');
  const [peterMessage, setPeterMessage] = useState<string | null>("Here's what I've learned about you so far! It's just one side of the river, though.");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setPeterStatus('thinking');
    setPeterMessage("Fetching the shiny premium shells... hold on!");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email || 'test@example.com';

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { email }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.url) {
        setPeterStatus('speaking');
        setPeterMessage("Here we go! Let's get you upgraded.");
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout session.");
      }

    } catch (err) {
      console.error(err);
      setPeterStatus('speaking');
      setPeterMessage("Oh barnacles, my connection to Stripe snapped! Please try again later.");
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center py-12 px-4 relative font-sans">
      <div className="max-w-2xl w-full z-10">
        <h1 className="text-4xl font-serif text-zinc-100 mb-8 text-center tracking-wide">Your Mirror Report</h1>

        <div className="bg-[#111111] rounded-3xl border border-zinc-800 p-8 mb-8">
          <h2 className="text-xl font-serif text-zinc-100 mb-6 flex items-center tracking-wide">
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-2 rounded-xl mr-3">🧠</span>
            What Peter&apos;s noticed so far...
          </h2>

          <ul className="space-y-6">
            <li className="flex gap-5">
              <div className="w-[2px] h-full bg-zinc-800 mt-2"></div>
              <div>
                <h3 className="font-semibold text-[15px] text-zinc-200 tracking-wide">You value Acts of Service</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-light">Based on your activity, I see you feel most loved when tasks are shared and your burden is lightened.</p>
              </div>
            </li>

            <li className="flex gap-5">
              <div className="w-[2px] h-full bg-zinc-800 mt-2"></div>
              <div>
                <h3 className="font-semibold text-[15px] text-zinc-200 tracking-wide">Communication Style: Direct</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-light">You appreciate clear, straightforward talks over ambiguous hints, especially during conflict.</p>
              </div>
            </li>

            <li className="flex gap-5">
              <div className="w-[2px] h-full bg-zinc-800 mt-2"></div>
              <div>
                <h3 className="font-semibold text-[15px] text-zinc-200 tracking-wide">Growth Area: Vulnerability</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-light">Sharing your fears is a subtle edge for you. I know it&apos;s scary, but leaning into this can really deepen your trust!</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-serif tracking-wide text-zinc-100 mb-3">See the Full Picture</h2>
          <p className="text-sm font-light text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
            A mirror only shows one reflection. Connect with your partner to unlock joint insights, compatibility scores, and shared growth paths.
          </p>

          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full sm:w-auto bg-white text-black font-semibold text-sm tracking-wide py-4 px-8 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpgrading ? "Connecting..." : "Upgrade to Premium & Connect"}
          </button>
        </div>
      </div>

      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}
