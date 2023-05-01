import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export default async (req, res) => {
  const { url } = req.query;

  try {
    const response = await fetch(url);

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
    res.status(500).json({ error: error.message });
  }
};