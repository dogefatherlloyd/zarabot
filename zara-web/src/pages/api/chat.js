import { OpenAIStream } from "@/utils/openai";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

export const config = {
  runtime: "edge",
};

async function handler(req, res) {
  const supabase = createMiddlewareSupabaseClient({ req, res });
  const body = await req.json();

  body.model = "gpt-3.5-turbo";

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const stream = await OpenAIStream(body);

  res.status(200);
  stream.pipe(res);
}

export default handler;