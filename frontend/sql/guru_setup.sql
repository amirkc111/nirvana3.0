-- Guru Administrative Panel: Full Schema Setup 🌌🛡️

-- 1. Extend the Gurus table to support user linkage
ALTER TABLE gurus ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Create Appointments Table (if not exists)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES gurus(id),
    client_name TEXT NOT NULL,
    client_email TEXT,
    type TEXT DEFAULT 'consultation', -- 'consultation', 'service', etc.
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    appointment_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Create Chat Sessions Table (if not exists)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES gurus(id),
    user_id UUID REFERENCES auth.users(id),
    last_message TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Messages Table (if not exists)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user', 'guru', 'system'
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- 'text', 'call_request', 'service_request'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Real-time for Messages
alter publication supabase_realtime add table messages;

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_appointments_guru ON appointments(guru_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_guru ON chat_sessions(guru_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
