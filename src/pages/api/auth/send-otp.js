import { getChatResponseHeaders } from "../../../network";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default async function handler(req, res) {
  // Set chat response headers
  const headers = getChatResponseHeaders();
  for (const key in headers) {
    res.setHeader(key, headers[key]);
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not supported" });
    return;
  }

  // Destructure email and phone from the request body
  const { email } = req.body || {};

  // Require email for OTP
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  // Set actionCodeSettings for Firebase OTP
  const actionCodeSettings = {
    url: process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL,
    handleCodeInApp: true,
  };

  // Send the OTP using Firebase
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Failed to send verification code", error);
    res.status(500).json({
      message: "Failed to send verification code. " + error.message,
    });
  }
}
