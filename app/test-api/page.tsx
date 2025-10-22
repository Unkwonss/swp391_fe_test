'use client';

import { useState, useEffect } from 'react';
import { getActiveListings } from '@/lib/api';

export default function TestAPIPage() {
  const [status, setStatus] = useState('Testing...');
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setStatus('🔍 Connecting to backend...');
      
      // Test direct fetch
      const directResponse = await fetch('http://localhost:8080/api/listing/active');
      if (!directResponse.ok) {
        throw new Error(`Backend returned ${directResponse.status}`);
      }
      setStatus('✅ Backend connection OK!');
      
      // Test via our API layer
      setStatus('🔍 Testing API integration...');
      const data = await getActiveListings(0, 10);
      
      setListings(data.content || []);
      setStatus(`✅ API Connected! Found ${data.content?.length || 0} listings`);
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Connection failed!');
      console.error('API Test Error:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔧 API Connection Test</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <p className={`text-lg ${error ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="space-y-2 text-sm">
          <p>🌐 <strong>Backend URL:</strong> http://localhost:8080</p>
          <p>🌐 <strong>Frontend URL:</strong> http://localhost:3000</p>
          <p>🔌 <strong>API Base:</strong> http://localhost:8080/api</p>
        </div>
      </div>

      {listings.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            📊 Listings ({listings.length})
          </h2>
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-gray-600">{listing.description}</p>
                <p className="text-blue-600 font-bold mt-2">
                  {listing.price?.toLocaleString('vi-VN')} đ
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">🔍 How to Debug</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open DevTools (F12) → Console tab</li>
          <li>Check for API errors in red</li>
          <li>Go to Network tab → Filter "XHR"</li>
          <li>Look for requests to localhost:8080</li>
          <li>Check response status (should be 200)</li>
        </ol>
      </div>

      <div className="mt-6">
        <button onClick={testAPI} className="btn-primary">
          🔄 Retry Connection
        </button>
      </div>
    </div>
  );
}
