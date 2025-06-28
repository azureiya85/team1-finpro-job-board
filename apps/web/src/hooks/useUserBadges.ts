import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStores'; 

export interface UserBadge {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentIcon?: string | null;
  earnedAt: Date;
}

export function useUserBadges() {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchBadges = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/users/badges');
          if (!response.ok) {
            throw new Error('Failed to fetch badges');
          }
          const data = await response.json();
          setBadges(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBadges();
    } else {
      setBadges([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  return { badges, isLoading, error };
}