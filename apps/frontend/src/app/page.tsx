'use client';

import { trpc } from '@/trpc/provider';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const { data: health, refetch } = trpc.healthCheck.useQuery();
  const createSample = trpc.createSampleData.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  return (
    <div className="min-h-screen bg-school-primary-nyanza p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-school-primary-blue">
            Gaten LMS
          </h1>

          {/* Auth Status */}
          <div className="flex items-center gap-4">
            {status === 'loading' && (
              <p className="text-school-primary-blue">Loading...</p>
            )}
            
            {status === 'unauthenticated' && (
              <div className="flex gap-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-school-primary-blue hover:bg-school-primary-blue/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {status === 'authenticated' && session && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-school-primary-blue">
                    {session.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.user?.role}
                  </p>
                </div>
                <Button 
                  onClick={() => signOut()}
                  variant="outline" 
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* System Status */}
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

        {/* Test Credentials */}
        {status === 'unauthenticated' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-medium text-school-primary-blue mb-2">Test Credentials:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Admin:</strong> admin@gaten.com / password123</p>
              <p><strong>Student:</strong> student@gaten.com / password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}