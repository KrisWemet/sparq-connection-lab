import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import PeterTheOtter, { MascotStatus } from '../components/PeterTheOtter';

export default function OnboardingFlow() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    relationshipStatus: 'dating',
    partnerEmail: ''
  });
  const [peterStatus, setPeterStatus] = useState<MascotStatus>('idle');
  const [peterMessage, setPeterMessage] = useState<string | null>("Hi there! I'm Peter. I'm here to help you and your partner build a stronger connection. What's your name?");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'name' && e.target.value.length > 2) {
      setPeterStatus('speaking');
      setPeterMessage(`Nice to meet you, ${e.target.value}! Tell me a bit about your relationship.`);
      setTimeout(() => setPeterStatus('idle'), 2000);
    } else if (e.target.name === 'partnerEmail' && e.target.value.includes('@')) {
      setPeterStatus('speaking');
      setPeterMessage("Ooh, inviting your partner! That's the best way to grow together. I'll send them a nice invitation.");
      setTimeout(() => setPeterStatus('idle'), 3000);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPeterStatus('thinking');
    setPeterMessage("Setting up your nest... give me just a sec!");

    try {
      // Create user profile
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'anonymous-user-' + Date.now(); // Mock fallback if not authed

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
           user_id: userId,
           name: formData.name,
           relationship_status: formData.relationshipStatus,
           streak_count: 0
        }]);
      
      if (profileError) {
        console.error("Profile Error", profileError);
      }

      // Invite Partner
      if (formData.partnerEmail) {
        const { error: inviteError } = await supabase
          .from('partner_invitations')
          .insert([{
            inviter_id: userId,
            invitee_email: formData.partnerEmail,
            status: 'pending'
          }]);
        if (inviteError) {
           console.error("Invite Error", inviteError);
        }
      }

      setPeterStatus('speaking');
      setPeterMessage("All set! Let's dive in and start growing together!");
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setPeterStatus('speaking');
      setPeterMessage("Oops, my paws slipped! Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-indigo-700">Welcome to Sparq</h2>
          <p className="text-gray-500 mt-2">Let's get to know you a bit better.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="E.g., Alex"
            />
          </div>

          <div>
            <label htmlFor="relationshipStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Status
            </label>
            <select
              id="relationshipStatus"
              name="relationshipStatus"
              value={formData.relationshipStatus}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
            >
              <option value="dating">Dating</option>
              <option value="engaged">Engaged</option>
              <option value="married">Married</option>
            </select>
          </div>

          <div>
            <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Partner's Email (Optional)
            </label>
            <input
              type="email"
              id="partnerEmail"
              name="partnerEmail"
              value={formData.partnerEmail}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="partner@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Setting up...' : 'Start Growing'}
          </button>
        </form>
      </div>
      
      <PeterTheOtter status={peterStatus} message={peterMessage} />
    </div>
  );
}
