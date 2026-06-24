import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FilterPanel from "@/components/search/FilterPanel";
import ListingCard from "@/components/listings/ListingCard";

export default async function ApartmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  // Build query
  let query = supabase
    .from("listings")
    .select("*, categories(name), listing_images(image_url), users(full_name, verification_status)", { count: "exact" })
    .eq("status", "active");

  // Apply filters
  if (searchParams.region) query = query.eq("region", searchParams.region);
  if (searchParams.city) query = query.ilike("city", `%${searchParams.city}%`);
  if (searchParams.type) query = query.eq("category_id", searchParams.type);
  if (searchParams.maxPrice) query = query.lte("price", parseFloat(searchParams.maxPrice as string));
  if (searchParams.minPrice) query = query.gte("price", parseFloat(searchParams.minPrice as string));
  if (searchParams.bedrooms) query = query.eq("bedrooms", parseInt(searchParams.bedrooms as string));

  // Sort
  const sort = searchParams.sort || "newest";
  if (sort === "price_low") query = query.order("price", { ascending: true });
  else if (sort === "price_high") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  // Pagination
  const pageSize = 20;
  const page = parseInt(searchParams.page as string || "1");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: listings, count } = await query.range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-1280 mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Results Area */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">
                {count || 0} {count === 1 ? "apartment" : "apartments"} found
              </h1>

              <div className="flex items-center space-x-4">
                {/* Mobile Filter Trigger - Hidden on Desktop */}
                <div className="md:hidden">
                  <FilterPanel isMobile />
                </div>

                <select
                  className="bg-white border border-border px-3 py-2 rounded-lg text-sm outline-none"
                  defaultValue={searchParams.sort || "newest"}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {listings && listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-4">
                    <Link
                      href={{
                        query: { ...searchParams, page: Math.max(1, page - 1) },
                      }}
                      className={`btn-outline px-4 py-2 ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      Previous
                    </Link>
                    <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                    <Link
                      href={{
                        query: { ...searchParams, page: Math.min(totalPages, page + 1) },
                      }}
                      className={`btn-outline px-4 py-2 ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border border-border">
                <p className="text-gray-500 mb-4">No apartments found matching your search.</p>
                <Link href="/apartments" className="text-primary font-bold hover:underline">
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
