import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  // Use createMiddlewareClient for API routes
  const supabase = createMiddlewareClient({ req, res });

  // Fetch profile by username
  const { data: profile, error: err1 } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", req.query.username)
    .single();

  // Handle error if profile is not found
  if (err1) {
    res.status(404).json({ error: err1 });
    return;
  }

  // Fetch skills based on the user_id from the profile
  const { data: skills, error: err2 } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", profile.id);

  // Handle error if skills are not found
  if (err2) {
    res.status(404).json({ profile, error: err2 });
    return;
  }

  // Return the profile and skills data
  res.status(200).json({ skills, profile });
}