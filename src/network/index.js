import { toast } from "react-hot-toast";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const TEMPLATES_BASE_URL =
  "https://raw.githubusercontent.com/dogefatherlloyd/zarabot/main/templates";

export async function getTemplates() {
  const res = await fetch(
    `${TEMPLATES_BASE_URL}/index.json?t=${new Date().getTime()}`,
    {
      cache: "no-store",
    }
  );
  return await res.json();
}

export async function getSystemPrompt(slug) {
  const res = await fetch(
    `${TEMPLATES_BASE_URL}/${slug}/system.md?t=${new Date().getTime()}`,
    {
      cache: "no-store",
    }
  );
  return res.text();
}

export async function getUserPrompt(slug) {
  const res = await fetch(
    `${TEMPLATES_BASE_URL}/${slug}/user.md?t=${new Date().getTime()}`,
    {
      cache: "no-store",
    }
  );
  return res.text();
}

export async function getTemplate(slug) {
  const [templates, systemPrompt, userPrompt] = await Promise.all([
    getTemplates(),
    getSystemPrompt(slug),
    getUserPrompt(slug),
  ]);

  const template = templates.find((t) => t.slug === slug);

  if (!template) {
    return null;
  }

  template.systemPrompt = systemPrompt;
  template.userPrompt = userPrompt;

  return template;
}

export async function fetchUserProfile(user) {
  if (!user) {
    return null;
  }
  try {
    const userRef = doc(db, "profiles", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (error) {
    console.error("Error while fetching user profile", error);
  }
}

export async function updateUserProfile(profileData) {
  try {
    const profileRef = doc(db, "profiles", profileData.id);
    await updateDoc(profileRef, profileData);
    toast.success("Profile updated!");
    return true;
  } catch (e) {
    toast.error("Failed to update profile");
    console.error("Failed to update profile", e);
  }
}

export async function verifyServerSideAuth(headers) {
  const authHeader = headers["authorization"];

  if (authHeader) {
    const possibleKey = authHeader.substring(7);
    try {
      const q = query(collection(db, "apikeys"), where("key", "==", possibleKey));
      const querySnapshot = await getDocs(q);
      const apiKey = querySnapshot.docs[0]?.data();

      if (apiKey) {
        return apiKey.user;
      } else {
        console.error("Failed to validate API key");
      }
    } catch (err2) {
      console.error("Failed to validate API key", err2);
    }
  }

  return false;
}

export function getChatResponseHeaders() {
  return {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Referer, Authorization, API_URL",
  };
}

export async function ensureUserProfile(user) {
  let userProfile = await fetchUserProfile(user);

  if (!userProfile) {
    let username;
    if (user.email) {
      const email = user.email;
      username = email.split("@")[0];
    } else if (user.phoneNumber) {
      username = user.phoneNumber;
    } else {
      username = user.uid;
    }

    try {
      const profileRef = await addDoc(collection(db, "profiles"), {
        id: user.uid,
        username: username,
        first_name: username,
      });
      return profileRef;
    } catch (e) {
      console.error("Error while creating profile", e);
      return false;
    }
  } else {
    return true;
  }
}

export async function sendVerificationCode(email) {
  const actionCodeSettings = {
    url: window.location.href,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    toast.success("Verification code sent. Check your email!");
  } catch (error) {
    toast.error("Failed to send verification code");
    console.error("Failed to send verification code", error);
  }
}

export async function submitVerificationCode(email) {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      if (result.user) {
        toast.success("Signed in successfully");
        return ensureUserProfile(result.user);
      }
    }
  } catch (error) {
    console.error("Failed to sign in", error);
    toast.error("Failed to sign in / sign up");
  }
}
