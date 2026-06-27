import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VerificationPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  if (profile?.verification_status === "verified") {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">You are verified!</h1>
            <p className="text-gray-600 mb-8">Your identity has been confirmed. You can now post and manage apartment listings on Hiredan.</p>
            <Link href="/dashboard/listings/new" className="btn-primary inline-block">
              Post your first apartment
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Landlord Verification</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <h2 className="text-xl font-bold mb-4">Why do I need to verify?</h2>
          <p className="text-gray-600 mb-6">
            To protect renters and maintain trust on Hiredan, all landlords must verify their identity before posting.
            This helps us keep the platform safe and scam-free for everyone.
          </p>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold">What you will need:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>A clear photo of the front of your Ghana Card</li>
              <li>A clear photo of the back of your Ghana Card</li>
              <li>Your Ghana Card number</li>
              <li>A selfie of yourself</li>
            </ul>
          </div>

          <Link href="/dashboard/verification/submit" className="btn-primary block text-center">
            Start Verification
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
