-- Completely disable RLS for testing
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'kundli_records';

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all operations on kundli_records" ON kundli_records;
DROP POLICY IF EXISTS "Users can view their own kundli records" ON kundli_records;
DROP POLICY IF EXISTS "Users can insert their own kundli records" ON kundli_records;
DROP POLICY IF EXISTS "Users can update their own kundli records" ON kundli_records;
DROP POLICY IF EXISTS "Users can delete their own kundli records" ON kundli_records;
DROP POLICY IF EXISTS "Authenticated users can manage their own kundli records" ON kundli_records;
DROP POLICY IF EXISTS "Allow test user and authenticated users" ON kundli_records;

-- Completely disable RLS for testing
ALTER TABLE kundli_records DISABLE ROW LEVEL SECURITY;

-- Test the insert without any RLS
INSERT INTO kundli_records (user_id, name, birth_date, birth_time, latitude, longitude, timezone, city)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test RLS Disabled', '1990-01-01', '12:00:00', 27.7172, 85.3240, 5.75, 'Kathmandu');

-- Verify the insert worked
SELECT * FROM kundli_records WHERE name = 'Test RLS Disabled';

-- Clean up test record
DELETE FROM kundli_records WHERE name = 'Test RLS Disabled';

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'kundli_records';
