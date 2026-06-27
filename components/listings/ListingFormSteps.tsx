"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function ListingFormSteps() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    price: "",
    availabilityStatus: "available_now",
    availableFrom: "",
    region: "",
    city: "",
    area: "",
    streetName: "",
    landmark: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    bathroomType: "private",
    kitchenType: "private",
    parking: false,
    facilities: [] as string[],
    description: "",
  });

  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 15) break;

        const formData = new FormData();
        formData.append("file", files[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          newImages.push({ url: data.secure_url, publicId: data.public_id });
        }
      }
      setImages(newImages);
    } catch (error: any) {
      alert("Failed to upload images: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...images];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (images.length < 3) {
      alert("Minimum 3 photos required");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // 1. Create listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          landlord_id: user.id,
          title: formData.title,
          description: formData.description,
          category_id: formData.categoryId,
          price: parseFloat(formData.price),
          availability_status: formData.availabilityStatus,
          available_from: formData.availableFrom || null,
          region: formData.region,
          city: formData.city,
          area: formData.area,
          street_name: formData.streetName,
          landmark: formData.landmark,
          rooms: parseInt(formData.rooms),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          bathroom_type: formData.bathroomType,
          kitchen_type: formData.kitchenType,
          parking: formData.parking,
          facilities: formData.facilities,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // 2. Save images
      const imageData = images.map((img, index) => ({
        listing_id: listing.id,
        image_url: img.url,
        cloudinary_public_id: img.publicId,
        display_order: index,
      }));

      const { error: imageError } = await supabase.from("listing_images").insert(imageData);
      if (imageError) throw imageError;

      router.push("/dashboard/listings");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-primary">Step {step} of 6</span>
          <span className="text-sm text-gray-500">
            {step === 1 && "Basic Information"}
            {step === 2 && "Location"}
            {step === 3 && "Apartment Details"}
            {step === 4 && "Description"}
            {step === 5 && "Photos"}
            {step === 6 && "Review & Submit"}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: BASIC INFORMATION */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Apartment Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Spacious 2-Bedroom Apartment in East Legon"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Rent (GH₵)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              placeholder="2500"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Availability</label>
            <select
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              value={formData.availabilityStatus}
              onChange={e => setFormData({ ...formData, availabilityStatus: e.target.value })}
            >
              <option value="available_now">Available Now</option>
              <option value="available_from">Available From Date</option>
              <option value="not_available">Not Currently Available</option>
            </select>
          </div>
          {formData.availabilityStatus === "available_from" && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                value={formData.availableFrom}
                onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
              />
            </div>
          )}
          <div className="flex justify-end pt-4">
            <button onClick={nextStep} className="btn-primary">Next Step</button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              value={formData.region}
              onChange={e => setFormData({ ...formData, region: e.target.value })}
            >
              <option value="">Select Region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City or Town</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Accra"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Area or Suburb</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Spintex"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Flower Road"
                value={formData.streetName}
                onChange={e => setFormData({ ...formData, streetName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Opposite Melcom"
              value={formData.landmark}
              onChange={e => setFormData({ ...formData, landmark: e.target.value })}
            />
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="btn-outline">Back</button>
            <button onClick={nextStep} className="btn-primary">Next Step</button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Rooms</label>
              <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms</label>
              <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bathrooms</label>
              <input type="number" className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bathroom Type</label>
              <select className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.bathroomType} onChange={e => setFormData({...formData, bathroomType: e.target.value})}>
                <option value="private">Private</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kitchen Type</label>
              <select className="w-full px-4 py-3 border border-border rounded-xl outline-none" value={formData.kitchenType} onChange={e => setFormData({...formData, kitchenType: e.target.value})}>
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="none">No Kitchen</option>
              </select>
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary" checked={formData.parking} onChange={e => setFormData({...formData, parking: e.target.checked})} />
              <span className="text-sm font-medium">Parking Available</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Additional Facilities</label>
            <div className="grid grid-cols-2 gap-3">
              {FACILITIES.map(f => (
                <label key={f} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    checked={formData.facilities.includes(f)}
                    onChange={() => handleFacilityChange(f)}
                  />
                  <span className="text-sm text-gray-600">{f}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="btn-outline">Back</button>
            <button onClick={nextStep} className="btn-primary">Next Step</button>
          </div>
        </div>
      )}

      {/* STEP 4: DESCRIPTION */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <p className="text-xs text-gray-500 mb-2">Tell renters more about this apartment. Include anything not covered above.</p>
            <textarea
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary h-40 resize-none"
              placeholder="e.g. This apartment is located in a quiet neighborhood..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              minLength={50}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{formData.description.length < 50 ? "Min 50 characters required" : ""}</span>
              <span className="text-xs text-gray-400">{formData.description.length}/2000</span>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="btn-outline">Back</button>
            <button
              onClick={nextStep}
              disabled={formData.description.length < 50}
              className="btn-primary disabled:opacity-50"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PHOTOS */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Apartment Photos</label>
            <p className="text-xs text-gray-500 mb-4">Minimum 3 photos required. Maximum 15.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={img.url} alt={`Apartment ${i}`} className="w-full h-full object-cover" />

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeImage(i)}
                        className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        disabled={i === 0}
                        onClick={() => moveImage(i, "left")}
                        className="bg-white/20 text-white p-1 rounded-full hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        disabled={i === images.length - 1}
                        onClick={() => moveImage(i, "right")}
                        className="bg-white/20 text-white p-1 rounded-full hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[10px] py-1 text-center font-bold">COVER</div>
                  )}
                </div>
              ))}
              {images.length < 15 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading} />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-400">{loading ? "Uploading..." : "Add Photo"}</span>
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="btn-outline">Back</button>
            <button onClick={nextStep} disabled={images.length < 3 || loading} className="btn-primary disabled:opacity-50">
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW */}
      {step === 6 && (
        <div className="space-y-8">
          <div className="border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-2xl font-bold">{formData.title}</h3>
            <p className="text-primary font-bold text-xl">GH₵ {formData.price} / month</p>
            <p className="text-gray-600">{formData.city}, {formData.region}</p>
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
              <p><span className="font-bold">Rooms:</span> {formData.rooms}</p>
              <p><span className="font-bold">Type:</span> {formData.bathroomType} bathroom, {formData.kitchenType} kitchen</p>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="btn-outline">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary px-12">
              {loading ? "Posting..." : "Submit Listing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
