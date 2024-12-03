import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not supported");
    return;
  }

  const { email, phone, code } = req.body || {};

  if (!(email || phone) || !code) {
    res.status(400).send("The fields `email`/`phone` and `code` are required");
    return;
  }

  const supabase = createMiddlewareClient({ req, res });

  const supabaseBody = {
    token: code,
    type: phone ? "sms" : "email",
  };

  if (email) {
    supabaseBody.email = email;
  }

  if (phone) {
    supabaseBody.phone = phone;
  }

  const { data, error } = await supabase.auth.verifyOtp(supabaseBody);

  if (error) {
    console.error("Failed to verify code for login", error);
    res.status(400).json({ message: "Failed to verify code. " + error.message });
    return;
  }

  res.status(200).json({ user: data.user });
}