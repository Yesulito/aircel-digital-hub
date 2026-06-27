"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({
  listingId,
  landlordId,
  onSuccess
}: {
  listingId: string;
  landlordId: string;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to leave a review.");

      if (user.id === landlordId) {
        throw new Error("You cannot review your own listing.");
      }

      const { error: dbError } = await supabase
        .from("reviews")
        .insert({
          listing_id: listingId,
          landlord_id: landlordId,
          reviewer_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

      if (dbError) throw dbError;

      setRating(0);
      setComment("");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Your Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? "text-accent" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Written Comment (Optional)</label>
        <textarea
          className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary h-24 resize-none text-sm"
          placeholder="What was your experience with this apartment or landlord?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Post Review"}
      </button>
    </form>
  );
}
