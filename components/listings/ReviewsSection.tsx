"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

export default function ReviewsSection({ listingId, landlordId }: { listingId: string; landlordId: string }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, users:reviewer_id(full_name)")
      .eq("listing_id", listingId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data);
    }
    setLoading(false);
  }, [supabase, listingId]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchReviews();
  }, [supabase, fetchReviews]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="mt-16 pt-16 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Reviews</h2>
          <div className="flex items-center space-x-3">
            <div className="flex text-accent text-2xl">
              {"★".repeat(Math.round(Number(averageRating)))}{"☆".repeat(5 - Math.round(Number(averageRating)))}
            </div>
            <span className="font-bold text-xl">{averageRating}</span>
            <span className="text-gray-500">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>
        </div>

        {user && user.id !== landlordId && (
          <div className="w-full md:w-96">
            <ReviewForm listingId={listingId} landlordId={landlordId} onSuccess={fetchReviews} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onFlag={fetchReviews} />
        ))}
        {reviews.length === 0 && !loading && (
          <p className="text-gray-500 italic col-span-full">No reviews yet. Be the first to review this apartment!</p>
        )}
      </div>
    </section>
  );
}
