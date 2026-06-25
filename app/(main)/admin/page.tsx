import React from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Fetch Stats
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: listingCount } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: pendingVerifications } = await supabase.from("verification_requests").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: reportCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: flaggedReviews } = await supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_flagged", true);

  // Fetch Recent Activity
  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select("*, admin:admin_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const stats = [
    { name: "Total Users", value: userCount || 0, href: "/admin/users", color: "bg-blue-500" },
    { name: "Active Listings", value: listingCount || 0, href: "/admin/listings", color: "bg-green-500" },
    { name: "Pending Verifications", value: pendingVerifications || 0, href: "/admin/verifications", color: "bg-amber-500", alert: (pendingVerifications || 0) > 0 },
    { name: "Reported Content", value: reportCount || 0, href: "/admin/reports", color: "bg-red-500" },
    { name: "Flagged Reviews", value: flaggedReviews || 0, href: "/admin/reviews", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-primary">Admin Overview</h1>
        <p className="text-gray-500">Welcome back. Here is what is happening on Hiredan today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className={`bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.name}</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-text-primary">{stat.value}</span>
              {stat.alert && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Activity and Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link href="/admin/logs" className="text-sm text-primary font-bold hover:underline">View All Logs</Link>
          </div>
          <div className="divide-y divide-border">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {log.admin?.full_name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm">
                        <span className="font-bold">{log.admin?.full_name || "Admin"}</span>
                        {" "}{log.action}{" "}
                        <span className="font-medium text-primary uppercase text-[10px] bg-primary/5 px-2 py-0.5 rounded ml-1">
                          {log.target_type}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 italic">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/categories" className="w-full btn-outline flex items-center justify-center space-x-2 py-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Category</span>
              </Link>
              <Link href="/admin/verifications" className="w-full btn-primary flex items-center justify-center space-x-2 py-3 shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Review Pending</span>
              </Link>
            </div>
          </div>

          <div className="bg-primary text-white rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-white/70 text-sm mb-6">System health is 100%. All services are operational.</p>
            <div className="text-xs text-white/50 space-y-1">
              <p>Supabase: Connected</p>
              <p>Cloudinary: Connected</p>
              <p>Arkesel: Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
