// components/EngineControls.tsx
"use client";
import { useState, useEffect } from 'react';

export default function EngineControls() {
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzePosition = async () => {
    setLoading(true);
    // Simulate engine analysis
    setTimeout(() => {
      setBestMove('e2e4');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Engine Analysis</h2>

      <button
        onClick={analyzePosition}
        disabled={loading}
        className={`px-4 py-2 rounded-md ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Position'}
      </button>

      {bestMove && (
        <div className="mt-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
          <p>Best Move: {bestMove}</p>
        </div>
      )}
    </div>
  );
}
