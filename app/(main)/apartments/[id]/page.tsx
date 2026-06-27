import React from "react";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import FavoriteButton from "@/components/listings/FavoriteButton";
import ReviewsSection from "@/components/listings/ReviewsSection";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, city, region")
    .eq("id", params.id)
    .single();

  if (!listing) return { title: "Listing Not Found" };

  return {
    title: `${listing.title} - Hiredan`,
    description: listing.description.substring(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.substring(0, 160),
      type: "website",
    },
  };
}

export default async function ApartmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      categories(name),
      listing_images(image_url),
      users(full_name, avatar_url, verification_status, created_at, phone_number)
    `)
    .eq("id", params.id)
    .single();

  if (!listing) {
    return <div className="min-h-screen flex items-center justify-center">Listing not found.</div>;
  }

  // Fetch similar listings
  const { data: similarListings } = await supabase
    .from("listings")
    .select("*, categories(name), listing_images(image_url)")
    .eq("category_id", listing.category_id)
    .neq("id", listing.id)
    .limit(3);

  const whatsappMessage = encodeURIComponent(`Hello, I found your apartment "${listing.title}" on Hiredan and I am interested. Is it still available?`);
  const whatsappUrl = `https://wa.me/${listing.users.phone_number}?text=${whatsappMessage}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-1280 mx-auto px-4 py-8 w-full">
        {/* Photo Gallery */}
        <div className="mb-8">
          {/* Mobile Swipe Gallery */}
          <div className="md:hidden relative group">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl h-[300px]">
              {listing.listing_images.map((img: any, i: number) => (
                <div key={i} className="min-w-full h-full snap-center shrink-0">
                  <img
                    src={img.image_url}
                    className="w-full h-full object-cover"
                    alt={`${listing.title} - ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs pointer-events-none">
              Swipe for more • {listing.listing_images.length} photos
            </div>
          </div>

          {/* Desktop Gallery Grid */}
          <div className="hidden md:grid grid-cols-2 gap-4 h-[500px]">
            <div className="h-full bg-gray-200 rounded-2xl overflow-hidden relative">
              <img
                src={listing.listing_images[0]?.image_url}
                className="w-full h-full object-cover"
                alt={listing.title}
              />
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                1 / {listing.listing_images.length}
              </div>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl overflow-hidden">
                  {listing.listing_images[i] && (
                    <img
                      src={listing.listing_images[i].image_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                    {listing.categories.name}
                  </span>
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <p className="text-gray-500 mt-1">{listing.street_name}, {listing.area}, {listing.city}</p>
                </div>
                <div className="flex flex-col items-end space-y-4 ml-4">
                  <FavoriteButton listingId={listing.id} />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">GH₵ {listing.price}</p>
                    <p className="text-gray-500 text-sm">per month</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-border py-6 my-8">
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Bedrooms</p>
                  <p className="font-bold text-lg">{listing.bedrooms}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Bathrooms</p>
                  <p className="font-bold text-lg">{listing.bathrooms}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Rooms</p>
                  <p className="font-bold text-lg">{listing.rooms}</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              {listing.landmark && (
                <p className="mt-4 text-sm text-gray-500 italic"><span className="font-bold">Landmark:</span> {listing.landmark}</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.facilities?.map((f: string) => (
                  <div key={f} className="flex items-center space-x-2 text-gray-600">
                    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar (Landlord & Contact) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-border shadow-sm sticky top-24">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
                  {listing.users.avatar_url ? (
                    <img src={listing.users.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    listing.users.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">{listing.users.full_name}</h3>
                    {listing.users.verification_status === "verified" && <VerifiedBadge />}
                  </div>
                  <p className="text-gray-500 text-xs">Member since {new Date(listing.users.created_at).getFullYear()}</p>
                </div>
              </div>

              {user ? (
                <div className="space-y-3">
                  <a href={`tel:${listing.users.phone_number}`} className="w-full btn-outline flex items-center justify-center space-x-2 py-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 011.94.445l-.992 2.852a1 1 0 01-1.247.633l-1.465-.475a11.042 11.042 0 005.516 5.516l.474-1.465a1 1 0 01.633-1.247l2.853-.992a1 1 0 011.112 1.685l-1.062 1.062a1 1 0 01-.67.313 11.038 11.038 0 01-5.116-5.116a1 1 0 01.313-.67l1.062-1.062z" />
                    </svg>
                    <span>Call Landlord</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    className="w-full bg-[#25D366] text-white py-3 rounded-2xl flex items-center justify-center space-x-2 font-bold hover:opacity-90 transition-all shadow-sm"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="text-center p-4 bg-background rounded-2xl">
                  <p className="text-sm text-gray-600 mb-4">Log in to view the landlord&apos;s contact information.</p>
                  <div className="flex flex-col space-y-2">
                    <Link href="/login" className="btn-primary">Log In</Link>
                    <Link href="/register" className="text-primary font-bold text-sm hover:underline">Create an Account</Link>
                  </div>
                </div>
              )}

              <button className="w-full mt-6 py-2 text-gray-400 text-sm font-bold flex items-center justify-center space-x-2 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Report this listing</span>
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection listingId={listing.id} landlordId={listing.landlord_id} />

        {/* Similar Listings */}
        <section className="mt-24 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarListings?.map((l: any) => (
              <Link key={l.id} href={`/apartments/${l.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:shadow-md transition-all">
                <div className="h-40 bg-gray-200">
                  {l.listing_images?.[0] && (
                    <img src={l.listing_images[0].image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-primary font-bold">GH₵ {l.price}</p>
                  <h4 className="font-bold line-clamp-1">{l.title}</h4>
                  <p className="text-gray-500 text-xs">{l.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
