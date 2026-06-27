"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
  "Brong-Ahafo", "Oti", "Savannah", "North East", "Western North"
];

export default function FilterPanel({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`/apartments?${params.toString()}`);
  };

  const Content = () => (
    <div className={`${isMobile ? "space-y-6" : "bg-white rounded-2xl p-6 border border-border shadow-sm space-y-8"}`}>
      <div>
        <h3 className="font-bold mb-4">Location</h3>
        <div className="space-y-4">
          <select
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none"
            value={searchParams.get("region") || ""}
            onChange={(e) => updateFilter("region", e.target.value)}
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            type="text"
            placeholder="City or Town"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none"
            value={searchParams.get("city") || ""}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Apartment Type</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                className="w-4 h-4 text-primary"
                checked={searchParams.get("type") === cat.id}
                onChange={() => updateFilter("type", cat.id)}
              />
              <span className="text-sm text-gray-600">{cat.name}</span>
            </label>
          ))}
          <button
            onClick={() => updateFilter("type", "")}
            className="text-xs text-primary font-bold hover:underline pt-2"
          >
            Clear Type
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Price Range (GH₵)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none"
            value={searchParams.get("minPrice") || ""}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none"
            value={searchParams.get("maxPrice") || ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Bedrooms</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => updateFilter("bedrooms", n.toString())}
              className={`flex-grow py-2 rounded-lg text-sm border ${
                searchParams.get("bedrooms") === n.toString()
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary"
              }`}
            >
              {n}{n === 4 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          router.push("/apartments");
          if (isMobile) setIsOpen(false);
        }}
        className="w-full py-3 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-6.414-6.414A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsOpen(false)} className="p-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Content />
              <div className="mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-primary py-4 rounded-2xl"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <Content />;
}
