// Server-side debug endpoint to inspect environment variables at runtime.
// This runs on the server (Next.js app server) and returns selected process.env values.

export async function GET() {
  try {
    const safeEnv = {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || null,
      NEXT_PUBLIC_API_BASE_URL_API: process.env.NEXT_PUBLIC_API_BASE_URL_API || null,
      NEXT_PUBLIC_API_AUTH_URL: process.env.NEXT_PUBLIC_API_AUTH_URL || null,
      NODE_ENV: process.env.NODE_ENV || null,
      // Add other vars you want to inspect below, but avoid returning secrets.
    };

    return new Response(JSON.stringify({ ok: true, env: safeEnv }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
