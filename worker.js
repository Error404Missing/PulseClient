// Static files that carry a ?v= cache-busting query in the HTML: safe to cache
// for a year, because a version bump changes the URL.
const IMMUTABLE_RE = /\.(?:css|mjs|js|woff2?|ttf|otf)$/i;
// Images / media are referenced from several places without a version query,
// so they get a long but recoverable TTL instead.
const MEDIA_RE = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|mp4|webm)$/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. Force HTTPS (Cloudflare "Always Use HTTPS" equivalent, enforced in code)
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
      return Response.redirect(url.toString(), status);
    }

    // 1. Logs routing rewrite (replaces vercel.json rewrite)
    if (url.hostname.startsWith('logs.') || url.pathname === '/logs') {
      const logsUrl = new URL(request.url);
      logsUrl.pathname = '/logs.html';
      return env.ASSETS.fetch(new Request(logsUrl.toString(), request));
    }

    // 2. Direct streaming for .jar files (bypasses 25MB Cloudflare asset limit by fetching directly from GitHub Raw)
    if (url.pathname.endsWith('.jar')) {
      const jarTargetUrl = 'https://raw.githubusercontent.com/Error404Missing/PulseClient/main/PulseClient-Fabric-1.21.11.jar?t=' + Math.floor(Date.now() / 60000);

      const upstream = await fetch(jarTargetUrl, {
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'PulseClient-Download-Proxy'
        },
        cf: {
          cacheEverything: false,
          cacheTtl: 0
        }
      });

      if (!upstream.ok) {
        // Fallback: Redirect directly to GitHub raw if upstream stream fails
        return Response.redirect(jarTargetUrl, 302);
      }

      const filename = url.pathname.split('/').pop() || 'PulseClient-Fabric-1.21.11.jar';
      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set('Content-Type', 'application/java-archive');
      responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
      responseHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(upstream.body, {
        status: 200,
        headers: responseHeaders
      });
    }

    // 3. Serve all other static assets (HTML, CSS, JS, images) via native Cloudflare Static Assets
    const assetResponse = await env.ASSETS.fetch(request);

    const method = request.method;
    if ((method === 'GET' || method === 'HEAD') && assetResponse.status === 200) {
      // HTML and other documents keep revalidating; only immutable assets are cached long.
      if (IMMUTABLE_RE.test(url.pathname)) {
        const cached = new Response(assetResponse.body, assetResponse);
        cached.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return cached;
      }
      if (MEDIA_RE.test(url.pathname)) {
        const cached = new Response(assetResponse.body, assetResponse);
        cached.headers.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
        return cached;
      }
    }

    return assetResponse;
  }
};
