import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore"; // Removed unused `doc` import

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function fetchFriendSuggestion() {
  const profilesRef = collection(db, "profile");
  const profilesSnapshot = await getDocs(profilesRef);
  return profilesSnapshot.docs.map((doc) => doc.data());
}

export async function fetchFriendRequestSent(profileId) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("from", "==", profileId));
  const friendSnapshot = await getDocs(friendQuery);
  return friendSnapshot.docs.map((doc) => doc.data().to);
}

export async function sendFriendRequest(from, to) {
  if (from === to) throw new Error("You cannot send a friend request to yourself");

  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("from", "==", from), where("to", "==", to));
  const friendSnapshot = await getDocs(friendQuery);

  if (!friendSnapshot.empty) throw new Error("Friend request already sent");

  await addDoc(friendRef, { from, to });
}

export async function cancelFriendRequest(from, to) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("from", "==", from), where("to", "==", to));
  const friendSnapshot = await getDocs(friendQuery);

  if (!friendSnapshot.empty) {
    const friendDoc = friendSnapshot.docs[0];
    await deleteDoc(friendDoc.ref);
  }
}

export async function fetchFriendRequestReceived(profileId) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("isFriend", "==", false), where("to", "==", profileId));
  const friendSnapshot = await getDocs(friendQuery);
  return friendSnapshot.docs.map((doc) => doc.data().from);
}

export async function ignoreFriendRequest(from, to) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("from", "==", from), where("to", "==", to));
  const friendSnapshot = await getDocs(friendQuery);

  if (!friendSnapshot.empty) {
    const friendDoc = friendSnapshot.docs[0];
    await deleteDoc(friendDoc.ref);
  }
}

export async function acceptFriendRequest(from, to) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("from", "==", from), where("to", "==", to));
  const friendSnapshot = await getDocs(friendQuery);

  if (!friendSnapshot.empty) {
    const friendDoc = friendSnapshot.docs[0];
    await updateDoc(friendDoc.ref, { isFriend: true });
  }
}

export async function fetchMyFriend(profileId) {
  const friendRef = collection(db, "friend");
  const friendQuery = query(friendRef, where("isFriend", "==", true));
  const friendSnapshot = await getDocs(friendQuery);

  return friendSnapshot.docs
    .filter((doc) => doc.data().from === profileId || doc.data().to === profileId)
    .map((doc) => {
      const data = doc.data();
      return data.from === profileId ? data.to : data.from;
    });
}

export async function unfriend(from, to) {
  const friendRef = collection(db, "friend");

  // Attempt to delete the friend request in both directions
  const friendQuery1 = query(friendRef, where("from", "==", from), where("to", "==", to), where("isFriend", "==", true));
  const friendSnapshot1 = await getDocs(friendQuery1);

  if (!friendSnapshot1.empty) {
    const friendDoc1 = friendSnapshot1.docs[0];
    await deleteDoc(friendDoc1.ref);
  } else {
    const friendQuery2 = query(friendRef, where("from", "==", to), where("to", "==", from), where("isFriend", "==", true));
    const friendSnapshot2 = await getDocs(friendQuery2);

    if (!friendSnapshot2.empty) {
      const friendDoc2 = friendSnapshot2.docs[0];
      await deleteDoc(friendDoc2.ref);
    }
  }
}
