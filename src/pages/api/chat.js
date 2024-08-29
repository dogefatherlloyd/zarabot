import { getChatResponseHeaders, verifyServerSideAuth } from "../../network";
import { OpenAIStream } from "../../utils/openai";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Option 1: Change to nodejs runtime
export const config = {
  runtime: "nodejs", // Or you can remove this line if you don't need a custom runtime
};

async function handler(req) {
  const supabase = createMiddlewareClient({ req });

  // Verify authentication
  const authenticated = await verifyServerSideAuth(supabase, req.headers);

  if (!authenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse the request body
  const body = await req.json();
  body.model = "gpt-4";

  // Set headers
  const headers = getChatResponseHeaders();

  // Format messages
  body.messages = (body.messages || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Stream response handling
  if (body.stream) {
    const stream = await OpenAIStream(body);
    return new Response(stream, { status: 200, headers });
  } else {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(body),
    });

    const resText = await res.text();
    headers["Content-Type"] = "application/json";

    return new Response(resText, { status: 200, headers });
  }
}

export default handler;