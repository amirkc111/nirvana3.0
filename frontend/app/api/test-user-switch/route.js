import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userSession } = await request.json();
    
    if (!userSession) {
      return NextResponse.json({ error: 'User session required' }, { status: 400 });
    }

    // Set the user session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: `Switched to user session: ${userSession}`,
      userSession: userSession
    });

    // Set cookie for 1 hour
    response.cookies.set('user-session', userSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    return response;
  } catch (error) {
    console.error('Error in test-user-switch:', error);
    return NextResponse.json({ error: 'Failed to switch user' }, { status: 500 });
  }
}
