import type {
  ExecutionContext,
  FetchEvent,
} from '@cloudflare/workers-types';

// This is a basic fetch handler that serves static assets.
// The ASSETS binding is configured in wrangler.toml to point to the ./dist directory.
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // For static assets, we can directly use the ASSETS binding.
      // The 'env.ASSETS' object is automatically provided by Cloudflare Workers
      // when the 'assets' binding is configured in wrangler.toml.
      // It behaves like a KV namespace for your static assets.
      const response = await env.ASSETS.fetch(request);

      // If the asset is found, return it.
      if (response.status === 200) {
        return response;
      }

      // If the asset is not found, try to serve index.html for SPA routing.
      // This is common for single-page applications.
      const url = new URL(request.url);
      if (url.pathname.includes('.')) {
        // If the path contains a file extension and it's not found, return 404.
        return new Response('Not Found', { status: 404 });
      }

      // Otherwise, assume it's a route that should be handled by the SPA,
      // so serve index.html.
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));

    } catch (e) {
      // Log any errors and return a 500 response.
      console.error('Error serving asset:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

// Define the Env interface to include the ASSETS binding.
// This is important for TypeScript to recognize env.ASSETS.
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}
