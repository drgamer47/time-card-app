-- Make actual_start and actual_end nullable for scheduled shifts
ALTER TABLE shifts 
  ALTER COLUMN actual_start DROP NOT NULL,
  ALTER COLUMN actual_end DROP NOT NULL;



