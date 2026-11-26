import { jsonResponse, type JsonResult } from './digestApi';

/**
 * Node-style response object used by some Vercel Function adapters.
 */
export interface NodeResponse {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
}

/**
 * Resolves a request URL when the runtime passes either an absolute URL or a path.
 *
 * @param request - Request-like object with a `url` field.
 * @returns A URL whose search params can be read.
 */
export function requestUrl(request: { url?: string }): URL {
  const raw = request.url || '/';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return new URL(raw);
  }
  return new URL(raw, 'https://localhost');
}

/**
 * Reads a JSON body from a Web Request or a Node request stream.
 *
 * @param request - Incoming request.
 * @returns The parsed JSON value.
 */
export async function readJson(request: Request): Promise<unknown> {
  if (typeof request.json === 'function') {
    return request.json();
  }

  const decoder = new TextDecoder();
  let text = '';
  const stream = request as unknown as AsyncIterable<Uint8Array | string>;
  for await (const chunk of stream) {
    text += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
  }
  return JSON.parse(text);
}

/**
 * Sends a handler result through the Node response, or as a Web `Response`.
 *
 * @param result - Status and JSON body.
 * @param response - Node response, when the runtime provides one.
 * @returns A `Response` for Web runtimes, otherwise nothing.
 */
export function sendResult(result: JsonResult, response?: NodeResponse): Response | undefined {
  if (response && typeof response.end === 'function') {
    response.statusCode = result.status;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(result.body));
    return undefined;
  }
  return jsonResponse(result);
}
