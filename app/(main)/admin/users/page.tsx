"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    let query = supabase.from("users").select("*").order("created_at", { ascending: false });

    if (roleFilter) query = query.eq("role", roleFilter);
    if (search) query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);

    const { data } = await query;
    if (data) setUsers(data);
    setLoading(false);
  }, [supabase, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (id: string, updates: any) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    const { error } = await supabase.from("users").update(updates).eq("id", id);

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: admin?.id,
        action: "updated_user",
        target_type: "user",
        target_id: id,
        details: `Updated user: ${JSON.stringify(updates)}`
      });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-500">Manage all users, landlords, and agents on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-grow min-w-[200px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Search Name or Phone</label>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Role</label>
          <select
            className="px-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="renter">Renter</option>
            <option value="landlord">Landlord</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                        {u.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{u.full_name}</span>
                        <span className="text-xs text-gray-500">{u.phone_number}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg outline-none"
                      value={u.role}
                      onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                    >
                      <option value="renter">RENTER</option>
                      <option value="landlord">LANDLORD</option>
                      <option value="agent">AGENT</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.verification_status === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {u.verification_status}
                      </span>
                      {u.is_suspended && (
                        <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleUpdateUser(u.id, { is_suspended: !u.is_suspended })}
                        className={`p-2 rounded-lg ${u.is_suspended ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"}`}
                        title={u.is_suspended ? "Unsuspend" : "Suspend"}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleUpdateUser(u.id, { is_banned: true, is_suspended: true })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Ban User"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
