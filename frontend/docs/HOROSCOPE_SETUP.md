# Horoscope Database Setup

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Database Schema

The following table should already be created in your database:

```sql
CREATE TABLE horoscope_data (
  id SERIAL PRIMARY KEY,
  sign_name VARCHAR(50) NOT NULL,
  sign_slug VARCHAR(50) NOT NULL,
  prediction_text TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_horoscope_sign_date ON horoscope_data(sign_name, date);
```

## Manual Data Fetch

To manually fetch horoscope data:

```bash
npm run fetch-horoscope
```

## Cron Job Setup

To set up automatic daily fetching, add this to your crontab:

```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/nirvana3.0/frontend && npm run fetch-horoscope
```

## How It Works

1. **Cron Job**: Runs daily to fetch fresh horoscope data from hamropatro.com
2. **Database Storage**: Stores data in PostgreSQL database
3. **API Route**: Serves data from database instead of external API
4. **Frontend**: Displays data instantly without loading delays

## Benefits

- ✅ Fast loading (no external API calls)
- ✅ Reliable (data cached in database)
- ✅ Cost-effective (only 12 API calls per day)
- ✅ Better user experience
- ✅ Scalable for multiple users
