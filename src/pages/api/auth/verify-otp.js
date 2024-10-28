import { getAuth, signInWithEmailLink, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
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
  if (req.method !== "POST") {
    res.status(405).send("Method not supported");
    return;
  }

  const { email, phone, code } = req.body || {};

  if (!(email || phone) || !code) {
    res.status(400).send("The fields `email`/`phone` and `code` are required");
    return;
  }

  try {
    if (email) {
      if (signInWithEmailLink(auth, email, code)) {
        res.status(200).json({ message: "Email verified successfully" });
      } else {
        res.status(400).json({ message: "Failed to verify email." });
      }
    }

    if (phone) {
      // Assuming the RecaptchaVerifier instance is set on the client-side
      const appVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      const userCredential = await confirmationResult.confirm(code);

      if (userCredential) {
        res.status(200).json({ user: userCredential.user });
      } else {
        res.status(400).json({ message: "Failed to verify phone." });
      }
    }
  } catch (error) {
    console.error("Failed to verify code for login", error);
    res.status(400).json({ message: "Failed to verify code. " + error.message });
  }
}
