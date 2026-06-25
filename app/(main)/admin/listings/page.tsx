"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminListingsPage() {
  const supabase = createClient();
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const REGIONS = [
    "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta",
    "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
    "Brong-Ahafo", "Oti", "Savannah", "North East", "Western North"
  ];

  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*, users(full_name), categories(name)")
      .order("created_at", { ascending: false });

    if (region) query = query.eq("region", region);
    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category_id", category);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data } = await query;
    if (data) setListings(data);
    setLoading(false);
  }, [supabase, region, status, category, search]);

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    };
    fetchCats();
    fetchListings();
  }, [fetchListings, supabase]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: user?.id,
        action: "updated_listing_status",
        target_type: "listing",
        target_id: id,
        details: `Updated listing status to ${newStatus}`
      });
      fetchListings();
    }
  };

  const handleBulkAction = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to set ${selectedIds.length} listings to ${newStatus}?`)) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .in("id", selectedIds);

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: user?.id,
        action: "bulk_updated_listings",
        target_type: "listing",
        details: `Bulk updated ${selectedIds.length} listings to ${newStatus}`
      });
      setSelectedIds([]);
      fetchListings();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.map(l => l.id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Listings Management</h1>
          <p className="text-gray-500">Monitor and moderate all apartment listings on Hiredan.</p>
        </div>
      </div>

      {/* Bulk Actions & Filters */}
      <div className="space-y-4">
        {selectedIds.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-bold text-primary">{selectedIds.length} listings selected</span>
            <div className="flex space-x-2">
              <button onClick={() => handleBulkAction("active")} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm">Activate</button>
              <button onClick={() => handleBulkAction("hidden")} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm">Hide</button>
              <button onClick={() => handleBulkAction("removed")} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm">Remove</button>
              <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-white border border-border text-xs font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Search Title</label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Region</label>
            <select
              className="px-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
            <select
              className="px-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
            <select
              className="px-4 py-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary"
                    checked={listings.length > 0 && selectedIds.length === listings.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Listing</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Landlord</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((l) => (
                <tr key={l.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(l.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                      checked={selectedIds.includes(l.id)}
                      onChange={() => toggleSelect(l.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link href={`/apartments/${l.id}`} className="font-bold text-text-primary hover:text-primary transition-colors line-clamp-1">
                        {l.title}
                      </Link>
                      <span className="text-xs text-gray-500">{l.categories?.name} • {l.city}, {l.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {l.users?.full_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      l.status === "active" ? "bg-green-100 text-green-700" :
                      l.status === "hidden" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    GH₵ {l.price}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {l.status !== "active" && (
                        <button onClick={() => handleUpdateStatus(l.id, "active")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {l.status !== "hidden" && (
                        <button onClick={() => handleUpdateStatus(l.id, "hidden")} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Hide">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 14.122l4.242-4.242m-2.422-2.422a9 9 0 013.598 3.598m0 0l6.126 6.126" />
                          </svg>
                        </button>
                      )}
                      {l.status !== "removed" && (
                        <button onClick={() => handleUpdateStatus(l.id, "removed")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No listings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
