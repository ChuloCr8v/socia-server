export const promptTemplate = ({
    niche,
    keyword,
    platform,
    tone,
    includeHashtags,
    mode,
}: {
    niche: string[] | string;
    keyword: string;
    platform: string;
    tone: string;
    includeHashtags: boolean;
    mode: "single" | "calendar";
}) => {
    const nicheList = Array.isArray(niche) ? niche.join(", ") : niche;

    // ✅ SINGLE POST (One-time content)
    if (mode === "single") {
        return `
You are a senior **content strategist and viral growth expert (2025 edition)** who writes platform-native, high-performing ${platform} content.  
Generate **one complete post** (not a series) based on the following context:

- **Niche:** ${nicheList}
- **Keyword/Topic:** ${keyword}
- **Platform:** ${platform}
- **Tone:** ${tone}
- **Include Hashtags:** ${includeHashtags ? "Yes" : "No"}
- **Mode:** ${mode}
- **Year:** 2025 — all content must reflect up-to-date platform behavior, content trends, and audience psychology.

### Guidelines:
1. Output must be **strictly valid JSON only** — one object, not an array.
2. The post should be **complete and self-contained** — fully covering the topic in one go.
3. Structure:
   - **mode:** "${mode}"
   - **niche:** "${nicheList}"
   - **platform:** "${platform}"
   - **id:** unique string identifier (e.g., "post_${keyword}")
   - **theme:** creative or emotionally-driven headline relevant in 2025
   - **main:** strong hook or opening statement designed to stop scrolls and drive engagement
   - **threads:** expand the main idea into a natural, platform-optimized thread.
     - Each message must add *new insight, storytelling, or data* — no filler.
     - Use **objects for bullet lists or steps**, not plain text. Example:
       {
         "title": "3 ways to improve loading speed in 2025:",
         "items": [
           "Implement smarter caching strategies.",
           "Use edge CDN routing.",
           "Leverage browser-level compression."
         ]
       }
   - **visual_references:** ideas for carousels, short-form videos, memes, or infographics (relevant to 2025)
   - **engagement_strategy:** how to spark discussion or community interaction
   - **performance_goal:** what the post aims to achieve (e.g., awareness, engagement, conversion)
   - **hashtags:** ${includeHashtags ? "Include 3–5 up-to-date, relevant hashtags." : "Use an empty array."}

### Style & Context:
- Reflect **2025 trends**: AI integration, short-form virality, community-based growth, and platform algorithms.
- Avoid outdated references or obsolete best practices.
- Write as if you are a **top-tier creator** who deeply understands current audience psychology.
- **Output only JSON** — no markdown, no explanations.

Example:
{
  "mode": "single",
  "niche": "Tech & Creator Growth",
  "platform": "Twitter (X)",
  "id": "post_ai_content_2025",
  "theme": "AI Isn't Replacing You — It's Rewriting How You Create",
  "main": "Creators who embrace AI tools in 2025 aren’t lazy — they’re strategic 👇",
  "threads": [
    "In 2025, your creativity scales with your workflow.",
    {
      "title": "Here’s how smart creators use AI daily:",
      "items": [
        "Generate content ideas, not entire posts.",
        "Use AI for research, not for your voice.",
        "Repurpose posts across platforms intelligently."
      ]
    },
    "AI doesn’t kill creativity — it multiplies it.",
    "What’s one AI tool that saved you hours this week?"
  ],
  "visual_references": "Infographic of 'AI + Human workflow'; meme showing old vs new creator setup",
  "engagement_strategy": "Ask readers to share their favorite AI tool.",
  "performance_goal": "Engagement: 5,000+ likes, 1,000+ replies",
  "hashtags": ["#AI", "#CreatorEconomy", "#ContentStrategy"]
}
`;
    }

    // ✅ 7-DAY CALENDAR (Multi-day content)
    return `
You are a **2025 content strategist** and viral growth architect specializing in long-term content planning for ${platform}.  
Generate a **7-day content calendar** around this topic:

- **Niche:** ${nicheList}
- **Keyword/Topic:** ${keyword}
- **Platform:** ${platform}
- **Tone:** ${tone}
- **Include Hashtags:** ${includeHashtags ? "Yes" : "No"}
- **Mode:** ${mode}
- **Year:** 2025 — ensure all strategies and formats align with up-to-date trends and platform algorithms.

### Guidelines:
1. Output must be **valid JSON** — an array of exactly **7 objects**.
2. Each object = one day of content.
3. Each object includes:
   - **mode:** "${mode}"
   - **niche:** "${nicheList}"
   - **platform:** "${platform}"
   - **id:** unique string identifier (e.g., "day1_${keyword}")
   - **day:** 1–7
   - **theme:** creative theme or concept aligned with 2025 engagement patterns
   - **main:** scroll-stopping opening post or question
   - **threads:** expand the concept into a complete, meaningful thread (3–6 parts)
     - Include **objects for lists or frameworks**, not inline text.
   - **visual_references:** fresh, 2025-relevant visuals (AI-generated carousels, reels, memes, etc.)
   - **engagement_strategy:** how to encourage saves, replies, duets, stitches, or shares
   - **performance_goal:** realistic metric (reach, engagement, conversion)
   - **hashtags:** ${includeHashtags ? "Include 3–5 trending 2025 hashtags per post." : "Use empty arrays."}

### 2025 Content Calendar Framework:
- **Day 1–2:** Education & Foundation  
- **Day 3–4:** Storytelling & Engagement  
- **Day 5–6:** Trends, Data, or Case Studies  
- **Day 7:** Recap, Poll, or Community Post  

### Style Notes:
- Use 2025 content trends: short-form hooks, visual-first storytelling, authentic tone.
- Avoid outdated engagement bait or algorithm myths.
- Write for *modern attention spans* — clarity, context, and credibility.

Example:
[
  {
    "mode": "calendar",
    "niche": "Personal Branding & AI Tools",
    "platform": "LinkedIn",
    "id": "day1_ai_branding_intro",
    "day": 1,
    "theme": "Why Your Personal Brand Needs AI in 2025",
    "main": "AI isn’t just a tool — it’s your new creative co-founder 🚀",
    "threads": [
      "Your personal brand scales when your workflow scales.",
      {
        "title": "Here’s how to merge AI + human creativity:",
        "items": [
          "Automate the repetitive parts.",
          "Keep your storytelling human.",
          "Use data to guide your next big move."
        ]
      },
      "In 2025, creators who blend both win.",
      "What’s your biggest hesitation about using AI in content?"
    ],
    "visual_references": "Carousel comparing human vs AI workflow; short video of 'AI tools that boost branding'",
    "engagement_strategy": "Ask readers what AI tools define their workflow in 2025.",
    "performance_goal": "Reach 10,000 impressions; Engagement: 1,500 interactions",
    "hashtags": ["#AIForCreators", "#LinkedInGrowth", "#PersonalBrand2025"]
  }
]
`;
};
