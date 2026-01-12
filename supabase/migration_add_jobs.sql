-- Add job field to shifts table
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS job TEXT;

-- Set default for existing shifts
UPDATE shifts SET job = 'walmart' WHERE user_name = 'macray' AND job IS NULL;

-- Create jobs table for pay rates
CREATE TABLE IF NOT EXISTS user_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  job_name TEXT NOT NULL,
  pay_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_name, job_name)
);

-- Insert Macray's jobs
INSERT INTO user_jobs (user_name, job_name, pay_rate) VALUES
  ('macray', 'walmart', 14.00),
  ('macray', '7brew', 8.00)
ON CONFLICT (user_name, job_name) DO NOTHING;

-- Yenna probably only has one job
INSERT INTO user_jobs (user_name, job_name, pay_rate) VALUES
  ('yenna', 'yenna_job', 15.00)
ON CONFLICT (user_name, job_name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_jobs_user_name ON user_jobs(user_name);

