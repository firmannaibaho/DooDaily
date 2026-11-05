import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userQueries } from "./db";
import bcrypt from "bcryptjs";

/**
 * Secret tunggal untuk Auth.js DAN middleware proxy.
 * Nilai ini dipakai menandatangani/membaca JWT, jadi harus identik di kedua
 * tempat. Dipusatkan di sini agar tidak pernah berbeda.
 *
 * Prioritas: AUTH_SECRET (konvensi Auth.js v5) → NEXTAUTH_SECRET (v4).
 */
export const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await userQueries.findByEmail(credentials.email as string);
        if (!user) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  /**
   * Secret dipakai untuk menandatangani JWT. `proxy.ts` membaca token dengan
   * secret yang HARUS sama, jadi nilainya dipusatkan di satu konstanta ini.
   * AUTH_SECRET diutamakan agar selaras dengan konvensi Auth.js v5.
   */
  secret: AUTH_SECRET,
  /**
   * Di belakang reverse proxy (Jelastic/DewaCloud, Nginx, Docker) Auth.js
   * menerima header Host dari proxy. Tanpa ini Auth.js melempar
   * `UntrustedHost` dan /api/auth/session balas 500.
   */
  trustHost: true,
});
