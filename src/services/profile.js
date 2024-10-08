import supabaseClient from '@supabase/supabaseClient';

export async function fetchProfileDetails(profileId) {
  const { data: profileDetail, error } = await supabaseClient
    .from("profile")
    .select("*")
    .eq("id", profileId);

  const { count: postsCount } = await supabaseClient
    .from("post")
    .select("id", { count: "exact" })
    .eq("author", profileId);

  const { data: friendsData } = await supabaseClient
    .from("friend")
    .select("from(id), to(id)")
    .match({ isFriend: true });

  const friendsCount = friendsData?.filter(
    (profile) => profile.from.id === profileId || profile.to.id === profileId
  ).length;

  if (error) throw error;
  if (profileDetail) {
    const data = { ...profileDetail[0], postsCount, friendsCount };
    return data;
  }
}

export async function changeProfilePic(profileId, avatar) {
  console.log(avatar);
  console.log(profileId);
  // fetch profile information from database
  const { data: profileData, error: profileErrr } = await supabaseClient
    .from("profile")
    .select("avatar")
    .eq("id", profileId);
  if (profileErrr) throw profileErrr;

  console.log(profileData);

  // remove older avatar from supaabase storage
  if (profileData?.length && profileData[0].avatar) {
    const { error: avatarRemoveError } = await supabaseClient.storage
      .from("avatar")
      .remove(profileData[0].avatar.path);

    if (avatarRemoveError) throw avatarRemoveError;
  }

  // update profile data with new avatar
  const { data: updateProfileData, error: updateProfileError } = await supabaseClient
    .from("profile")
    .update({ avatar })
    .eq("id", profileId);

  if (updateProfileError) throw updateProfileError;
  if (updateProfileData) return updateProfileData[0];
}