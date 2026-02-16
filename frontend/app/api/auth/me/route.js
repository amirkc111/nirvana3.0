import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    console.log('🔍 Auth/me - Checking authentication...');

    // Check for Supabase authentication cookies
    // Dynamic search for ANY cookie ending in '-auth-token' (Supabase default format: sb-<project-ref>-auth-token)
    let supabaseAccessToken = request.cookies.get('sb-access-token')?.value;
    const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!supabaseAccessToken) {
      // Fallback: Search for project-specific auth token
      const allCookies = request.cookies.getAll();
      const authCookie = allCookies.find(c => c.name.endsWith('-auth-token') && c.name.startsWith('sb-'));
      if (authCookie) {
        console.log(`🔍 Found dynamic Supabase cookie: ${authCookie.name}`);
        // The cookie value might be a complex string or JSON. 
        // Standard Supabase auth token cookies usually contain ["access_token", "refresh_token", ...]
        // Or just the string. Let's try to parse or use it.
        const cookieVal = authCookie.value;
        if (cookieVal.startsWith('base64-')) {
          // handle base64 if needed, but usually it's direct
        }

        // If it's the v2 format, it might be JSON stringified
        try {
          if (cookieVal.startsWith('[') || cookieVal.startsWith('{')) {
            const parsed = JSON.parse(cookieVal);
            // It's often an array: [access_token, refresh_token, ...] or object
            if (Array.isArray(parsed) && parsed.length > 0) supabaseAccessToken = parsed[0];
            else if (parsed.access_token) supabaseAccessToken = parsed.access_token;
          } else {
            supabaseAccessToken = cookieVal;
          }
        } catch (e) {
          supabaseAccessToken = cookieVal;
        }
      }
    }

    console.log('🔍 Supabase tokens found:', {
      accessToken: !!supabaseAccessToken ? 'Yes (Length: ' + supabaseAccessToken.length + ')' : 'No',
      refreshToken: !!supabaseRefreshToken
    });

    // Try Supabase authentication first
    if (supabaseAccessToken) {
      try {
        // Create server-side Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: { user }, error } = await supabase.auth.getUser(supabaseAccessToken);
        if (user && !error) {
          console.log(`✅ Real user found via Supabase: ${user.email} (${user.id})`);
          return NextResponse.json({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            isAuthenticated: true
          });
        }
      } catch (supabaseError) {
        console.log('❌ Supabase auth failed:', supabaseError.message);
      }
    }

    // Check for other authentication methods
    const authToken = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (authToken) {
      console.log('🔍 Found auth token, but no valid authentication');
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is logged in via session simulation
    const userSession = request.cookies.get('user-session')?.value;
    if (userSession) {
      console.log('🔍 Found user session, but no valid authentication');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }


    // No valid authentication found
    console.log('🔍 No valid authentication found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch (error) {
    console.error('❌ Error in auth/me:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}