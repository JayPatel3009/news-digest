import { handleNews, readServerApiKeys } from '../../src/server/digestApi';
import { requestUrl, sendResult, type NodeResponse } from '../../src/server/functionHttp';

/**
 * Vercel Function for `GET /api/news`.
 *
 * @param request - Incoming request. The `query` search parameter is required.
 * @param response - Node response, when the runtime provides one.
 * @returns Currents articles, or a JSON error.
 */
export default async function handler(request: Request, response?: NodeResponse): Promise<Response | undefined> {
  if (request.method !== 'GET') {
    return sendResult({ status: 405, body: { message: 'Method not allowed' } }, response);
  }

  const query = requestUrl(request).searchParams.get('query');
  const { currentsApiKey } = readServerApiKeys([process.env]);
  return sendResult(await handleNews(query, currentsApiKey), response);
}
