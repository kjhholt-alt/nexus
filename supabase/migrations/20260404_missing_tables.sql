-- ============================================================================
-- Missing tables migration — backfill for tables created via SQL Editor
-- These tables already exist in production, this migration is for VCS tracking
-- and fresh environment setup.
-- Run: paste into Supabase SQL Editor or `supabase db push`
-- ============================================================================

-- ── Swarm Core ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS swarm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project TEXT,
  task_type TEXT DEFAULT 'build',
  cost_tier TEXT DEFAULT 'cc_light',
  priority INTEGER DEFAULT 50,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','blocked','pending_approval','approved','cancelled')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB,
  assigned_worker_id TEXT,
  team_id UUID,
  parent_task_ids UUID[] DEFAULT '{}',
  chain_next JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  recurrence_interval_minutes INTEGER,
  use_worktree BOOLEAN DEFAULT false,
  queued_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_tasks_status ON swarm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_swarm_tasks_project ON swarm_tasks(project);
CREATE INDEX IF NOT EXISTS idx_swarm_tasks_cost_tier ON swarm_tasks(cost_tier);
CREATE INDEX IF NOT EXISTS idx_swarm_tasks_priority ON swarm_tasks(priority DESC);

CREATE TABLE IF NOT EXISTS swarm_workers (
  id TEXT PRIMARY KEY,
  worker_type TEXT NOT NULL,
  tier TEXT DEFAULT 'cc_light',
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle','busy','dead','paused')),
  current_task_id UUID REFERENCES swarm_tasks(id),
  xp INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_swarm_workers_status ON swarm_workers(status);
CREATE INDEX IF NOT EXISTS idx_swarm_workers_tier ON swarm_workers(tier);

CREATE TABLE IF NOT EXISTS swarm_budgets (
  id TEXT PRIMARY KEY DEFAULT 'daily',
  date DATE DEFAULT CURRENT_DATE,
  total_spend_usd NUMERIC(10,4) DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_minutes NUMERIC(10,2) DEFAULT 0,
  task_count INTEGER DEFAULT 0,
  budget_limit_usd NUMERIC(10,2) DEFAULT 50,
  budget_limit_minutes NUMERIC(10,2) DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS swarm_task_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES swarm_tasks(id),
  event TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_task_log_task ON swarm_task_log(task_id);
CREATE INDEX IF NOT EXISTS idx_swarm_task_log_created ON swarm_task_log(created_at DESC);

CREATE TABLE IF NOT EXISTS swarm_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID,
  project TEXT,
  task_type TEXT,
  keywords TEXT[] DEFAULT '{}',
  summary TEXT,
  output_data JSONB,
  relevance_score NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_memory_project ON swarm_memory(project);
CREATE INDEX IF NOT EXISTS idx_swarm_memory_keywords ON swarm_memory USING GIN(keywords);

-- ── Agent Tracking ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_name TEXT,
  project TEXT,
  status TEXT DEFAULT 'running',
  current_step TEXT,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER,
  output TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_updated ON agent_activity(updated_at DESC);

CREATE TABLE IF NOT EXISTS agent_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC(10,2),
  best_practices TEXT[],
  last_success_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project, task_type)
);

-- ── Oracle ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS oracle_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','dismissed','redirected')),
  action_type TEXT,
  action_data JSONB DEFAULT '{}',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oracle_decisions_status ON oracle_decisions(status);

CREATE TABLE IF NOT EXISTS oracle_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_type TEXT DEFAULT 'live',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oracle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oracle_conversations_conv ON oracle_conversations(conversation_id);

-- ── Cost Tracking ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID,
  session_id TEXT,
  project TEXT,
  model TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  duration_seconds NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_tracking_project ON cost_tracking(project);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_created ON cost_tracking(created_at DESC);

CREATE TABLE IF NOT EXISTS cost_budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  threshold_usd NUMERIC(10,2) NOT NULL,
  period TEXT DEFAULT 'daily' CHECK (period IN ('daily','weekly','monthly')),
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Materialized views for cost aggregation
CREATE OR REPLACE VIEW daily_cost_summary AS
SELECT
  DATE(created_at) as date,
  SUM(cost_usd) as total_cost,
  SUM(input_tokens + output_tokens) as total_tokens,
  COUNT(*) as event_count
FROM cost_tracking
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW project_cost_summary AS
SELECT
  project,
  SUM(cost_usd) as total_cost,
  SUM(input_tokens + output_tokens) as total_tokens,
  COUNT(*) as event_count
FROM cost_tracking
GROUP BY project
ORDER BY total_cost DESC;

-- ── Prospects ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Enable Realtime ─────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE swarm_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE swarm_workers;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_activity;

-- ── RLS Policies (allow all for anon — internal dashboard) ──────────────────

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'swarm_tasks','swarm_workers','swarm_budgets','swarm_task_log','swarm_memory',
    'agent_activity','agent_specializations',
    'oracle_decisions','oracle_briefings','oracle_conversations',
    'cost_tracking','cost_budget_alerts','prospects'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "allow_all_select_%s" ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "allow_all_insert_%s" ON %I FOR INSERT WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "allow_all_update_%s" ON %I FOR UPDATE USING (true)', t, t);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "allow_all_delete_%s" ON %I FOR DELETE USING (true)', t, t);
  END LOOP;
END $$;
