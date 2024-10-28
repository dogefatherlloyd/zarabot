import { EditSkillForm } from "../../../components/EditSkillForm";
import Navbar from "../../../components/Navbar";
import { isJson } from "../../../utils";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function EditSkillPage({ skill }) {
  const [skillData, setSkillData] = useState(skill);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const updatedSkill = {
        title: skillData.title,
        slug: skillData.slug,
        description: skillData.description,
        system_prompt: skillData.system_prompt,
        user_prompt: skillData.user_prompt,
        inputs: isJson(skillData.inputs)
          ? skillData.inputs
          : JSON.parse(skillData.inputs),
        user_id: user.uid,
      };

      const skillRef = doc(db, "skills", skillData.id);
      await updateDoc(skillRef, updatedSkill);

      toast.success("Skill updated successfully");
      router.push(`/${skill.profiles.username}/${updatedSkill.slug}`);
    } catch (error) {
      toast.error("Failed to update skill: " + error.message);
      console.error("Error updating skill:", error);
    }
  }

  if (!skill) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`Edit Skill - ${skill.title}`}</title>
      </Head>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="px-2 flex-1 overflow-y-auto">
          <div className="mx-auto my-4 w-full max-w-4xl">
            <h1 className="text-center mx-auto text-4xl font-medium">
              Build a Skill
            </h1>
            <EditSkillForm
              skillData={skillData}
              setSkillData={setSkillData}
              onSubmit={handleSubmit}
              editMode
            />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  const username = context.params.username;

  const skillsQuery = query(
    collection(db, "skills"),
    where("slug", "==", slug),
    where("profiles.username", "==", username)
  );

  const skillsSnapshot = await getDocs(skillsQuery);
  if (skillsSnapshot.empty) {
    console.error("Failed to fetch skill for slug: " + slug);
    return {
      notFound: true,
    };
  }

  const skill = skillsSnapshot.docs[0].data();
  skill.id = skillsSnapshot.docs[0].id; // Save the document ID for updating later

  // Authenticate the user on the server side
  const authUser = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    });
  });

  if (!authUser || authUser.uid !== skill.user_id) {
    console.error("User is not the author", "user.id", authUser?.uid, "skill.user_id", skill?.user_id);
    return {
      notFound: true,
    };
  }

  return {
    props: { skill },
  };
}
