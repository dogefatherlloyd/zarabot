import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, query, where, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export async function fetchProfileDetails(profileId) {
  // Fetch profile details
  const profileRef = doc(db, "profile", profileId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    throw new Error("Profile not found");
  }
  const profileDetail = profileSnap.data();

  // Fetch posts count for the user
  const postsQuery = query(collection(db, "post"), where("author", "==", profileId));
  const postsSnapshot = await getDocs(postsQuery);
  const postsCount = postsSnapshot.size;

  // Fetch friends count for the user
  const friendsQuery = query(collection(db, "friend"), where("isFriend", "==", true));
  const friendsSnapshot = await getDocs(friendsQuery);
  const friendsCount = friendsSnapshot.docs.filter(
    (doc) => doc.data().from === profileId || doc.data().to === profileId
  ).length;

  return { ...profileDetail, postsCount, friendsCount };
}

export async function changeProfilePic(profileId, avatar) {
  // Fetch current profile data
  const profileRef = doc(db, "profile", profileId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    throw new Error("Profile not found");
  }
  const profileData = profileSnap.data();

  // Remove older avatar from Firebase Storage if exists
  if (profileData?.avatar?.path) {
    const avatarRef = ref(storage, profileData.avatar.path);
    await deleteObject(avatarRef);
  }

  // Update profile data with new avatar
  await updateDoc(profileRef, { avatar });

  return { ...profileData, avatar };
}
