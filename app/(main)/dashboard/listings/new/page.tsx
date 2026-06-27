"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ListingFormSteps from "@/components/listings/ListingFormSteps";

export default function NewListingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("verification_status")
        .eq("id", user.id)
        .single();

      if (profile?.verification_status !== "verified") {
        router.push("/dashboard/verification");
      } else {
        setVerified(true);
        setLoading(false);
      }
    };
    checkUser();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Checking verification status...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!verified) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Post a New Apartment</h1>
        <ListingFormSteps />
      </main>
      <Footer />
    </div>
  );
}
