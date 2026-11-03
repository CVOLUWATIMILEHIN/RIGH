import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { caption, platform, category } = body;
    if (!caption) {
      return res.status(400).json({ error: "Missing caption for translation." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      const mockMarkdown = `# Generated Content: ${category || "Leadership Mindset"}\n\nThis article was generated as an automated template preview. Set your **GEMINI_API_KEY** in environment variables to enable live real-time Gemini parsing.\n\n## Content Analysis\n* **Platform Origin**: ${platform ? platform.toUpperCase() : "Facebook"}\n* **Raw Captions**: *"${caption.slice(0, 100)}..."*\n\n## Core Principles\n1. **Purpose-Driven Execution**: Move from motivation to functional daily systems.\n2. **Clarity of Vision**: Define high-value priorities early and stick to them.\n\n*Join the Right Minds Africa Hub to keep growing!*`;
      return res.status(200).json({ article: mockMarkdown });
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const systemPrompt = `You are the lead editor and content marketer for Right Minds Africa (RMA) Hub and Corper Impact Initiative (CII). 
Your task is to expand raw social media posts (from Facebook or Instagram) into beautiful, high-quality, professional blog articles.
Rules:
1. Always output the article in clear, well-structured Markdown format.
2. Provide an enticing article title as an H1 heading.
3. Structure keys sections with H2 or H3 subheadings.
4. Elaborate thoroughly on the concepts, using professional, inspiring, and clear tone suited for African youth, graduates, and professionals.
5. Keep sections: "Introduction", "The Core Principle", "Actionable Takeaways", and "Accountability Check".
6. Extract 3-5 relevant SEO keywords or tags and present them at the very end as a paragraph formatted like "Keywords: leadership, growth".`;

    const modelInput = `Please translate and write a professional blog article for a post on platform: '${platform || "facebook"}' under category: '${category || "General Growth"}'.
Caption details:
"${caption}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelInput,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    return res.status(200).json({
      article: response.text || "Failed to generate blog text from model response."
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Generative model failed to write article."
    });
  }
}
