// Server-side debug endpoint to inspect environment variables at runtime.
// This runs on the server (Next.js app server) and returns selected process.env values.

export async function GET() {
  try {
    // Return the hardcoded values (no runtime env usage)
    const safeEnv = {
      NEXT_PUBLIC_API_BASE_URL: 'https://alphabridge-backend-34902771404.europe-west1.run.app',
      NEXT_PUBLIC_API_BASE_URL_API: 'https://alphabridge-backend-34902771404.europe-west1.run.app/api',
      NEXT_PUBLIC_API_AUTH_URL: 'https://alphabridge-backend-34902771404.europe-west1.run.app/auth',
      NODE_ENV: 'production',
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
