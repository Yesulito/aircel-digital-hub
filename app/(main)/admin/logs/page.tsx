"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("activity_logs")
      .select("*, admin:admin_id(full_name)")
      .order("created_at", { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
        <p className="text-gray-500">A chronological record of all significant actions taken on Hiredan.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Admin</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Target</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {log.admin?.full_name?.charAt(0) || "A"}
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">{log.admin?.full_name || "System"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{log.action.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/5 text-primary">
                      {log.target_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No activity logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
