import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { createClient } from "@/lib/supabase/server";
import HomepageSearch from "@/components/search/HomepageSearch";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const { data: latestListings } = await supabase
    .from("listings")
    .select("*, categories(name), listing_images(image_url), users(verification_status)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        {/* SECTION A — HERO */}
        <section className="relative h-[650px] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="relative z-20 text-center max-w-5xl px-4 flex flex-col items-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 text-white leading-tight">Find Your Next Home <br/> in Ghana</h1>
            <p className="text-lg md:text-2xl mb-12 text-gray-200 max-w-2xl">Browse verified apartment listings across all regions — no agents, no stress.</p>

            <HomepageSearch categories={categories || []} />
          </div>
        </section>

        {/* SECTION B — LATEST LISTINGS */}
        <section className="max-w-1280 mx-auto px-4 py-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recently Added Apartments</h2>
              <p className="text-gray-500">The newest verified listings across Ghana.</p>
            </div>
            <Link href="/apartments" className="text-primary font-bold hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestListings?.map((listing: any) => (
              <Link key={listing.id} href={`/apartments/${listing.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:shadow-md transition-all">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {listing.listing_images?.[0] && (
                    <img src={listing.listing_images[0].image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                  {listing.users?.verification_status === "verified" && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-success border border-success/20">VERIFIED</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase">{listing.categories?.name}</span>
                    <span className="text-primary font-bold">GH₵ {listing.price}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{listing.title}</h3>
                  <p className="text-gray-500 text-sm">{listing.area}, {listing.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION C — BROWSE BY REGION */}
        <section className="bg-white py-20">
          <div className="max-w-1280 mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10">Search by Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {["Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta"].map((region) => (
                <Link
                  key={region}
                  href={`/apartments?region=${region}`}
                  className="aspect-square bg-background rounded-2xl flex flex-col items-center justify-center border border-border hover:border-primary hover:shadow-md cursor-pointer transition-all p-4 group"
                >
                  <span className="font-bold text-center group-hover:text-primary transition-colors">{region}</span>
                  <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Browse Listings</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION D — HOW IT WORKS */}
        <section className="max-w-1280 mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold mb-16 text-center">How Hiredan Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 text-primary text-3xl font-bold">1</div>
              <h3 className="text-2xl font-bold mb-4">Search your location</h3>
              <p className="text-gray-600 leading-relaxed">Enter your region, city, and budget to find apartments near you.</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 text-primary text-3xl font-bold">2</div>
              <h3 className="text-2xl font-bold mb-4">Browse and compare</h3>
              <p className="text-gray-600 leading-relaxed">View photos, read full details, and compare apartments side by side.</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 text-primary text-3xl font-bold">3</div>
              <h3 className="text-2xl font-bold mb-4">Contact the landlord</h3>
              <p className="text-gray-600 leading-relaxed">Reach out by phone or WhatsApp with one tap. No middlemen.</p>
            </div>
          </div>
        </section>

        {/* SECTION E — WHY HIREDAN? */}
        <section className="bg-primary text-white py-24">
          <div className="max-w-1280 mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">Why Ghanaians Choose Hiredan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { title: "Verified Landlords", desc: "Every landlord is identity-verified before they can post." },
                { title: "Real Photos", desc: "Minimum 3 photos per listing so you know what you are getting." },
                { title: "Free to Browse", desc: "No registration needed to search. Just open and explore." },
                { title: "Built for Ghana", desc: "Designed specifically for Ghanaian renters, landlords, and agents." }
              ].map((point) => (
                <div key={point.title} className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-bold mb-4">{point.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
