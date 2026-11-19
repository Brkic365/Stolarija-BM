import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";

// Constant-time string compare so response time doesn't leak how much of a guess was right
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// ADMIN_USERNAME / ADMIN_PASSWORD are preferred. USER / PASSWORD are kept as a fallback
// so the existing Vercel env vars keep working (USER can clash with the OS user name).
function adminCredentials() {
  const username = process.env.ADMIN_USERNAME ?? process.env.USER;
  const password = process.env.ADMIN_PASSWORD ?? process.env.PASSWORD;
  return { username, password };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "username",
          placeholder: "Korisničko ime",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = adminCredentials();
        if (!username || !password) return null;

        const okUser = safeEqual(credentials?.username ?? "", username);
        const okPass = safeEqual(credentials?.password ?? "", password);

        if (okUser && okPass) {
          return { id: "admin", name: username, role: "admin" } as any;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      session.user = { name: token.name, role: token.role } as any;
      return session;
    },
  },
};
