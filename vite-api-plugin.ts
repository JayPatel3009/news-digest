import type { Plugin, Connect } from 'vite';
import { loadEnv } from 'vite';
import { handleDeepDive, handleNews, handleSummarise, readServerApiKeys } from './src/server/digestApi';

// Permit local dev TLS bypass for environments with custom/corporate proxy root certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function readJsonBody(
  req: Connect.IncomingMessage,
  onBody: (body: unknown, parseError?: string) => void | Promise<void>,
): void {
  let bodyStr = '';
  req.on('data', (chunk: Buffer | string) => {
    bodyStr += chunk.toString();
  });
  req.on('end', () => {
    try {
      void onBody(JSON.parse(bodyStr) as unknown);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON body';
      void onBody(undefined, message);
    }
  });
}

/**
 * Creates the server-side API middleware plugin to keep API keys secure
 * and handle Currents + Gemini requests on the server side.
 */
export function apiPlugin(): Plugin {
  let currentsApiKey = '';
  let geminiApiKey = '';

  const setupKeys = (mode: string) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const env = loadEnv(mode, process.cwd(), '');
    const keys = readServerApiKeys([env, process.env]);
    currentsApiKey = keys.currentsApiKey;
    geminiApiKey = keys.geminiApiKey;
  };

  const middlewareHandler: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/api/')) {
      return next();
    }

    const url = new URL(req.url, 'http://localhost');
    const send = (result: { status: number; body: unknown }) => {
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
    };

    // GET /api/news?query=...
    if (url.pathname === '/api/news' && req.method === 'GET') {
      void handleNews(url.searchParams.get('query'), currentsApiKey).then(send);
      return;
    }

    // POST /api/summarise
    if (url.pathname === '/api/summarise' && req.method === 'POST') {
      readJsonBody(req, async (body, parseError) => {
        if (parseError) {
          send({ status: 500, body: { message: parseError } });
          return;
        }
        send(await handleSummarise(body, geminiApiKey));
      });
      return;
    }

    // POST /api/deep-dive
    if (url.pathname === '/api/deep-dive' && req.method === 'POST') {
      readJsonBody(req, async (body, parseError) => {
        if (parseError) {
          send({ status: 500, body: { message: parseError } });
          return;
        }
        send(await handleDeepDive(body, geminiApiKey));
      });
      return;
    }

    next();
  };

  return {
    name: 'news-digest-api-server',
    configResolved(config) {
      setupKeys(config.mode);
    },
    configureServer(server) {
      server.middlewares.use(middlewareHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middlewareHandler);
    },
  };
}
