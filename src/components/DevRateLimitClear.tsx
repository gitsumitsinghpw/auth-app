'use client';

import { useState } from 'react';

export default function DevRateLimitClear() {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');

  const clearRateLimits = async () => {
    setIsClearing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/dev/clear-rate-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear-all' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Rate limits cleared successfully!');
      } else {
        setMessage('❌ Failed to clear rate limits');
      }
    } catch {
      setMessage('❌ Error clearing rate limits');
    } finally {
      setIsClearing(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-yellow-800">Development Tools</h4>
          <p className="text-xs text-yellow-700">Clear rate limits if you hit registration/login limits</p>
        </div>
        <button
          onClick={clearRateLimits}
          disabled={isClearing}
          className="bg-yellow-600 text-white px-3 py-1 text-sm rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
        >
          {isClearing ? 'Clearing...' : 'Clear Rate Limits'}
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}
