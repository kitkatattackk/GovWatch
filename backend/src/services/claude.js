const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const VALID_CATEGORIES = [
  'bills_votes',
  'executive_orders',
  'court_rulings',
  'government_spending',
  'opinion',
];

/**
 * Strips HTML tags and collapses whitespace from a string.
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calls Claude Haiku to generate a 2-3 sentence brief and assign
 * a category for an article. Returns { brief, category }.
 */
async function generateBriefAndCategory(title, rawContent) {
  const content = rawContent ? stripHtml(rawContent).slice(0, 3000) : '';

  let response;
  try {
    response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are an analyst for a serious political news app called GovWatch.

Given the article below, respond with ONLY valid JSON — no markdown fences, no explanation:
{
  "brief": "2-3 sentence summary focusing on key facts and direct implications for citizens",
  "category": "bills_votes OR executive_orders OR court_rulings OR government_spending"
}

Title: ${title}
Content: ${content}`,
        },
      ],
    });
  } catch (err) {
    console.warn('[Claude] API call failed, skipping brief:', err.message);
    return { brief: null, category: 'bills_votes' };
  }

  const raw = response.content[0].text.trim();
  // Strip accidental markdown code fences
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.warn('[Claude] JSON parse failed, using fallback. Raw:', raw.slice(0, 200));
    parsed = {
      brief: title,
      category: 'bills_votes',
    };
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    parsed.category = 'bills_votes';
  }

  return { brief: parsed.brief, category: parsed.category };
}

module.exports = { generateBriefAndCategory };
