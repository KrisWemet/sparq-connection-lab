
import React from 'react';

export function LoadingProfile() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-700 text-sm">Loading profile...</p>
      </div>
    </div>
  );
}
