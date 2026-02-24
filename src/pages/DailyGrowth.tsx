import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function DailyGrowth() {
  const router = useRouter();
  const [journal, setJournal] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const emojis = ['😔', '😕', '😐', '🙂', '😊'];

  const handleSave = () => {
    // Mock save behavior
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Daily Growth</h1>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">How are you feeling today?</label>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => setMood(emoji)}
                className={`text-4xl transition-transform hover:scale-110 ${mood === emoji ? 'scale-125 bg-indigo-100 rounded-full p-2' : 'p-2'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Journal your thoughts</label>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="What's on your mind today?"
            className="w-full border border-gray-300 rounded-lg p-4 h-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <button
          onClick={handleSave}
          disabled={!mood || !journal.trim()}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save & Grow
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-10 right-10 bg-indigo-800 text-white p-6 rounded-xl shadow-2xl animate-fade-in-up z-50 max-w-sm border border-indigo-400">
          <h3 className="font-bold text-lg mb-2">Tonight Action 🌙</h3>
          <p className="text-sm opacity-90">
            Based on today's entry, try giving your partner a 5-second hug tonight. Small physical connections reduce stress.
          </p>
        </div>
      )}
    </div>
  );
}
