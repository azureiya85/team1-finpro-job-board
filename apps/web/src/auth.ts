import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Twitter from "next-auth/providers/twitter";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

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

        try {
          const { authHelpers } = await import('@/lib/authHelpers');
          const user = await authHelpers.verifyCredentials(
            credentials.email as string,
            credentials.password as string
          );

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatar,
              role: user.role as UserRole,
              isEmailVerified: user.isVerified,
            };
          }
        } catch (error) {
          console.error("Authorization error:", error);
        }
        
        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // Handle social login
      if (account && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                lastLoginAt: new Date(),
                // Only update provider info if it's not already set
                ...(existingUser.provider === 'EMAIL' && {
                  provider: account.provider.toUpperCase() as 'GOOGLE' | 'FACEBOOK' | 'TWITTER',
                  providerId: account.providerAccountId,
                }),
              },
            });

            // Update the user object for the session
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.isEmailVerified = existingUser.isEmailVerified;
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || 'User',
                image: user.image,
                role: UserRole.USER,
                provider: account.provider.toUpperCase() as 'GOOGLE' | 'FACEBOOK' | 'TWITTER',
                providerId: account.providerAccountId,
                isEmailVerified: true, // Social accounts are pre-verified
                emailVerified: new Date(),
                lastLoginAt: new Date(),
              },
            });

            user.id = newUser.id;
            user.role = newUser.role;
            user.isEmailVerified = true;
          }

          return true;
        } catch (error) {
          console.error("Social sign-in error:", error);
          return false;
        }
      }

      return false;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.isEmailVerified = token.isEmailVerified;
        
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
});