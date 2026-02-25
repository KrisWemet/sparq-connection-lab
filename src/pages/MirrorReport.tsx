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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-2xl w-full z-10">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">Your Mirror Report</h1>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">🧠</span>
            What I've noticed about you...
          </h2>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-2 h-full bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">You value Acts of Service</h3>
                <p className="text-gray-600 mt-1">Based on your activity, I see you feel most loved when tasks are shared and your burden is lightened.</p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <div className="w-2 h-full bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Communication Style: Direct</h3>
                <p className="text-gray-600 mt-1">You appreciate clear, straightforward talks over ambiguous hints, especially during conflict.</p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="w-2 h-full bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Growth Area: Vulnerability</h3>
                <p className="text-gray-600 mt-1">Sharing your fears is a subtle edge for you. I know it's scary, but leaning into this can really deepen your trust!</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <h2 className="text-3xl font-bold mb-4">See the Full Picture</h2>
          <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto">
            A mirror only shows one reflection. Connect with your partner to unlock joint insights, compatibility scores, and shared growth paths!
          </p>
          
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isUpgrading ? "Connecting..." : "Upgrade to Premium & Connect"}
          </button>
        </div>
      </div>
      
      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}
