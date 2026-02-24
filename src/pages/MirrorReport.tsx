import React from 'react';
import { useRouter } from 'next/router';

export default function MirrorReport() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">Your Mirror Report</h1>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">🧠</span>
            What we've learned about you
          </h2>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-2 h-full bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">You value Acts of Service</h3>
                <p className="text-gray-600 mt-1">Based on your recent activity, you tend to express and feel love most when tasks are shared and burdens are lightened.</p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <div className="w-2 h-full bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Communication Style: Direct</h3>
                <p className="text-gray-600 mt-1">You appreciate clear, straightforward conversations over ambiguous hints, especially during conflict.</p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="w-2 h-full bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Growth Area: Vulnerability</h3>
                <p className="text-gray-600 mt-1">Sharing your fears and uncertainties is a subtle edge for you. Leaning into this can deepen trust.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <h2 className="text-3xl font-bold mb-4">See the Full Picture</h2>
          <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto">
            A mirror only shows one reflection. Connect with your partner to unlock joint insights, compatibility scores, and shared growth paths.
          </p>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-105"
          >
            Upgrade to Premium & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
