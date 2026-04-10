-- ============================================================
-- QueueSmart Database Migration: Queue
-- Run this in your Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- ============================================================

-- Queue table
-- Represents an active queue for a service
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_queue_service_id ON queue(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);

-- Auto-update the updated_at timestamp
CREATE TRIGGER update_queue_updated_at
  BEFORE UPDATE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on queue"
  ON queue FOR ALL
  USING (true) WITH CHECK (true);

-- Seed initial queues for existing services
INSERT INTO queue (service_id, status) VALUES
  ('1', 'open'),
  ('2', 'open'),
  ('3', 'open'),
  ('4', 'closed')
ON CONFLICT DO NOTHING;