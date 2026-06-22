import { createClient } from "@/lib/supabase/server";
import { sendSMSOTP } from "@/lib/arkesel/otp";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { action, phoneNumber, otp } = await request.json();
  const supabase = createClient();

  if (action === "send") {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check rate limit: count attempts in the last hour
    const { data: recentOtps, error: countError } = await supabase
      .from("otps")
      .select("attempts")
      .eq("phone_number", phoneNumber)
      .gt("created_at", oneHourAgo.toISOString());

    if (countError) return NextResponse.json({ message: countError.message }, { status: 500 });

    const totalAttempts = recentOtps?.reduce((sum, item) => sum + (item.attempts || 1), 0) || 0;

    if (totalAttempts >= 3) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again in an hour." },
        { status: 429 }
      );
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    try {
      await sendSMSOTP(phoneNumber, newOtp);

      // Store OTP in database
      const { error: insertError } = await supabase
        .from("otps")
        .insert({
          phone_number: phoneNumber,
          otp: newOtp,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  if (action === "verify") {
    const now = new Date().toISOString();

    // Find the latest valid OTP for this phone number
    const { data: stored, error: fetchError } = await supabase
      .from("otps")
      .select("*")
      .eq("phone_number", phoneNumber)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !stored) {
      return NextResponse.json(
        { message: "OTP expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP code." }, { status: 400 });
    }

    // OTP is valid, delete it to prevent reuse
    await supabase.from("otps").delete().eq("phone_number", phoneNumber);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
