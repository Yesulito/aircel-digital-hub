"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        body: JSON.stringify({ action: "send", phoneNumber: formData.phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verify OTP
      const otpResponse = await fetch("/api/otp", {
        method: "POST",
        body: JSON.stringify({
          action: "verify",
          phoneNumber: formData.phoneNumber,
          otp
        }),
      });

      const otpData = await otpResponse.json();
      if (!otpResponse.ok) throw new Error(otpData.message || "Invalid OTP");

      // 2. Register User in Supabase Auth
      // We use email-like format for phone number in Supabase Auth if needed,
      // or use the phone number directly if configured.
      // For this demo, we'll use a fake email based on phone to ensure it works with default settings.
      const email = `${formData.phoneNumber}@hiredan.com.gh`;

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
          },
        },
      });

      if (authError) throw authError;

      // 3. Create User in public.users table
      if (data.user) {
        const { error: dbError } = await supabase.from("users").insert({
          id: data.user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          role: "renter",
        });

        if (dbError) throw dbError;
      }

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
          <h2 className="text-2xl font-bold mt-4">Create your account</h2>
          <p className="text-gray-500 mt-2">Join Ghana&apos;s trusted rental marketplace</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Prince Mensah"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
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
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                We sent a 6-digit code to <span className="font-bold">{formData.phoneNumber}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1 text-center">Enter Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-primary font-medium text-sm hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
