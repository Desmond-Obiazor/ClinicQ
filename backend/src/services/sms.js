const TERMII_BASE_URL = "https://api.ng.termii.com/api/sms/send";

export async function sendSms(toPhone, message) {
  if (!process.env.TERMII_API_KEY) {
    console.warn("[sms] TERMII_API_KEY not set — logging instead of sending:", toPhone, message);
    return { simulated: true };
  }

  const res = await fetch(TERMII_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: toPhone,
      from: process.env.TERMII_SENDER_ID || "ClinicApp",
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: process.env.TERMII_API_KEY,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[sms] Termii send failed:", data);
    throw new Error(data.message || "SMS send failed");
  }
  return data;
}