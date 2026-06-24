"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import { createClient } from "@/lib/supabase/client";

export default function ListingCard({ listing }: { listing: any }) {
  const supabase = createClient();
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("listing_id", listing.id)
        .eq("is_hidden", false);

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(avg);
      }
    };
    fetchRating();
  }, [supabase, listing.id]);

  const coverImage = listing.listing_images?.[0]?.image_url || "/images/placeholder-apartment.jpg";

  return (
    <Link
      href={`/apartments/${listing.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:shadow-md transition-all"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={coverImage}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {listing.users?.verification_status === "verified" && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            <VerifiedBadge />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{listing.categories?.name}</span>
            {avgRating !== null && (
              <div className="flex text-accent text-[10px] mt-1">
                {"★".repeat(Math.round(avgRating))}
                <span className="text-gray-400 ml-1">({avgRating.toFixed(1)})</span>
              </div>
            )}
          </div>
          <span className="text-primary font-bold">GH₵ {listing.price}</span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-gray-500 text-sm">{listing.area}, {listing.city}</p>

        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-gray-400">
          <span>{listing.bedrooms} Bedrooms • {listing.bathrooms} Baths</span>
          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
