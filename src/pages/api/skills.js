import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    // Access the 'skills' collection from Firestore
    const skillsRef = collection(db, "skills");
    const skillsSnapshot = await getDocs(skillsRef);
    
    const skills = skillsSnapshot.docs.map(doc => {
      const data = doc.data();

      return {
        ...data,
        profile: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      };
    });

    // Return the skills data as JSON response
    res.status(200).json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: error.message });
  }
}
