// src/server/digestApi.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// src/utils/sanitizeUrl.ts
function sanitizeUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

// src/utils/mapCurrentsNews.ts
var SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
function toRfc3339Seconds(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}
function toIsoPublishedAt(published) {
  if (!published || typeof published !== "string") {
    return null;
  }
  const trimmed = published.trim();
  if (!trimmed) {
    return null;
  }
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:\s*(Z|([+-])(\d{2}):?(\d{2})))?$/.exec(trimmed);
  if (match) {
    const date = match[1];
    const time = match[2];
    const zone = match[3];
    const sign = match[4];
    const hours = match[5];
    const minutes = match[6];
    if (!zone || zone === "Z" || sign === "+" && hours === "00" && minutes === "00") {
      return `${date}T${time}Z`;
    }
    if (sign && hours && minutes) {
      return `${date}T${time}${sign}${hours}:${minutes}`;
    }
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}
function currentsSearchWindow(now) {
  const end = new Date(now.getTime());
  const start = new Date(end.getTime() - SEVEN_DAYS_MS);
  return {
    startDate: toRfc3339Seconds(start),
    endDate: toRfc3339Seconds(end)
  };
}
function sourceNameFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    return host || "Unknown";
  } catch {
    return "Unknown";
  }
}
function mapCurrentsArticle(item) {
  const url = sanitizeUrl(item.url);
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const publishedAt = toIsoPublishedAt(item.published);
  if (!url || !title || !publishedAt) {
    return null;
  }
  const description = typeof item.description === "string" ? item.description.trim() : "";
  return {
    url,
    title,
    description: description || null,
    source: { name: sourceNameFromUrl(url) },
    publishedAt
  };
}
function mapCurrentsNews(news) {
  if (!news) {
    return [];
  }
  const mapped = [];
  for (const item of news) {
    const article = mapCurrentsArticle(item);
    if (article) {
      mapped.push(article);
    }
  }
  return mapped;
}

// src/server/digestApi.ts
var digestResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    executiveSummary: {
      type: SchemaType.STRING,
      description: "A 2-3 sentence executive briefing of the most important developments across the provided articles."
    },
    items: {
      type: SchemaType.ARRAY,
      description: "Ranked list of articles scored by importance.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          articleId: {
            type: SchemaType.STRING,
            description: "The exact ID of the article being evaluated."
          },
          relevanceScore: {
            type: SchemaType.NUMBER,
            description: "Importance score from 0 to 100 where 100 is most critical."
          },
          aiReason: {
            type: SchemaType.STRING,
            description: "One concise sentence explaining why this story matters to a general reader."
          }
        },
        required: ["articleId", "relevanceScore", "aiReason"]
      }
    }
  },
  required: ["executiveSummary", "items"]
};
function readServerApiKeys(sources) {
  const pick = (names) => {
    for (const source of sources) {
      for (const name of names) {
        const value = source[name];
        if (value) {
          return value;
        }
      }
    }
    return "";
  };
  return {
    currentsApiKey: pick(["CURRENTS_API_KEY", "VITE_CURRENTS_API_KEY", "NEWS_API_KEY", "VITE_NEWS_API_KEY"]),
    geminiApiKey: pick(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"])
  };
}
async function handleNews(query, currentsApiKey) {
  if (!query) {
    return { status: 400, body: { message: "Missing query parameter" } };
  }
  if (!currentsApiKey) {
    return {
      status: 500,
      body: { message: "A Currents API key is not configured. Set CURRENTS_API_KEY or VITE_CURRENTS_API_KEY." }
    };
  }
  const { startDate, endDate } = currentsSearchWindow(/* @__PURE__ */ new Date());
  const params = new URLSearchParams({
    keywords: query,
    language: "en",
    page_number: "1",
    page_size: "10",
    start_date: startDate,
    end_date: endDate
  });
  try {
    const apiRes = await fetch(`https://api.currentsapi.services/v1/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${currentsApiKey}`,
        "User-Agent": "DailyDigestApp/1.0"
      }
    });
    const rawText = await apiRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        status: apiRes.ok ? 502 : apiRes.status,
        body: { message: rawText.slice(0, 300) || "Currents returned a non-JSON response" }
      };
    }
    if (apiRes.status === 429) {
      return { status: 429, body: { message: data.message || "Currents rate limit exceeded" } };
    }
    if (!apiRes.ok || data.status === "error") {
      return {
        status: apiRes.ok ? 502 : apiRes.status,
        body: { message: data.message || "Currents request failed" }
      };
    }
    return { status: 200, body: { articles: mapCurrentsNews(data.news) } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach Currents";
    return { status: 502, body: { message } };
  }
}
function jsonResponse(result) {
  return Response.json(result.body, { status: result.status });
}

// src/server/functionHttp.ts
function requestUrl(request) {
  const raw = request.url || "/";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return new URL(raw);
  }
  return new URL(raw, "https://localhost");
}
function sendResult(result, response) {
  if (response && typeof response.end === "function") {
    response.statusCode = result.status;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(result.body));
    return void 0;
  }
  return jsonResponse(result);
}

// server/routes/news.ts
async function handler(request, response) {
  if (request.method !== "GET") {
    return sendResult({ status: 405, body: { message: "Method not allowed" } }, response);
  }
  const query = requestUrl(request).searchParams.get("query");
  const { currentsApiKey } = readServerApiKeys([process.env]);
  return sendResult(await handleNews(query, currentsApiKey), response);
}
export {
  handler as default
};
