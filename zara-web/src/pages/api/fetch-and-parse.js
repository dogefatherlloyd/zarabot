import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export default async (req, res) => {
  const { url } = req.query;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const parsed = new Readability(doc).parse();

    if (parsed) {
      const sourceText = parsed.textContent.slice(0, 2000);
      res.status(200).json({ text: sourceText });
    } else {
      res.status(500).json({ error: "Failed to parse document" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};