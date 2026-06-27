import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
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
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
                value={profile?.full_name || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
              <input
                type="tel"
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
                value={profile?.phone_number || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Account Role</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none capitalize"
                value={profile?.role || ""}
              />
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-gray-500 italic">Profile editing is disabled during the initial launch phase.</p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
