// src/services/post.js

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@src/lib/firebase';

export async function fetchUserPosts(profileId) {
  try {
    // Reference to the 'posts' collection
    const postsRef = collection(db, "posts");
    // Create a query to get posts by author ID
    const postsQuery = query(postsRef, where("author", "==", profileId));
    // Fetch the documents matching the query
    const querySnapshot = await getDocs(postsQuery);
    // Map the querySnapshot to an array of post data
    const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}
