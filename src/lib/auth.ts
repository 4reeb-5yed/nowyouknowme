/**
 * NextAuth.js v5 configuration.
 *
 * Single-user credential-based authentication.
 * Sessions use JWT (stateless, no session table needed).
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Look up the user by email in the database
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          return null;
        }

        // Compare the password using bcryptjs
        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        // Return the user object on success
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
});
