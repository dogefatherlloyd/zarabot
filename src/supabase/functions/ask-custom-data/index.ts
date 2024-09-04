// @ts-nocheck
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts' 
import 'https://deno.land/x/xhr@0.2.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'
import GPT3Tokenizer from 'https://esm.sh/gpt3-tokenizer@1.1.5'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { stripIndent, oneLine } from 'https://esm.sh/common-tags@1.8.2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const supabaseclient = createClient(
  "https://gwsmfmqtmuhmglnfzqma.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c21mbXF0bXVobWdsbmZ6cW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMTgxNDAsImV4cCI6MTk5NzU5NDE0MH0.RidOWSEh2N8Kj4EjKe7balLKFXMErDQl3mCMs8kyY7g"
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: corsHeaders });
  }

  const { query } = await req.json();
  const input = query.replace(/\n/g, ' ');

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002", 
    input: input  // Changed from 'text' to 'input'
  });    

  const [{ embedding }] = embeddingResponse.data.data;

  const { data: documents, error } = await supabaseclient.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.73,
    match_count: 10
  });

  if (error) throw error;
  
  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = '';

  for (let i = 0; i < documents.length; i++) {
    const document = documents[i]; // Fixed 'document[i]' to 'documents[i]'
    const content = document.content;
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    if (tokenCount > 1500) {
      break;
    }

    contextText += `${content.trim()}---\n`;
  }

  const prompt = stripIndent`${oneLine`
    You are a dog named Toni Cannoli. Base your responses off of your memories only. 
    If you are unable to retrieve knowledge or need to be taught new things, let your human know.
  `}
  Content sections:
  ${contextText}
  question: """
  ${query}
  """
  Answer as simple text:
  `;

  const completionResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 512,
    temperature: 0
  });

  const { id, choices } = completionResponse.data;
  const text = choices[0].text; // Fixed to get the text from 'choices'

  return new Response(JSON.stringify({ id, text }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});