import React, { Suspense } from 'react';
import OrganizerOverview from '@/components/organizer/overview';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 font-[family-name:var(--font-anek-latin)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-900 mb-4"></div>
        <p className="text-zinc-600 font-medium">Initializing Organizer Portal...</p>
      </div>
    }>
      <OrganizerOverview />
    </Suspense>
  );
}
