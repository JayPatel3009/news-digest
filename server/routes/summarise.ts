import { handleSummarise, readServerApiKeys } from '../../src/server/digestApi';
import { readJson, sendResult, type NodeResponse } from '../../src/server/functionHttp';

/**
 * Vercel Function for `POST /api/summarise`.
 *
 * @param request - JSON body with `articles` and `topicLabels`.
 * @param response - Node response, when the runtime provides one.
 * @returns The Gemini digest, or a JSON error.
 */
export default async function handler(request: Request, response?: NodeResponse): Promise<Response | undefined> {
  if (request.method !== 'POST') {
    return sendResult({ status: 405, body: { message: 'Method not allowed' } }, response);
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to summarise with Gemini';
    return sendResult({ status: 500, body: { message } }, response);
  }

  const { geminiApiKey } = readServerApiKeys([process.env]);
  return sendResult(await handleSummarise(body, geminiApiKey), response);
}
