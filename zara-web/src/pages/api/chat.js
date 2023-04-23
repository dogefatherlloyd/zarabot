import { OpenAIStream } from "@/utils/openai";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { buffer } from "micro";
import Cors from "micro-cors";

const cors = Cors({
  allowMethods: ["POST", "OPTIONS"],
});

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(404).send("");
    return;
  }

  const supabase = createMiddlewareSupabaseClient({ req, res });
  const body = await buffer(req);

  const jsonBody = JSON.parse(body.toString());
  jsonBody.model = "davinci-2.0";

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return new Response("Unauthorized", { status: 401 });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const stream = await OpenAIStream(jsonBody);

  const writer = res.writable;

  const encoder = new TextEncoder();

  const streamReader = stream.getReader();

  async function write(message) {
    const encoded = encoder.encode(message);
    await writer.write(encoded);
  }

  async function handleResponse() {
    try {
      while (true) {
        const { done, value } = await streamReader.read();
        if (done) {
          await write("data: [DONE]\n\n");
          return;
        }
        const chunk = value.buffer;
        const text = new TextDecoder("utf-8").decode(chunk);
        await write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  await handleResponse();

  return res.end();
}

export default cors(handler);