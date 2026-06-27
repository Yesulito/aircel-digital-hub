import { createClient } from "@/lib/supabase/server";
import { encryptData } from "@/lib/utils/encryption";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ghanaCardNumber, frontPath, backPath, selfiePath } = body;

    // Encrypt Ghana Card Number
    const encryptedNumber = encryptData(ghanaCardNumber);

    const { error } = await supabase
      .from("verification_requests")
      .insert({
        user_id: user.id,
        ghana_card_number_encrypted: encryptedNumber,
        front_image_url: frontPath,
        back_image_url: backPath,
        selfie_url: selfiePath,
        status: "pending",
      });

    if (error) throw error;

    // Update user status
    await supabase
      .from("users")
      .update({ verification_status: "pending" })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
