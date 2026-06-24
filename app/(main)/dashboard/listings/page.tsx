import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandlordListingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(name), listing_images(image_url)")
    .eq("landlord_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-1280 mx-auto px-4 py-12 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Link href="/dashboard/listings/new" className="btn-primary">Post New Apartment</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings?.map((listing: any) => (
            <div key={listing.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group">
              <div className="relative h-48 bg-gray-200">
                {listing.listing_images?.[0] && (
                  <img
                    src={listing.listing_images[0].image_url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    listing.status === "active" ? "bg-success text-white" : "bg-gray-500 text-white"
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{listing.categories?.name}</span>
                  <span className="text-xs text-gray-500">{listing.view_count} views</span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{listing.title}</h3>
                <p className="text-primary font-bold mb-4">GH₵ {listing.price} / month</p>
                <p className="text-gray-500 text-sm mb-6 line-clamp-1">{listing.area}, {listing.city}</p>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="flex-grow text-center py-2 border border-border rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/apartments/${listing.id}`}
                    className="flex-grow text-center py-2 bg-gray-50 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {(!listings || listings.length === 0) && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-border">
              <p className="text-gray-500 mb-4">You haven&apos;t posted any apartments yet.</p>
              <Link href="/dashboard/listings/new" className="text-primary font-bold hover:underline">
                Post your first apartment now
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
