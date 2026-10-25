export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Logs routing rewrite (replaces vercel.json rewrite)
    if (url.hostname.startsWith('logs.') || url.pathname === '/logs') {
      const logsUrl = new URL(request.url);
      logsUrl.pathname = '/logs.html';
      return env.ASSETS.fetch(new Request(logsUrl.toString(), request));
    }

    // 2. Direct streaming for .jar files (bypasses 25MB Cloudflare asset limit by fetching directly from GitHub Raw)
    if (url.pathname.endsWith('.jar')) {
      const jarTargetUrl = 'https://raw.githubusercontent.com/Error404Missing/PulseClient/main/PulseClient-Fabric-1.21.11.jar';
      
      const upstream = await fetch(jarTargetUrl, {
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'PulseClient-Download-Proxy'
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
    return env.ASSETS.fetch(request);
  }
};
