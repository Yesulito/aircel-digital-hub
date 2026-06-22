"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function VerificationSubmitPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("verifications")
      .upload(path, file);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage || !selfie) {
      setError("Please upload all required photos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const timestamp = Date.now();
      const frontPath = await uploadFile(frontImage, `${user.id}/front_${timestamp}.jpg`);
      const backPath = await uploadFile(backImage, `${user.id}/back_${timestamp}.jpg`);
      const selfiePath = await uploadFile(selfie, `${user.id}/selfie_${timestamp}.jpg`);

      // Store in database (In production, encrypt ghanaCardNumber here or in a DB trigger)
      const { error: dbError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          ghana_card_number_encrypted: ghanaCardNumber, // Simple storage for now
          front_image_url: frontPath,
          back_image_url: backPath,
          selfie_url: selfiePath,
          status: "pending",
        });

      if (dbError) throw dbError;

      // Update user status
      await supabase
        .from("users")
        .update({ verification_status: "pending" })
        .eq("id", user.id);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
            <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for submitting your verification details. Our team will review them within 24-48 hours.
              We will notify you via SMS when your status changes.
            </p>
            <button onClick={() => router.push("/dashboard")} className="btn-primary">
              Return to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Submit Documents</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-border space-y-6">
          {error && (
            <div className="bg-error/10 border border-error text-error p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Ghana Card Number</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
              placeholder="GHA-123456789-0"
              value={ghanaCardNumber}
              onChange={(e) => setGhanaCardNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Ghana Card Front Photo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Ghana Card Back Photo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Selfie Photo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 mt-4 disabled:opacity-50"
          >
            {loading ? "Uploading Documents..." : "Submit for Verification"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
