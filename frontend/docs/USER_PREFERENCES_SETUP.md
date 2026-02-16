# User Preferences Database Setup

This document explains how to set up the user preferences system for storing horoscope and user settings data.

## Database Setup

### 1. Run the SQL Script

Execute the `user-preferences-setup.sql` script in your Supabase SQL editor:

```sql
-- This script creates the user_preferences table and related functions
-- Run this in your Supabase project's SQL editor
```

### 2. Table Structure

The `user_preferences` table includes:

- **id**: Unique identifier for each preference record
- **user_id**: References the authenticated user
- **zodiac_sign**: Index of zodiac sign (0-11)
- **zodiac_sign_name**: Nepali name of zodiac sign
- **zodiac_sign_english**: English name of zodiac sign
- **zodiac_sign_icon**: Icon/symbol of zodiac sign
- **theme_preference**: User's theme preference
- **language_preference**: User's language preference
- **created_at**: Record creation timestamp
- **updated_at**: Last update timestamp

### 3. Security Features

- **Row Level Security (RLS)**: Users can only see their own preferences
- **Authentication Required**: All operations require user authentication
- **Data Privacy**: Preferences are isolated per user

## Features

### 🔮 **Horoscope Preferences**
- **Zodiac Sign Storage**: Saves user's selected zodiac sign
- **Multi-language Support**: Stores both Nepali and English names
- **Icon Storage**: Saves zodiac symbol for display
- **Persistent Selection**: Remembers user's choice across sessions

### 🎨 **Theme & Language Preferences**
- **Theme Storage**: Saves user's preferred theme
- **Language Storage**: Saves user's preferred language
- **Automatic Sync**: Syncs with existing theme/language system

### 📊 **Analytics & Insights**
- **User Behavior**: Track popular zodiac sign selections
- **Theme Preferences**: Monitor user theme choices
- **Language Usage**: Track language preferences
- **Personalization**: Enable personalized experiences

## Database Functions

### `get_user_preferences(user_uuid)`
Returns user's current preferences including zodiac sign, theme, and language.

### `upsert_user_preferences(user_uuid, zodiac_sign, zodiac_name, zodiac_english, zodiac_icon, theme, language)`
Creates or updates user preferences. Uses upsert pattern for efficient updates.

## Usage Examples

### Loading User Preferences
```javascript
const { data } = await supabase
  .rpc('get_user_preferences', { user_uuid: user.id });
```

### Saving Zodiac Selection
```javascript
const { data } = await supabase
  .rpc('upsert_user_preferences', {
    user_uuid: user.id,
    zodiac_sign_param: 0, // Aries
    zodiac_sign_name_param: 'मेष',
    zodiac_sign_english_param: 'Aries',
    zodiac_sign_icon_param: '♈'
  });
```

### Updating Theme Preference
```javascript
const { data } = await supabase
  .rpc('upsert_user_preferences', {
    user_uuid: user.id,
    theme_preference_param: 'dark_cosmic'
  });
```

## Integration

### **Navbar Component**
- **Auto-load**: Loads preferences when user logs in
- **Auto-save**: Saves zodiac selection immediately
- **State Sync**: Updates local state with database changes
- **Error Handling**: Graceful fallback for database errors

### **User Experience**
- **Persistent Selection**: Zodiac sign remembered across sessions
- **Instant Updates**: Changes saved immediately
- **Offline Support**: Works with cached preferences
- **Cross-device Sync**: Preferences sync across devices

## Privacy & Security

- **User Isolation**: Each user only sees their own preferences
- **Secure Access**: All database operations require authentication
- **Data Encryption**: Preferences are encrypted in transit and at rest
- **Audit Trail**: All changes are timestamped and tracked

## Monitoring & Analytics

The system provides insights into:
- **Popular Zodiac Signs**: Most selected zodiac signs
- **Theme Preferences**: User theme choices
- **Language Usage**: Language preference patterns
- **User Engagement**: Preference update frequency

## Troubleshooting

### Common Issues

1. **Preferences not loading**: Check user authentication status
2. **Zodiac not saving**: Verify database permissions
3. **Theme not syncing**: Check theme context integration
4. **Language not updating**: Verify language context integration

### Debug Information

The system logs:
- Preference load confirmations
- Database save operations
- Authentication status
- Error messages and stack traces

## Future Enhancements

- **Preference Categories**: Organize preferences by category
- **Bulk Operations**: Update multiple preferences at once
- **Preference History**: Track preference changes over time
- **Export/Import**: Allow users to export/import preferences
- **Preference Templates**: Pre-defined preference sets
- **Advanced Analytics**: Detailed user behavior insights
