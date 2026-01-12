-- Add breaks_taken column to shifts table for Phase 4
-- This tracks the number of 15-minute breaks taken during a shift

ALTER TABLE shifts 
  ADD COLUMN IF NOT EXISTS breaks_taken INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_breaks_taken ON shifts(breaks_taken);

-- Update existing rows to have 0 breaks (if any exist)
UPDATE shifts SET breaks_taken = 0 WHERE breaks_taken IS NULL;

