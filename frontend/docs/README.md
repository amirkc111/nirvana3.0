# Nirvana Astro Documentation

This directory contains all documentation for the Nirvana Astro project.

## Directory Structure

### `/docs/setup/`
Contains setup guides for various components:
- `CHAT_LOGS_SETUP.md` - Chat logs database setup
- `HOROSCOPE_SETUP.md` - Horoscope data setup
- `KUNDLI_DATABASE_SETUP.md` - Kundli database setup
- `SUPABASE_SETUP.md` - Supabase configuration
- `USER_PREFERENCES_SETUP.md` - User preferences setup

### `/docs/guides/`
Contains general guides:
- `SECURITY_GUIDE.md` - Security best practices

## Project Organization

The project has been reorganized for better maintainability:

- **`/api/`** - API-related files
  - `/python/` - Python API scripts
  - `/logs/` - API log files
- **`/data/`** - Data files
  - `/ephemeris/` - Swiss Ephemeris data files
  - `/archives/` - Archive files
- **`/legacy/`** - Legacy code and old implementations
- **`/docs/`** - All documentation files

## Getting Started

1. Follow the setup guides in `/docs/setup/`
2. Configure your environment variables
3. Run the development server with `npm run dev`