import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-1280 mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              <p className="text-gray-500">{profile?.phone_number}</p>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded mt-2 uppercase tracking-wider">
                {profile?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary cursor-pointer transition-all">
              <h3 className="font-bold mb-2">My Listings</h3>
              <p className="text-sm text-gray-500">Manage the apartments you have posted.</p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary cursor-pointer transition-all">
              <h3 className="font-bold mb-2">Saved Listings</h3>
              <p className="text-sm text-gray-500">View your favorite apartments.</p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary cursor-pointer transition-all">
              <h3 className="font-bold mb-2">Verification</h3>
              <p className="text-sm text-gray-500">Check your landlord verification status.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
