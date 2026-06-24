"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("saved_listings")
          .select("*")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .single();
        if (data) setIsSaved(true);
      }
      setLoading(false);
    };
    checkSaved();
  }, [supabase, listingId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to save favorites");
      return;
    }

    if (isSaved) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setIsSaved(false);
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
      setIsSaved(true);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggleFavorite}
      className={`p-3 rounded-full border transition-all ${
        isSaved
        ? "bg-red-50 border-red-100 text-red-500 shadow-sm"
        : "bg-white border-border text-gray-400 hover:text-red-500"
      }`}
    >
      <svg className={`h-6 w-6 ${isSaved ? "fill-current" : "fill-none"}`} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
