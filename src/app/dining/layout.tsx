'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DiningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== '/dining') {
      router.replace('/dining');
    }
  }, [pathname, router]);

  if (pathname !== '/dining') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
