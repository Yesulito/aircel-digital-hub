"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
  "Brong-Ahafo", "Oti", "Savannah", "North East", "Western North"
];

const FACILITIES = [
  "Water supply", "Electricity with prepaid meter", "Security / Gated compound",
  "Generator backup", "Air conditioning", "Furnished apartment",
  "Internet / WiFi available", "Balcony", "Boys quarters"
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);

  const fetchListing = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("*, listing_images(*)")
      .eq("id", params.id)
      .eq("landlord_id", user.id)
      .single();

    if (!listing) {
      router.push("/dashboard/listings");
    } else {
      setFormData({
        ...listing,
        price: listing.price.toString(),
        rooms: listing.rooms.toString(),
        bedrooms: listing.bedrooms.toString(),
        bathrooms: listing.bathrooms.toString(),
      });
      setImages(listing.listing_images.sort((a: any, b: any) => a.display_order - b.display_order));
      setLoading(false);
    }
  }, [supabase, router, params.id]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true);
      if (data) setCategories(data);
    };
    fetchCategories();
    fetchListing();
  }, [supabase, fetchListing]);

  const handleFacilityChange = (facility: string) => {
    const newFacilities = formData.facilities.includes(facility)
      ? formData.facilities.filter((f: string) => f !== facility)
      : [...formData.facilities, facility];
    setFormData({ ...formData, facilities: newFacilities });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 3) {
      alert("Minimum 3 photos required");
      return;
    }

    setSaving(true);
    try {
      // 1. Update listing
      const { error: listingError } = await supabase
        .from("listings")
        .update({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          price: parseFloat(formData.price),
          availability_status: formData.availability_status,
          available_from: formData.available_from || null,
          region: formData.region,
          city: formData.city,
          area: formData.area,
          street_name: formData.street_name,
          landmark: formData.landmark,
          rooms: parseInt(formData.rooms),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          bathroom_type: formData.bathroom_type,
          kitchen_type: formData.kitchen_type,
          parking: formData.parking,
          facilities: formData.facilities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (listingError) throw listingError;

      // 2. Update images
      // Simplest way is delete all and re-insert or complex diff.
      // For now, we'll just handle display order if changed or just use existing.

      router.push("/dashboard/listings");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setSaving(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 15) break;

        const uploadData = new FormData();
        uploadData.append("file", files[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const data = await response.json();
        if (data.secure_url) {
          const { data: dbImg, error } = await supabase
            .from("listing_images")
            .insert({
              listing_id: params.id,
              image_url: data.secure_url,
              cloudinary_public_id: data.public_id,
              display_order: newImages.length,
            })
            .select()
            .single();

          if (!error) newImages.push(dbImg);
        }
      }
      setImages(newImages);
    } catch (error: any) {
      alert("Failed to upload images: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (id: string, index: number) => {
    const { error } = await supabase.from("listing_images").delete().eq("id", id);
    if (!error) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this listing permanently?")) {
      setSaving(true);
      await supabase.from("listings").delete().eq("id", params.id);
      router.push("/dashboard/listings");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <button onClick={handleDelete} className="text-error font-bold hover:underline">Delete Listing</button>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-8 shadow-sm border border-border space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (GH₵)</label>
                <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rooms</label>
                <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.rooms} onChange={e => setFormData({ ...formData, rooms: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms</label>
                <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Facilities</label>
              <div className="grid grid-cols-2 gap-3">
                {FACILITIES.map(f => (
                  <label key={f} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" checked={formData.facilities.includes(f)} onChange={() => handleFacilityChange(f)} />
                    <span className="text-sm text-gray-600">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(img.id, i)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {images.length < 15 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={saving} />
                  <span className="text-xs text-gray-400">{saving ? "Uploading..." : "Add Photo"}</span>
                </label>
              )}
            </div>
          </section>

          <div className="pt-8 border-t border-border">
            <button type="submit" disabled={saving} className="w-full btn-primary py-4">
              {saving ? "Updating..." : "Save All Changes"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
