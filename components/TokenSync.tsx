'use client';

import { useEffect } from 'react';
import { getToken, isTokenExpired, removeToken, syncTokenToCookie } from '@/lib/auth';

/**
 * Component to ensure token is synced from localStorage to cookies
 * AND automatically remove expired tokens
 */
export default function TokenSync() {
  useEffect(() => {
    const token = getToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('⚠️ Token expired, removing...');
        removeToken();
        // Optionally redirect to login if on protected page
        // You can check window.location.pathname here
      } else {
        // Token valid, sync to cookie
        syncTokenToCookie();
      }
    }

    // Set up interval to check token expiration every minute
    const intervalId = setInterval(() => {
      const currentToken = getToken();
      if (currentToken && isTokenExpired(currentToken)) {
        console.log('⚠️ Token expired (interval check), removing...');
        removeToken();
        // Optionally show a notification or redirect
        if (typeof window !== 'undefined') {
          const isProtectedPage = !['/login', '/register', '/', '/xe-dien'].includes(window.location.pathname);
          if (isProtectedPage) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = '/login';
          }
        }
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
