import { useEffect, useState, useCallback } from "react";
import ManageAPIKeys from "../components/ManageAPIKeys";
import Navbar from "../components/Navbar";
import SlugInput from "../components/inputs/SlugInput";
import TextArea from "../components/inputs/TextArea";
import TextInput from "../components/inputs/TextInput";
import { fetchUserProfile, updateUserProfile } from "../network";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import Link from "next/link";

export default function AccountPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [profileData, setProfileData] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchTokenBalance = useCallback(async () => {
    if (!user) return;
    console.log(`Fetching token balance for user ID: ${user.id}`);
    const { data, error } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch token balance:", error);
    } else {
      console.log("Fetched token balance:", data.token_balance);
      setTokenBalance(data.token_balance);
    }
  }, [supabase, user]);

  const fetchProfileAndTokenBalance = useCallback(async () => {
    if (!user) return;
    const profile = await fetchUserProfile(supabase, user);
    setProfileData(profile);
    fetchTokenBalance();
  }, [supabase, user, fetchTokenBalance]);

  useEffect(() => {
    if (user) {
      fetchProfileAndTokenBalance();
    }
  }, [user, fetchProfileAndTokenBalance]);

  const makeOnChange = (field) => (e) =>
    setProfileData({ ...profileData, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    updateUserProfile(supabase, profileData);
    setIsEditable(false);
  }

  if (!isClient || !user) {
    return null; // Prevent rendering on the server side
  }

  return (
    <>
      <Head>
        <title>Manage Account - Artemis</title>
      </Head>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="px-2 flex-1 overflow-y-auto">
          <div className="mx-auto my-4 w-full max-w-4xl">
            <h1 className="text-center mx-auto text-4xl font-medium">
              Manage Account
            </h1>
            <div className="text-center mb-4">
              <button
                type="button"
                onClick={() => setIsEditable(!isEditable)}
                className={`rounded-md py-2 px-4 text-sm font-semibold shadow-sm ${
                  isEditable
                    ? "bg-gray-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {isEditable ? "Cancel Edit" : "Edit"}
              </button>
            </div>
            <form>
              <SlugInput
                field="username"
                label="Username:"
                required
                value={profileData.username}
                onChange={makeOnChange("username")}
                disabled={!isEditable}
              />
              <TextInput
                field="first_name"
                label="First Name:"
                required
                value={profileData.first_name}
                onChange={makeOnChange("first_name")}
                disabled={!isEditable}
              />
              <TextInput
                field="last_name"
                label="Last Name:"
                value={profileData.last_name}
                onChange={makeOnChange("last_name")}
                disabled={!isEditable}
              />
              <TextArea
                field="bio"
                label="Bio:"
                value={profileData.bio}
                onChange={makeOnChange("bio")}
                disabled={!isEditable}
              />
              <div className="mt-4 text-center">
                <h2 className="text-lg font-medium text-gray-700">
                  Token Balance:
                </h2>
                <p className="text-2xl font-semibold text-blue-500">
                  {tokenBalance}
                </p>
                <button
                  type="button"
                  onClick={fetchTokenBalance}
                  className="mt-2 rounded-md bg-blue-500 py-1 px-3 text-sm font-semibold text-white shadow-sm"
                >
                  Refresh Balance
                </button>
              </div>
              {isEditable && (
                <div className="mt-4 flex justify-between">
                  <input
                    type="submit"
                    value="Save"
                    onClick={handleSubmit}
                    className="rounded-md w-20 bg-blue-500 py-2 px-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-blue-600 active:bg-blue-700 "
                  />
                  <Link
                    href="/logout"
                    type="submit"
                    className="ml-3 rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:bg-gray-100"
                  >
                    Log Out
                  </Link>
                </div>
              )}
            </form>
            <ManageAPIKeys />
          </div>
        </div>
      </div>
    </>
  );
}