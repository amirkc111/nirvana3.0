
-- Add JSONB columns to kundli_data table for storing rich analysis data
ALTER TABLE kundli_data 
ADD COLUMN IF NOT EXISTS analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS facts JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS kundli_data JSONB DEFAULT '{}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN kundli_data.analysis IS 'Stores AI predictions and deep analysis';
COMMENT ON COLUMN kundli_data.facts IS 'Stores Vedic facts like Avakahada, Ghatarchakra';
COMMENT ON COLUMN kundli_data.kundli_data IS 'Stores the raw calculation data (planets, houses)';
