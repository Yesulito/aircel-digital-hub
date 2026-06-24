"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*, reporter:reporter_id(full_name), listing:listing_id(title), reported_user:reported_user_id(full_name)")
      .order("created_at", { ascending: false });

    if (data) setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [supabase]);

  const handleAction = async (id: string, status: string, actionText: string) => {
    const { data: { user: admin } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("reports")
      .update({ status, admin_action_taken: actionText })
      .eq("id", id);

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: admin?.id,
        action: "resolved_report",
        target_type: "report",
        target_id: id,
        details: `Report ${status}: ${actionText}`
      });
      fetchReports();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports Queue</h1>
        <p className="text-gray-500">Handle reported listings and users.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Reported Content</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Reason</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Reporter</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {report.listing ? (
                        <Link href={`/apartments/${report.listing_id}`} className="font-bold text-text-primary hover:text-primary underline">
                          Listing: {report.listing.title}
                        </Link>
                      ) : (
                        <span className="font-bold text-text-primary">User: {report.reported_user?.full_name}</span>
                      )}
                      <span className="text-[10px] text-gray-400 uppercase mt-1">{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {report.reporter?.full_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      report.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.status === "pending" ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleAction(report.id, "dismissed", "Dismissed - no action needed")}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            const action = prompt("What action was taken? (e.g. Listing removed, User warned)");
                            if (action) handleAction(report.id, "reviewed", action);
                          }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">{report.admin_action_taken}</span>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
