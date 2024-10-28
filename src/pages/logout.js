import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    signOut(auth).then(() => {
      router.push("/");
    });
  }, [router]);

  return <div></div>;
}
