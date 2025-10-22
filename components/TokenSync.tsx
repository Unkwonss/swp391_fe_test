'use client';

import { useEffect } from 'react';
import { syncTokenToCookie } from '@/lib/auth';

/**
 * Component to ensure token is synced from localStorage to cookies
 * This fixes middleware auth issues for existing logged-in users
 */
export default function TokenSync() {
  useEffect(() => {
    // Sync token to cookie on mount
    syncTokenToCookie();
  }, []);

  return null;
}
