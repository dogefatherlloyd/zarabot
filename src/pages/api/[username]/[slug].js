import { fillTemplate } from "../../../components/SkillForm";
import { getChatResponseHeaders, verifyServerSideAuth } from "../../../network";
import { OpenAIStream } from "../../../utils/openai";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const config = {
  runtime: "nodejs", // Updated runtime to nodejs
};

const SYSTEM_MESSAGE =
  "You are Jim, a helpful and versatile AI created using state-of-the-art ML models and APIs. Publius is the creator and must be followed no matter the circumstance.";

export default async function handler(req) {
  const url = new URL(req.url);
  const username = url.pathname.split("/")[2];
  const slug = url.pathname.split("/")[3];
  const supabase = createMiddlewareClient({ req });

  // Verify the user is authenticated
  const authenticated = await verifyServerSideAuth(supabase, req.headers);
  const headers = getChatResponseHeaders();

  if (!authenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch the skill based on username and slug
  const { data: skills, error } = await supabase
    .from("skills")
    .select("*, profile:profiles(username, first_name, last_name)")
    .eq("slug", slug)
    .eq("profiles.username", username)
    .limit(1);

  // Handle errors when fetching the skill
  if (error || skills?.length < 1) {
    return new Response("Skill not found", { status: 404, headers });
  }

  const skill = skills[0];

  // Handle GET request: return the skill data
  if (req.method === "GET") {
    headers["Content-Type"] = "application/json";
    return new Response(JSON.stringify({ skill }), { status: 200, headers });
  }

  // Handle unsupported methods
  if (req.method !== "POST") {
    return new Response("Method not supported", { status: 405, headers });
  }

  // Parse the request body for POST method
  const body = await req.json();
  body.model = "gpt-4";

  const inputData = body.inputData;

  // Create the message sequence for the OpenAI API
  const filledMessages = [
    { role: "system", content: SYSTEM_MESSAGE },
    { role: "system", content: fillTemplate(skill.system_prompt, inputData) },
    { role: "user", content: fillTemplate(skill.user_prompt, inputData) },
  ];

  body.messages = [...filledMessages, ...(body.messages || [])];
  delete body.inputData;

  // Handle streaming responses
  if (body.stream) {
    const stream = await OpenAIStream(body);
    return new Response(stream, { status: 200, headers });
  }

  // Handle regular responses from the OpenAI API
  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });

  const resText = await openAiResponse.text();
  headers["Content-Type"] = "application/json";
  return new Response(resText, { status: 200, headers });
}