import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not supported" });
    return;
  }

  try {
    const { username } = req.query;

    // Fetch profile by username from Firestore
    const profilesRef = collection(db, "profiles");
    const profilesQuery = query(profilesRef, where("username", "==", username));
    const profilesSnapshot = await getDocs(profilesQuery);

    if (profilesSnapshot.empty) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile = profilesSnapshot.docs[0].data();

    // Fetch skills based on the user_id from the profile
    const skillsRef = collection(db, "skills");
    const skillsQuery = query(skillsRef, where("user_id", "==", profile.id));
    const skillsSnapshot = await getDocs(skillsQuery);

    if (skillsSnapshot.empty) {
      res.status(404).json({ profile, error: "Skills not found" });
      return;
    }

    const skills = skillsSnapshot.docs.map((doc) => doc.data());

    // Return the profile and skills data
    res.status(200).json({ skills, profile });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
