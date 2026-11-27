// src/server/digestApi.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// src/utils/mapCurrentsNews.ts
var SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;

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
async function handleDeepDive(body, geminiApiKey) {
  if (!geminiApiKey) {
    return { status: 500, body: { message: "GEMINI_API_KEY is not configured on the server" } };
  }
  const payload = body;
  if (!payload?.article || !payload.questionType) {
    return { status: 400, body: { message: "article and questionType are required" } };
  }
  try {
    const answer = await generateDeepDive(payload.article, payload.questionType, geminiApiKey);
    return { status: 200, body: { answer } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate deep dive";
    return { status: 500, body: { message } };
  }
}
function jsonResponse(result) {
  return Response.json(result.body, { status: result.status });
}
async function generateDeepDive(article, questionType, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: "You are an insightful, clear, and balanced news editor. Provide concise, high-signal explanations directly answering the user prompt. Keep the output under 3 sentences. Plain text only, no markdown headers or bullet lists."
  });
  const prompts = {
    eli5: "Explain this news story simply as if explaining to a 5-year-old using clear everyday analogies.",
    counter: "Provide the primary counter-arguments, risks, caveats, or alternative perspectives on this development.",
    impact: "Explain why this development matters for the broader economy, tech industry, or consumers."
  };
  const instruction = prompts[questionType] || prompts.impact;
  const userPrompt = `${instruction}

Article: ${article.title}
Source: ${article.sourceName}
Summary: ${article.description || ""}`;
  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  return response.text().trim();
}

// src/server/functionHttp.ts
async function readJson(request) {
  if (typeof request.json === "function") {
    return request.json();
  }
  const decoder = new TextDecoder();
  let text = "";
  const stream = request;
  for await (const chunk of stream) {
    text += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
  }
  return JSON.parse(text);
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

// server/routes/deep-dive.ts
async function handler(request, response) {
  if (request.method !== "POST") {
    return sendResult({ status: 405, body: { message: "Method not allowed" } }, response);
  }
  let body;
  try {
    body = await readJson(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate deep dive";
    return sendResult({ status: 500, body: { message } }, response);
  }
  const { geminiApiKey } = readServerApiKeys([process.env]);
  return sendResult(await handleDeepDive(body, geminiApiKey), response);
}
export {
  handler as default
};
