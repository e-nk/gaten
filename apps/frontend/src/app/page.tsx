'use client';

import { trpc } from '@/trpc/provider';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: health, refetch } = trpc.healthCheck.useQuery();
  const createSample = trpc.createSampleData.useMutation({
    onSuccess: () => {
      refetch(); // Refresh health check to see new data
    }
  });

  return (
    <div className="min-h-screen bg-school-primary-nyanza p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-school-primary-blue">
          Gaten LMS
        </h1>
        
        {/* Database Status */}
        <div className="p-6 bg-white rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-school-primary-blue mb-4">
            System Status
          </h2>
          
          <div className="space-y-2">
            <p className="text-green-600">
              <strong>tRPC:</strong> {health?.status || 'Connecting...'}
            </p>
            <p className={health?.database === 'Connected' ? 'text-green-600' : 'text-red-600'}>
              <strong>Database:</strong> {health?.database || 'Checking...'}
            </p>
            
            {health?.tables && (
              <div className="mt-4 p-4 bg-school-primary-nyanza rounded">
                <p className="font-medium text-school-primary-blue">Database Tables:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Users: {health.tables.users}</li>
                  <li>Courses: {health.tables.courses}</li>
                  <li>Categories: {health.tables.categories}</li>
                </ul>
              </div>
            )}
            
            {health?.error && (
              <p className="text-red-600 text-sm mt-2">
                Error: {health.error}
              </p>
            )}
          </div>
        </div>

        {/* Test Database Operations */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
            Test Database
          </h3>
          <Button 
            onClick={() => createSample.mutate()}
            disabled={createSample.isPending}
            className="bg-school-primary-blue hover:bg-school-primary-blue/90"
          >
            {createSample.isPending ? 'Creating...' : 'Create Sample Category'}
          </Button>
          
          {createSample.data && (
            <div className="mt-4 p-3 bg-green-50 rounded text-green-700">
              ✅ Sample data created successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}