// Authentication helper functions for the chat system

export const setUserSession = (sessionName = 'amir_session') => {
  // Set a user session cookie for authentication
  document.cookie = `user-session=${sessionName}; path=/; max-age=3600; SameSite=Lax`;
  console.log(`🔍 User session cookie set: ${sessionName}`);
};

export const clearUserSession = () => {
  // Clear the user session cookie
  document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  console.log('🔍 User session cookie cleared');
};

export const getUserSession = () => {
  // Get the current user session from cookies
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('user-session='));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
};

export const ensureAuthentication = async () => {
  // Ensure user is authenticated before making API calls
  const currentSession = getUserSession();
  
  if (!currentSession) {
    console.log('🔍 No user session found, setting default session...');
    setUserSession('amir_session');
  }
  
  return currentSession || 'amir_session';
};

// Available user sessions for testing
export const USER_SESSIONS = {
  AMIR: 'amir_session',
  SARAH: 'sarah_session', 
  JOHN: 'john_session'
};
