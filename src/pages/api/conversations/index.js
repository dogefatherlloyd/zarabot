import { verifyServerSideAuth } from "../../../network";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

async function getAllConversations(supabase, user, res) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages (id, created_at, role, content)")
    .eq("user_id", user.id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(200).json({ data });
}

async function createNewConversation(supabase, user, req, res) {
  const { messages, title } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ message: "No messages provided" });
  }

  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: title || messages[0].content.slice(0, 40),
    })
    .select()
    .single();

  if (conversationError) {
    return res.status(500).json({ message: conversationError.message });
  }

  messages.forEach((message) => {
    message.conversation_id = conversationData.id;
  });

  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .insert(messages)
    .select();

  if (messagesError) {
    return res.status(500).json({ message: messagesError.message });
  }

  conversationData.messages = messagesData;

  res.status(200).json({ data: conversationData });
}

export default async function handler(req, res) {
  const supabase = createMiddlewareClient({ req, res });
  const user = await verifyServerSideAuth(supabase, req.headers);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    return getAllConversations(supabase, user, res);
  } else if (req.method === "POST") {
    return createNewConversation(supabase, user, req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}