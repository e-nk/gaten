"use client";

import { useSession } from "next-auth/react";

export function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 text-xs max-w-xs">
      <h4 className="font-bold mb-2">Session Debug</h4>
      <p><strong>Status:</strong> {status}</p>
      {session && (
        <>
          <p><strong>Name:</strong> {session.user?.name}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Role:</strong> {session.user?.role || 'undefined'}</p>
          <p><strong>ID:</strong> {session.user?.id}</p>
        </>
      )}
    </div>
  );
}