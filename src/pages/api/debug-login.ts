import type { APIRoute } from 'astro';
import { createAuth } from '../../../auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env;
    const auth = createAuth(env, request);
    
    const body = await request.json();
    console.log('[DEBUG-LOGIN] Attempting login with:', body.email);
    
    // Try to sign in using the API directly
    const signInReq = new Request(new URL('/api/auth/sign-in/email', request.url), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });
    
    const res = await auth.handler(signInReq);
    
    // Collect all response data
    const headersObj: Record<string, string> = {};
    res.headers.forEach((v, k) => { headersObj[k] = v; });
    
    const resBody = await res.clone().text();
    
    return Response.json({
      status: res.status,
      headers: headersObj,
      bodyLength: resBody.length,
      bodyPreview: resBody.substring(0, 500),
      setCookies: res.headers.getSetCookie ? res.headers.getSetCookie() : 'getSetCookie not available',
    });
  } catch (err: any) {
    return Response.json({
      error: err.message,
      stack: err.stack?.substring(0, 500),
    }, { status: 500 });
  }
};
