'use client';

import { trpc } from '@/trpc/provider';

export default function Home() {
  // Just test the basic connection
  const { data: health } = trpc.healthCheck.useQuery();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Gaten LMS</h1>
      
      {/* Simple connection test */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold">tRPC Status:</h2>
        <p className="text-green-600">{health?.status || 'Connecting...'}</p>
      </div>
      
      {/* Your existing content can go here */}
    </div>
  );
}