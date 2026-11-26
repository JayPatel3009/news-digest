import { handleDeepDive, readServerApiKeys } from '../../src/server/digestApi';
import { readJson, sendResult, type NodeResponse } from '../../src/server/functionHttp';

/**
 * Vercel Function for `POST /api/deep-dive`.
 *
 * @param request - JSON body with `article` and `questionType`.
 * @param response - Node response, when the runtime provides one.
 * @returns The Gemini answer, or a JSON error.
 */
export default async function handler(request: Request, response?: NodeResponse): Promise<Response | undefined> {
  if (request.method !== 'POST') {
    return sendResult({ status: 405, body: { message: 'Method not allowed' } }, response);
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate deep dive';
    return sendResult({ status: 500, body: { message } }, response);
  }

  const { geminiApiKey } = readServerApiKeys([process.env]);
  return sendResult(await handleDeepDive(body, geminiApiKey), response);
}