-- Fix RLS policies on kundli_data table
-- This will allow the API to access the Kundli data

-- ===========================================
-- Step 1: Check current RLS status
-- ===========================================

SELECT 
    'Current RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'kundli_data';

-- ===========================================
-- Step 2: Check existing RLS policies
-- ===========================================

SELECT 
    'Current RLS Policies' as status,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'kundli_data';

-- ===========================================
-- Step 3: Drop existing RLS policies (if any)
-- ===========================================

-- Drop all existing policies on kundli_data table
DROP POLICY IF EXISTS "Users can view own kundli data" ON kundli_data;
DROP POLICY IF EXISTS "Users can insert own kundli data" ON kundli_data;
DROP POLICY IF EXISTS "Users can update own kundli data" ON kundli_data;
DROP POLICY IF EXISTS "Users can delete own kundli data" ON kundli_data;

-- ===========================================
-- Step 4: Create new RLS policies that allow API access
-- ===========================================

-- Allow authenticated users to view their own kundli data
CREATE POLICY "Users can view own kundli data" ON kundli_data
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own kundli data
CREATE POLICY "Users can insert own kundli data" ON kundli_data
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own kundli data
CREATE POLICY "Users can update own kundli data" ON kundli_data
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own kundli data
CREATE POLICY "Users can delete own kundli data" ON kundli_data
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ===========================================
-- Step 5: Verify the new policies
-- ===========================================

SELECT 
    'New RLS Policies' as status,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'kundli_data';

-- ===========================================
-- Step 6: Test access with the new policies
-- ===========================================

SELECT 
    'Test Access with New Policies' as status,
    id,
    user_id,
    name,
    birth_year,
    birth_month,
    birth_day
FROM kundli_data
WHERE user_id = 'd4a67cfb-a34c-4f90-8611-b6fc4a4cec58'
ORDER BY created_at DESC;
