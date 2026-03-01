/**
 * AI Assistant — Workers AI API Wrapper
 *
 * Pure async functions for text generation, SEO suggestions, and image alt text.
 * Uses Cloudflare Workers AI binding.
 *
 * Clean Code: stateless, mockable, no framework dependency.
 */

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";

interface GenerateTextOptions {
  ai: Ai;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

interface SEOSuggestion {
  title: string;
  description: string;
  headings: string[];
}

/**
 * Generate text content from a prompt using Workers AI.
 */
export async function generateText({
  ai,
  prompt,
  systemPrompt = "You are a professional content writer. Write clear, engaging, and SEO-friendly content.",
  maxTokens = 500,
}: GenerateTextOptions): Promise<string> {
  const response = (await (ai as any).run(DEFAULT_MODEL, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
  })) as { response?: string };

  return response.response ?? "";
}

/**
 * Suggest SEO metadata based on page content.
 */
export async function suggestSEO(
  ai: Ai,
  content: string,
): Promise<SEOSuggestion> {
  const prompt = `Analyze the following page content and suggest:
1. An SEO-optimized page title (max 60 characters)
2. A meta description (max 160 characters)
3. Suggested H1-H3 heading structure (as an array of strings)

Page content:
${content.slice(0, 2000)}

Respond in JSON format only:
{"title": "...", "description": "...", "headings": ["H1: ...", "H2: ...", "H3: ..."]}`;

  const response = (await (ai as any).run(DEFAULT_MODEL, {
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Respond only with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 300,
  })) as { response?: string };

  try {
    const text = response.response ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as SEOSuggestion;
    }
  } catch {
    // Parse error — return defaults
  }

  return { title: "", description: "", headings: [] };
}

/**
 * Generate alt text for an image using vision model.
 */
export async function describeImage(ai: Ai, imageUrl: string): Promise<string> {
  try {
    const response = (await (ai as any).run(VISION_MODEL, {
      messages: [
        {
          role: "user",
          content:
            "Describe this image concisely for use as alt text on a website. Keep it under 125 characters. Image URL: " +
            imageUrl,
        },
      ],
      max_tokens: 100,
    })) as { response?: string };

    return response.response ?? "";
  } catch {
    return "";
  }
}

/**
 * Simple in-memory rate limiter.
 * Returns true if request is allowed, false if rate limited.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count++;
  return true;
}
