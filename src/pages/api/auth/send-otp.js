import { getChatResponseHeaders } from "../../../network";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  // Set chat response headers
  const headers = getChatResponseHeaders();
  for (const key in headers) {
    res.setHeader(key, headers[key]);
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not supported" }); // Changed from res.send to res.status(405).json
    return;
  }

  // Destructure email and phone from the request body
  const { email, phone } = req.body || {};

  // Require either email or phone for OTP
  if (!email && !phone) {
    res.status(400).json({ message: "Email or phone number is required" });
    return;
  }

  // Use createMiddlewareClient for handling Supabase auth
  const supabase = createMiddlewareClient({ req, res });

  // Prepare the payload for OTP
  const supabaseBody = {};
  if (email) {
    supabaseBody.email = email;
  }
  if (phone) {
    supabaseBody.phone = phone;
  }

  // Send the OTP using Supabase
  const { error } = await supabase.auth.signInWithOtp(supabaseBody);

  // Handle errors
  if (error) {
    console.error("Failed to send verification code", error);
    res.status(500).json({
      message: "Failed to send verification code. " + error.message,
    });
    return;
  }

  // Respond with success if no errors
  res.status(200).json({ message: "Verification code sent" });
}