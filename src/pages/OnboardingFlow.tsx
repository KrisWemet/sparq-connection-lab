import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function OnboardingFlow() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    relationshipStatus: 'dating',
    partnerEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Start Growing
          </button>
        </form>
      </div>
    </div>
  );
}
