import { auth } from '@/auth';

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export class AuthMiddleware {
  static async requireAuth(): Promise<AuthenticatedUser> {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error('UNAUTHORIZED');
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  }

  static async withAuth<T>(
    handler: (user: AuthenticatedUser) => Promise<T>
  ): Promise<T> {
    try {
      const user = await this.requireAuth();
      return await handler(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        throw error;
      }
      throw error;
    }
  }
}