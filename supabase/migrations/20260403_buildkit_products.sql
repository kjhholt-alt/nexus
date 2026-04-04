-- BuildKit Command Center tables
-- Products, Ideas, Marketing, Revenue

-- Products registry
CREATE TABLE IF NOT EXISTS buildkit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  tier TEXT NOT NULL DEFAULT 'planned' CHECK (tier IN ('launch-now', 'build-next', 'opportunistic', 'parked')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'building', 'beta', 'live', 'paused', 'archived')),
  icon TEXT DEFAULT 'Package',
  color TEXT DEFAULT 'cyan',
  github_repo TEXT,
  deploy_url TEXT,
  demo_url TEXT,
  landing_url TEXT,
  mrr NUMERIC(10,2) DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  feasibility INTEGER DEFAULT 0 CHECK (feasibility BETWEEN 0 AND 10),
  current_sprint TEXT,
  next_milestone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product ideas (pre-product stage)
CREATE TABLE IF NOT EXISTS buildkit_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  feasibility INTEGER DEFAULT 0 CHECK (feasibility BETWEEN 0 AND 10),
  market_size TEXT,
  revenue_potential TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'researched', 'validated', 'promoted', 'killed')),
  product_id UUID REFERENCES buildkit_products(id),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing events calendar
CREATE TABLE IF NOT EXISTS buildkit_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES buildkit_products(id),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('blog', 'social', 'email', 'launch', 'demo', 'outreach', 'seo', 'community', 'ad')),
  platform TEXT,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'done', 'skipped')),
  content_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Revenue events
CREATE TABLE IF NOT EXISTS buildkit_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES buildkit_products(id),
  amount NUMERIC(10,2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('stripe', 'lemonsqueezy', 'mcpize', 'manual', 'consulting', 'other')),
  description TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 8 products from the pursuit list
INSERT INTO buildkit_products (name, slug, tagline, tier, status, icon, color, feasibility, current_sprint, next_milestone) VALUES
  ('AI Ops in a Week', 'ai-ops', 'AI automation consulting for SMBs', 'launch-now', 'planned', 'Wrench', 'amber', 8, 'Client acquisition', 'Land first client'),
  ('MCP Server Portfolio', 'mcp-servers', 'Monetized MCP servers on MCPize', 'launch-now', 'building', 'Server', 'cyan', 8, 'Deploy to marketplace', 'Email-finder on MCPize'),
  ('AI Voice Receptionist', 'voice-receptionist', 'AI phone answering for SMBs', 'build-next', 'planned', 'Phone', 'emerald', 7, NULL, 'Retell AI prototype'),
  ('BuildKit Agents', 'buildkit-agents', 'White-label AI agents for agencies', 'build-next', 'planned', 'Bot', 'purple', 7, NULL, 'Build 3 demo agents'),
  ('Prospector Pro', 'prospector-pro', 'Vertical lead gen SaaS', 'build-next', 'planned', 'Search', 'orange', 7, NULL, 'MVP with 2 verticals'),
  ('DealBrain', 'dealbrain', 'AI due diligence for small business buyers', 'build-next', 'planned', 'FileSearch', 'rose', 7, NULL, 'PDF upload + analysis MVP'),
  ('ShipIt', 'shipit', 'Autonomous code factory', 'opportunistic', 'planned', 'Rocket', 'sky', 6, NULL, 'Take projects via referrals'),
  ('ClaimsReader', 'claimsreader', 'Insurance document extraction', 'parked', 'planned', 'FileText', 'zinc', 6, NULL, 'Build demo, find co-founder')
ON CONFLICT (slug) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE buildkit_products;
ALTER PUBLICATION supabase_realtime ADD TABLE buildkit_revenue;
