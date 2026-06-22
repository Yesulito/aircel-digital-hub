import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { redirect } from "next/navigation";

export default async function AdminVerificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: requests } = await supabase
    .from("verification_requests")
    .select("*, users(full_name, phone_number)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-1280 mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Verification Queue</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Name</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Phone</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Date</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests?.map((req: any) => (
                <tr key={req.id}>
                  <td className="px-6 py-4">{req.users.full_name}</td>
                  <td className="px-6 py-4">{req.users.phone_number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      req.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      req.status === "verified" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary font-bold hover:underline">View Details</button>
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No verification requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
