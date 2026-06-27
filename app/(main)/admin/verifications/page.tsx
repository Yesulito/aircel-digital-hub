"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VerificationReview from "@/components/admin/VerificationReview";

export default function AdminVerificationsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("verification_requests")
      .select("*, users(full_name, phone_number)")
      .order("created_at", { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verification Queue</h1>
        <p className="text-gray-500">Review and manage landlord identity verification requests.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Landlord</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Submitted</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary">{req.users?.full_name}</span>
                      <span className="text-xs text-gray-500">{req.users?.phone_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === "pending" ? "bg-amber-100 text-amber-700" :
                      req.status === "verified" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {req.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-primary font-bold text-sm hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No verification requests in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VerificationReview
              request={selectedRequest}
              onAction={() => {
                setSelectedRequest(null);
                fetchRequests();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
