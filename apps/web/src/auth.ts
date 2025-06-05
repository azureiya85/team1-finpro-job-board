import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: UserRole;
    isEmailVerified: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
    isEmailVerified: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const { authHelpers } = await import('@/lib/authHelpers'); 
          const userFromHelper = await authHelpers.verifyCredentials(email, password);

          if (userFromHelper) {
            console.log("AUTHORIZE: User verified from helper:", {
              id: userFromHelper.id,
              email: userFromHelper.email,
              role: userFromHelper.role
            });
            return {
              id: userFromHelper.id,
              email: userFromHelper.email!,
              name: userFromHelper.name,
              image: userFromHelper.avatar, 
              role: userFromHelper.role as UserRole, 
              isEmailVerified: userFromHelper.isVerified,
            };
          }
        } catch (e) {
          console.error("Error in authorize (dynamic import or verifyCredentials):", e);
          return null; 
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, 
    updateAge: 24 * 60 * 60, // Force session refresh every 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, 
  },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      console.log("JWT callback trigger:", trigger);
      
      if (user) {
        console.log("JWT callback - setting user data in token:", {
          userId: user.id,
          email: user.email,
          role: user.role
        });
        // Clear any existing token data first
        token.uid = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        token.email = user.email; 
      }
      
      console.log("JWT callback - final token:", {
        uid: token.uid,
        email: token.email,
        role: token.role
      });
      
      return token;
    },
    session: async ({ session, token }) => {
      console.log("SESSION callback - received token:", {
        tokenUid: token.uid,
        tokenEmail: token.email,
        sessionEmail: session.user?.email
      });
      
      if (token && session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.isEmailVerified = token.isEmailVerified;
        
        // Ensure consistency
        if (token.email) {
          session.user.email = token.email;
        }
      }
      
      console.log("SESSION callback - final session:", {
        userId: session.user?.id,
        email: session.user?.email,
        role: session.user?.role
      });
      
      return session;
    },
  },
  events: {
    async signOut(message) {
      console.log("SIGNOUT event triggered:", message);
    },
    async signIn(message) {
      console.log("SIGNIN event triggered:", message.user?.email);
    },
    async session(message) {
      console.log("SESSION event triggered for user:", message.session.user?.email);
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
});