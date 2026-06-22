"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = `${formData.phoneNumber}@hiredan.com.gh`;

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (authError) throw authError;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif font-bold text-primary">
            Hiredan
          </Link>
          <h2 className="text-2xl font-bold mt-4">Welcome back</h2>
          <p className="text-gray-500 mt-2">Log in to your Hiredan account</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="0244000000"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
