"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("verification_status")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handlePostListing = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push("/login");
      return;
    }

    if (profile?.verification_status !== "verified") {
      e.preventDefault();
      router.push("/dashboard/verification");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-1280 mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-primary">
          Hiredan
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-text-primary hover:text-primary font-medium">Home</Link>
          <Link href="/apartments" className="text-text-primary hover:text-primary font-medium">Search</Link>
          <Link
            href="/dashboard/listings/new"
            onClick={handlePostListing}
            className="text-text-primary hover:text-primary font-medium"
          >
            Post Apartment
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-primary font-medium hover:underline">Dashboard</Link>
              <button onClick={handleLogout} className="btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-primary font-medium hover:underline">Login</Link>
              <Link href="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
