import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export default async (req, res) => {
  const { url } = req.query;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Set timeout to 10 seconds

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId); // Clear the timeout if the response has returned in time

    if (response.ok) {
      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      const parsed = new Readability(doc).parse();

      if (parsed) {
        const sourceText = parsed.textContent.slice(0, 2000);
        res.status(200).json({ text: sourceText });
      } else {
        console.error(`Failed to parse document: ${url}`);
        res.status(500).json({ error: "Failed to parse document" });
      }
    } else {
      console.error(`Failed to fetch URL: ${url}. Status: ${response.status}`);
      res.status(500).json({ error: `Failed to fetch URL. Status: ${response.status}` });
    }
  } catch (error) {
    console.error(`Error fetching and parsing URL: ${url}`, error);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Timeout - The request took too long to complete.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};