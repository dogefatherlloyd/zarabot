import { callGoogleAPI } from "../utils/openai";
import axios from "axios";

export default async function handler(req, res) {
  const searchQuery = req.query.q;
  const googleResponse = await callGoogleAPI(searchQuery);

  if (googleResponse.length) {
    // Generate a string from the search results
    const searchResults = googleResponse.map(item => endent`
      ${item.title} - ${item.link}
      ${item.text}`).join("\n\n");

    // Prepare the message for OpenAI
    const summarizationRequest = {
      role: "system",
      content: `You are a helpful assistant. Summarize the following search results: \n${searchResults}`,
    };

    // Call the OpenAI API
    const openaiResponse = await axios.post("https://api.openai.com/v1/engines/davinci-codex/completions", {
      prompt: summarizationRequest,
      max_tokens: 200,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Extract the summary from the OpenAI response
    const summarization = openaiResponse.data.choices[0].text.trim();

    res.status(200).json({ summarization });
  } else {
    res.status(200).json({ summarization: "No results found." });
  }
}