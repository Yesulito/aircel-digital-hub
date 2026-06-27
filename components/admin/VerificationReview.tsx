"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerificationReview({
  request,
  onAction
}: {
  request: any;
  onAction: () => void;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleAction = async (status: "verified" | "rejected") => {
    setLoading(true);
    try {
      const { data: { user: admin } } = await supabase.auth.getUser();

      // 1. Update Request
      const { error: reqError } = await supabase
        .from("verification_requests")
        .update({
          status,
          rejection_reason: status === "rejected" ? rejectionReason : null,
          reviewed_by: admin?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (reqError) throw reqError;

      // 2. Update User Status
      const { error: userError } = await supabase
        .from("users")
        .update({
          verification_status: status
        })
        .eq("id", request.user_id);

      if (userError) throw userError;

      // 3. Log Action
      await supabase.from("activity_logs").insert({
        admin_id: admin?.id,
        action: status === "verified" ? "approved" : "rejected",
        target_type: "verification",
        target_id: request.id,
        details: `Verification ${status} for ${request.users.full_name}. ${status === "rejected" ? "Reason: " + rejectionReason : ""}`
      });

      // 4. Notify via WhatsApp (Simulated via API)
      await fetch("/api/verification", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: request.users.phone_number,
          status,
          reason: rejectionReason
        })
      });

      onAction();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-border shadow-lg max-w-4xl w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">{request.users.full_name}</h2>
          <p className="text-gray-500">{request.users.phone_number}</p>
        </div>
        <button onClick={onAction} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Documents</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Ghana Card Front</p>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-border">
                <img src={request.front_image_url} alt="Front" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Ghana Card Back</p>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-border">
                <img src={request.back_image_url} alt="Back" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Selfie & Info</h3>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-border mb-4">
            <img src={request.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-border">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Encrypted Card Number</p>
            <p className="text-sm font-mono break-all">{request.ghana_card_number_encrypted.substring(0, 20)}...</p>
          </div>
        </div>
      </div>

      {!showRejectForm ? (
        <div className="flex space-x-4">
          <button
            onClick={() => handleAction("verified")}
            disabled={loading}
            className="flex-grow btn-primary py-4"
          >
            {loading ? "Processing..." : "Approve Verification"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="flex-grow btn-outline border-red-500 text-red-500 hover:bg-red-50 py-4"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <label className="block text-sm font-bold mb-2">Rejection Reason</label>
            <textarea
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
              placeholder="Explain why the verification was rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleAction("rejected")}
              disabled={loading || !rejectionReason}
              className="flex-grow bg-red-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="btn-outline py-4 px-8"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
