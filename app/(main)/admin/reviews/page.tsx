"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminReviewsPage() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*, reviewer:reviewer_id(full_name), listing:listing_id(title)")
      .eq("is_flagged", true)
      .order("created_at", { ascending: false });

    if (data) setReviews(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAction = async (id: string, action: "keep" | "hide" | "delete") => {
    const { data: { user: admin } } = await supabase.auth.getUser();

    let error;
    if (action === "keep") {
      ({ error } = await supabase.from("reviews").update({ is_flagged: false }).eq("id", id));
    } else if (action === "hide") {
      ({ error } = await supabase.from("reviews").update({ is_hidden: true, is_flagged: false }).eq("id", id));
    } else {
      ({ error } = await supabase.from("reviews").delete().eq("id", id));
    }

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: admin?.id,
        action: `${action}_review`,
        target_type: "review",
        target_id: id,
        details: `Admin took ${action} action on flagged review`
      });
      fetchReviews();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Review Moderation</h1>
        <p className="text-gray-500">Manage flagged reviews from users.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Review Content</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Author</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm font-bold text-text-primary line-clamp-1 mb-1">{rev.listing?.title}</p>
                    <p className="text-sm text-gray-600 italic">&quot;{rev.comment}&quot;</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {rev.reviewer?.full_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-accent text-xs">
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleAction(rev.id, "keep")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Dismiss Flag"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleAction(rev.id, "hide")}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Hide Review"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 14.122l4.242-4.242m-2.422-2.422a9 9 0 013.598 3.598m0 0l6.126 6.126" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleAction(rev.id, "delete")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Permanently"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No flagged reviews to moderate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
