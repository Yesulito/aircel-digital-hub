import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ListingCard from "@/components/listings/ListingCard";
import { redirect } from "next/navigation";

export default async function SavedListingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: saved } = await supabase
    .from("saved_listings")
    .select(`
      listing_id,
      listings (
        *,
        categories(name),
        listing_images(image_url),
        users(verification_status)
      )
    `)
    .eq("user_id", user.id);

  const listings = saved?.map((s: any) => s.listings) || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-1280 mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Saved Apartments</h1>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-border">
            <p className="text-gray-500 mb-4">You haven&apos;t saved any apartments yet.</p>
            <a href="/apartments" className="text-primary font-bold hover:underline">
              Browse apartments to find something you like
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
