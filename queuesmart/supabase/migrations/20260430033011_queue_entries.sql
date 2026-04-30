-- queue_entries: tracks individual users in queues
-- Records who joined, when, when served (or left), and final status.
-- Used by:
--   - Reporting module (users served, avg wait time, per-service stats)
--   - Smart wait-time feature (historical data for predictions)

CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_credentials(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES service(service_id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled', 'no-show')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  wait_time_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for the queries we'll run
CREATE INDEX IF NOT EXISTS idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_id ON queue_entries(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_service_name ON queue_entries(service_name);