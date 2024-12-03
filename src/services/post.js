import supabaseClient from '@supabase/supabaseClient';

export async function fetchUserPosts(profileId) {
  const { data, error } = await supabaseClient
    .from("post")
    .select(`*,author(id,name,avatar)`)
    .eq("author", profileId);
  if (error) throw error;
  if (data) return data;
}