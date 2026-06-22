/**
 * Arkesel SMS OTP Utility
 * Documentation: https://arkesel.com/sms-api-documentation
 */

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;

export async function sendSMSOTP(phoneNumber: string, otp: string) {
  if (!ARKESEL_API_KEY) {
    throw new Error("ARKESEL_API_KEY is not configured");
  }

  // Format phone number to international format if needed
  // Ghana format: 0244000000 -> 233244000000
  let formattedPhone = phoneNumber.replace(/\s/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "233" + formattedPhone.substring(1);
  }

  const message = `Your Hiredan verification code is: ${otp}. Do not share this with anyone.`;

  const response = await fetch(
    `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${ARKESEL_API_KEY}&to=${formattedPhone}&from=Hiredan&sms=${encodeURIComponent(
      message
    )}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (data.code !== "1000") {
    console.error("Arkesel Error:", data);
    throw new Error(data.message || "Failed to send SMS OTP");
  }

  return data;
}
