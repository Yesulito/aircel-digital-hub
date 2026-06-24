"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewCard({ review, onFlag }: { review: any; onFlag: () => void }) {
  const supabase = createClient();

  const handleFlag = async () => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_flagged: true })
      .eq("id", review.id);
    if (!error) onFlag();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {review.users?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-bold text-sm">{review.users?.full_name}</p>
            <div className="flex text-accent text-xs">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {review.comment && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>
      )}

      <button
        onClick={handleFlag}
        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
      >
        {review.is_flagged ? "Flagged" : "Flag as inappropriate"}
      </button>
    </div>
  );
}
