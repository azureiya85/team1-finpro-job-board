'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStores';
import type { UserRole } from '@prisma/client';

export function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setLoading, user: zustandUser } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const newUser = {
        id: session.user.id,
        email: session.user.email ?? '', // Ensure email is not null
        name: session.user.name ?? undefined,
        role: session.user.role as UserRole,
        avatar: session.user.image ?? undefined,
        isVerified: session.user.isEmailVerified, 
      };

      // Only update if the user ID is different to avoid unnecessary re-renders
      if (zustandUser?.id !== newUser.id) {
        setUser(newUser);
      }
    }

    if (status === 'unauthenticated') {
      // If session is gone, clear the user from the store
      if (zustandUser !== null) {
        setUser(null);
      }
    }

    setLoading(false);

  }, [status, session, setUser, setLoading, zustandUser]);

  return null;
}