# Chat Logs Database Setup

This document explains how to set up the chat logs system for recording Astro Bot conversations.

## Database Setup

### 1. Run the SQL Script

Execute the `chat-logs-setup.sql` script in your Supabase SQL editor:

```sql
-- This script creates the chat_logs table and related functions
-- Run this in your Supabase project's SQL editor
```

### 2. Table Structure

The `chat_logs` table includes:

- **id**: Unique identifier for each message
- **user_id**: References the authenticated user
- **session_id**: Groups messages by chat session
- **message_type**: Either 'user' or 'bot'
- **message_text**: The actual message content
- **timestamp**: When the message was sent
- **metadata**: Additional data (message ID, language, etc.)
- **created_at**: Record creation timestamp

### 3. Security Features

- **Row Level Security (RLS)**: Users can only see their own messages
- **Authentication Required**: All operations require user authentication
- **Data Privacy**: Messages are isolated per user

## Features

### 🔒 **Authentication-Based Access**
- Only logged-in users can access the chat bot
- All conversations are tied to user accounts
- Session-based message grouping

### 💾 **Message Persistence**
- All user questions are saved to database
- Bot responses are recorded
- Chat history is preserved across sessions
- Session-based conversation grouping

### 📊 **Analytics & Insights**
- Track user engagement with the bot
- Analyze popular questions and topics
- Monitor bot usage patterns
- Generate conversation statistics

### 🔍 **Chat History**
- Users can see their previous conversations
- Messages are loaded when chat opens
- Session continuity across page refreshes
- Historical conversation access

## Database Functions

### `get_user_chat_history(user_uuid, session_id)`
Returns chat history for a specific user and session.

### `get_chat_stats(user_uuid)`
Returns statistics about a user's chat activity:
- Total messages
- User vs bot message counts
- Unique sessions
- First and last chat dates

## Usage Examples

### Saving a Message
```javascript
await saveMessageToDatabase({
  id: Date.now(),
  text: "Hello, how are you?",
  isBot: false,
  timestamp: new Date()
});
```

### Loading Chat History
```javascript
const { data } = await supabase
  .from('chat_logs')
  .select('*')
  .eq('user_id', user.id)
  .eq('session_id', sessionId)
  .order('timestamp', { ascending: true });
```

### Getting Chat Statistics
```javascript
const { data } = await supabase
  .rpc('get_chat_stats', { user_uuid: user.id });
```

## Privacy & Security

- **User Isolation**: Each user only sees their own messages
- **Secure Access**: All database operations require authentication
- **Data Encryption**: Messages are encrypted in transit and at rest
- **Session Management**: Conversations are grouped by session
- **Audit Trail**: All messages are timestamped and tracked

## Monitoring & Analytics

The system provides insights into:
- User engagement with the chat bot
- Popular questions and topics
- Bot response effectiveness
- Usage patterns and trends
- Session duration and frequency

## Troubleshooting

### Common Issues

1. **Messages not saving**: Check user authentication status
2. **History not loading**: Verify session ID generation
3. **Permission errors**: Ensure RLS policies are properly set
4. **Database connection**: Verify Supabase configuration

### Debug Information

The system logs:
- Message save confirmations
- Database errors
- Authentication status
- Session management
- Chat history loading

## Future Enhancements

- **Message Search**: Full-text search across chat history
- **Export Conversations**: Download chat history as PDF/JSON
- **Analytics Dashboard**: Visual insights into chat usage
- **Message Categories**: Tag and categorize different types of questions
- **Bot Learning**: Use conversation data to improve bot responses
