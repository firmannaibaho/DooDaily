"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (result?.error) {
      setError("Email atau password salah");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border-2 border-brand-blue-light p-8">
        <h1 className="font-display text-3xl text-brand-blue text-center mb-2">
          Login 🔐
        </h1>
        <p className="text-center text-foreground/60 font-medium mb-6">
          Masuk ke akun Doodaily kamu
        </p>

        {justRegistered && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm font-medium mb-4">
            ✅ Registrasi berhasil! Silakan login.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground/70 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium transition-colors"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/70 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium transition-colors"
              placeholder="Password kamu"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-xl"
            disabled={loading}
          >
            {loading ? "Masuk..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-brand-blue font-bold hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
