# Supabase Authentication Setup

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your URL and anon key
3. Add the environment variables to your `.env.local` file

## Database Schema

### Automatic Tables (Created by Supabase Auth)
- `auth.users` - User accounts (managed by Supabase Auth)
- `auth.sessions` - User sessions (managed by Supabase Auth)
- `auth.identities` - OAuth identities (managed by Supabase Auth)
- `auth.refresh_tokens` - Refresh tokens (managed by Supabase Auth)

### Custom Tables (Run SQL to create)
Run the SQL files in the `scripts/` folder to create additional tables:

1. **Simple Setup**: `scripts/simple-auth-setup.sql`
   - Creates `user_details` table for additional user information
   - Auto-creates user details when user signs up
   - Includes RLS policies for security

2. **Advanced Setup**: `scripts/auth-database-setup.sql`
   - Creates `user_profiles` table with more fields
   - Creates `auth_logs` table for tracking authentication events
   - Includes triggers and functions for automation

## Features Implemented

- ✅ User registration with email verification
- ✅ User login with email/password
- ✅ Password confirmation for signup
- ✅ Loading states and error handling
- ✅ Success messages
- ✅ Form validation
- ✅ User metadata storage (full_name)

## Usage

The AuthModal component handles both sign-in and sign-up functionality:
- Users can toggle between login and signup modes
- Email verification is required for new accounts
- User data is stored in Supabase Auth
- Full name is stored in user metadata
