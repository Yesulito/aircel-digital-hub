"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
  "Brong-Ahafo", "Oti", "Savannah", "North East", "Western North"
];

export default function HomepageSearch({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/apartments?${params.toString()}`);
  };

  return (
    <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col md:flex-row gap-2 max-w-5xl mx-auto w-full">
      <div className="flex-grow p-2 text-left">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Region</label>
        <select
          className="w-full text-text-primary focus:outline-none text-sm font-medium"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="flex-grow p-2 text-left md:border-l border-border">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City or Town</label>
        <input
          type="text"
          placeholder="e.g. Accra"
          className="w-full text-text-primary focus:outline-none text-sm font-medium"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex-grow p-2 text-left md:border-l border-border">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
        <select
          className="w-full text-text-primary focus:outline-none text-sm font-medium"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Any Type</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className="flex-grow p-2 text-left md:border-l border-border">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Budget Max (GH₵)</label>
        <input
          type="number"
          placeholder="e.g. 2500"
          className="w-full text-text-primary focus:outline-none text-sm font-medium"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-primary hover:opacity-90 text-white px-10 py-4 rounded-xl font-bold transition-all"
      >
        Search
      </button>
    </div>
  );
}
