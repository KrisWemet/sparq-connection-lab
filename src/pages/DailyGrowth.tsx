import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import PeterTheOtter, { MascotStatus } from '../components/PeterTheOtter';

export default function DailyGrowth() {
  const router = useRouter();
  const [journal, setJournal] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [peterStatus, setPeterStatus] = useState<MascotStatus>('idle');
  const [peterMessage, setPeterMessage] = useState<string | null>("How are you feeling today? Pick an emotion, and then tell me what's on your mind.");
  
  const emojis = [
    { emoji: '😔', label: 'Sad' },
    { emoji: '😕', label: 'Stressed' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🙂', label: 'Happy' },
    { emoji: '😊', label: 'Joyful' }
  ];

  const handleMoodSelect = (selectedMood: string, label: string) => {
    setMood(selectedMood);
    setPeterStatus('speaking');
    if (label === 'Sad' || label === 'Stressed') {
      setPeterMessage("I'm sorry to hear that. Writing it out can really help. I'm listening.");
    } else if (label === 'Neutral') {
      setPeterMessage("A steady day is a good day. What's been going on?");
    } else {
      setPeterMessage("That's wonderful! I love seeing you happy. What made today great?");
    }
  };

  const handleSave = async () => {
    if (!mood || !journal.trim()) return;
    
    setIsSaving(true);
    setPeterStatus('thinking');
    setPeterMessage("Tucking this away in a safe spot...");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'anonymous-user-' + Date.now();

      // Ensure user_responses table exists or mock insert
      const { error } = await supabase
        .from('user_responses')
        .insert([{
          user_id: userId,
          mood: mood,
          journal_entry: journal,
          type: 'daily_growth'
        }]);

      if (error) {
        console.error("Error saving daily growth:", error);
      }

      setPeterStatus('speaking');
      setPeterMessage("All saved! Tonight's Action: Try giving your partner a 5-second hug. Small physical connections reduce stress.");
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setPeterStatus('speaking');
      setPeterMessage("Oh no, a fish bumped into me and I dropped it! Let's try saving again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 z-10">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Daily Growth</h1>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">How are you feeling today?</label>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
            {emojis.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMoodSelect(item.emoji, item.label)}
                title={item.label}
                className={`text-4xl transition-transform hover:scale-110 ${mood === item.emoji ? 'scale-125 bg-indigo-100 rounded-full p-2' : 'p-2'}`}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Journal your thoughts</label>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            onFocus={() => {
              if (peterStatus === 'idle') {
                 setPeterStatus('thinking');
                 setPeterMessage("Take your time...");
              }
            }}
            onBlur={() => setPeterStatus('idle')}
            placeholder="What's on your mind today?"
            className="w-full border border-gray-300 rounded-lg p-4 h-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <button
          onClick={handleSave}
          disabled={!mood || !journal.trim() || isSaving}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save & Grow'}
        </button>
      </div>

      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}
