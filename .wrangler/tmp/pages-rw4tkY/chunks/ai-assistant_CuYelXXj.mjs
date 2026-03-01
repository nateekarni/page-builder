globalThis.process ??= {}; globalThis.process.env ??= {};
const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";
async function generateText({
  ai,
  prompt,
  systemPrompt = "You are a professional content writer. Write clear, engaging, and SEO-friendly content.",
  maxTokens = 500
}) {
  const response = await ai.run(DEFAULT_MODEL, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    max_tokens: maxTokens
  });
  return response.response ?? "";
}
async function suggestSEO(ai, content) {
  const prompt = `Analyze the following page content and suggest:
1. An SEO-optimized page title (max 60 characters)
2. A meta description (max 160 characters)
3. Suggested H1-H3 heading structure (as an array of strings)

Page content:
${content.slice(0, 2e3)}

Respond in JSON format only:
{"title": "...", "description": "...", "headings": ["H1: ...", "H2: ...", "H3: ..."]}`;
  const response = await ai.run(DEFAULT_MODEL, {
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Respond only with valid JSON."
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 300
  });
  try {
    const text = response.response ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
  }
  return { title: "", description: "", headings: [] };
}
async function describeImage(ai, imageUrl) {
  try {
    const response = await ai.run(VISION_MODEL, {
      messages: [
        {
          role: "user",
          content: "Describe this image concisely for use as alt text on a website. Keep it under 125 characters. Image URL: " + imageUrl
        }
      ],
      max_tokens: 100
    });
    return response.response ?? "";
  } catch {
    return "";
  }
}
const rateLimitMap = /* @__PURE__ */ new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 6e4 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  entry.count++;
  return true;
}

export { checkRateLimit as c, describeImage as d, generateText as g, suggestSEO as s };
