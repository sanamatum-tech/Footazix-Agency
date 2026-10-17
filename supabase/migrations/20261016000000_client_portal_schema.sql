-- ==============================================================================
-- FOOTAZIX CLIENT PORTAL SCHEMA & ROW LEVEL SECURITY (RLS)
-- File: supabase/migrations/20261016000000_client_portal_schema.sql
-- ==============================================================================

-- 1. CLIENT ACCOUNTS TABLE (Controlled solely via Admin CMS)
CREATE TABLE IF NOT EXISTS public.client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'invited')),
  portal_title TEXT DEFAULT 'Client Portal',
  welcome_message TEXT DEFAULT 'Welcome to your private deliverables and project portal.',
  announcement TEXT,
  announcement_type TEXT DEFAULT 'info' CHECK (announcement_type IN ('info', 'important', 'alert')),
  navigation_config JSONB NOT NULL DEFAULT '{
    "overview": true,
    "videos": true,
    "documents": true,
    "agreements": true,
    "invoices": true,
    "feedback": true,
    "notifications": true,
    "profile": true
  }'::jsonb,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_accounts_email ON public.client_accounts (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_client_accounts_auth_user ON public.client_accounts (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_status ON public.client_accounts (status);

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

-- 2. CLIENT HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_current_client_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.client_accounts
  WHERE (
    auth_user_id = auth.uid()
    OR (auth.jwt()->>'email' IS NOT NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
  )
  AND status = 'active'
  LIMIT 1;
$$;

-- 3. CLIENT DELIVERABLES (VIDEOS) TABLE
CREATE TABLE IF NOT EXISTS public.client_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Reels',
  delivery_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'delivered', 'awaiting_feedback', 'approved')),
  version_info TEXT DEFAULT 'v1.0',
  delivery_notes TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_deliverables_client ON public.client_deliverables (client_id);
CREATE INDEX IF NOT EXISTS idx_client_deliverables_status ON public.client_deliverables (status);
CREATE INDEX IF NOT EXISTS idx_client_deliverables_published ON public.client_deliverables (published);

ALTER TABLE public.client_deliverables ENABLE ROW LEVEL SECURITY;

-- 4. CLIENT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN (
    'Agreements',
    'Invoices',
    'Terms and Conditions',
    'Privacy and Policy Documents',
    'Project Briefs',
    'Delivery Reports',
    'Other'
  )),
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'superseded')),
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'text', 'external', 'doc')),
  text_content TEXT,
  version_number TEXT DEFAULT '1.0',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_documents_client ON public.client_documents (client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_category ON public.client_documents (category);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- 5. CLIENT INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.client_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (payment_status IN ('DRAFT', 'ISSUED', 'PARTIALLY PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON public.client_invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON public.client_invoices (payment_status);

ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;

-- 6. CLIENT AGREEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.client_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agreement_period TEXT,
  included_services TEXT[] DEFAULT '{}',
  agreed_deliverables TEXT,
  delivery_terms TEXT,
  revision_policy TEXT,
  document_url TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
  version_number TEXT DEFAULT '1.0',
  version_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_agreements_client ON public.client_agreements (client_id);
CREATE INDEX IF NOT EXISTS idx_client_agreements_status ON public.client_agreements (status);

ALTER TABLE public.client_agreements ENABLE ROW LEVEL SECURITY;

-- 7. CLIENT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES public.client_deliverables(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Video Revision' CHECK (category IN (
    'Video Revision',
    'Pacing & Hooks',
    'Sound & Audio',
    'Graphics & Text',
    'General Feedback',
    'Agreement / Invoice'
  )),
  message TEXT NOT NULL,
  reference_link TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'RESOLVED')),
  admin_response TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_feedback_client ON public.client_feedback (client_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_deliverable ON public.client_feedback (deliverable_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_status ON public.client_feedback (status);

ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- 8. CMS-CONTROLLED FEEDBACK POP-UPS (PROMPTS)
CREATE TABLE IF NOT EXISTS public.client_feedback_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_client_ids UUID[] DEFAULT '{}',
  related_deliverable_id UUID REFERENCES public.client_deliverables(id) ON DELETE SET NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  trigger_event TEXT DEFAULT 'on_dashboard_load' CHECK (trigger_event IN ('on_dashboard_load', 'on_deliverables_view', 'manual')),
  disappear_after_submit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.client_feedback_prompts ENABLE ROW LEVEL SECURITY;

-- 9. PERSISTENT PROMPT INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.client_prompt_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.client_feedback_prompts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  feedback_id UUID REFERENCES public.client_feedback(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(prompt_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_prompt_interactions_client ON public.client_prompt_interactions (client_id);
ALTER TABLE public.client_prompt_interactions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- CLIENT ACCOUNTS
DROP POLICY IF EXISTS "Admins have full access to client_accounts" ON public.client_accounts;
CREATE POLICY "Admins have full access to client_accounts"
  ON public.client_accounts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own active account" ON public.client_accounts;
CREATE POLICY "Clients can view own active account"
  ON public.client_accounts FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND (
      auth_user_id = auth.uid()
      OR (auth.jwt()->>'email' IS NOT NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
    )
  );

DROP POLICY IF EXISTS "Clients can update own permitted profile details" ON public.client_accounts;
CREATE POLICY "Clients can update own permitted profile details"
  ON public.client_accounts FOR UPDATE
  TO authenticated
  USING (
    status = 'active'
    AND (
      auth_user_id = auth.uid()
      OR (auth.jwt()->>'email' IS NOT NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
    )
  )
  WITH CHECK (
    status = 'active'
    AND (
      auth_user_id = auth.uid()
      OR (auth.jwt()->>'email' IS NOT NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
    )
  );

-- CLIENT DELIVERABLES
DROP POLICY IF EXISTS "Admins have full access to client_deliverables" ON public.client_deliverables;
CREATE POLICY "Admins have full access to client_deliverables"
  ON public.client_deliverables FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view assigned published deliverables" ON public.client_deliverables;
CREATE POLICY "Clients can view assigned published deliverables"
  ON public.client_deliverables FOR SELECT
  TO authenticated
  USING (
    published = true
    AND client_id = public.get_current_client_id()
  );

-- CLIENT DOCUMENTS
DROP POLICY IF EXISTS "Admins have full access to client_documents" ON public.client_documents;
CREATE POLICY "Admins have full access to client_documents"
  ON public.client_documents FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view assigned published documents" ON public.client_documents;
CREATE POLICY "Clients can view assigned published documents"
  ON public.client_documents FOR SELECT
  TO authenticated
  USING (
    published = true
    AND status != 'draft'
    AND client_id = public.get_current_client_id()
  );

-- CLIENT INVOICES
DROP POLICY IF EXISTS "Admins have full access to client_invoices" ON public.client_invoices;
CREATE POLICY "Admins have full access to client_invoices"
  ON public.client_invoices FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own non-draft invoices" ON public.client_invoices;
CREATE POLICY "Clients can view own non-draft invoices"
  ON public.client_invoices FOR SELECT
  TO authenticated
  USING (
    payment_status != 'DRAFT'
    AND client_id = public.get_current_client_id()
  );

-- CLIENT AGREEMENTS
DROP POLICY IF EXISTS "Admins have full access to client_agreements" ON public.client_agreements;
CREATE POLICY "Admins have full access to client_agreements"
  ON public.client_agreements FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own non-draft agreements" ON public.client_agreements;
CREATE POLICY "Clients can view own non-draft agreements"
  ON public.client_agreements FOR SELECT
  TO authenticated
  USING (
    status != 'DRAFT'
    AND client_id = public.get_current_client_id()
  );

-- CLIENT FEEDBACK
DROP POLICY IF EXISTS "Admins have full access to client_feedback" ON public.client_feedback;
CREATE POLICY "Admins have full access to client_feedback"
  ON public.client_feedback FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own submitted feedback" ON public.client_feedback;
CREATE POLICY "Clients can view own submitted feedback"
  ON public.client_feedback FOR SELECT
  TO authenticated
  USING (client_id = public.get_current_client_id());

DROP POLICY IF EXISTS "Clients can submit feedback for own account" ON public.client_feedback;
CREATE POLICY "Clients can submit feedback for own account"
  ON public.client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (client_id = public.get_current_client_id());

-- FEEDBACK PROMPTS (POPUPS)
DROP POLICY IF EXISTS "Admins have full access to feedback_prompts" ON public.client_feedback_prompts;
CREATE POLICY "Admins have full access to feedback_prompts"
  ON public.client_feedback_prompts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view enabled targeted prompts" ON public.client_feedback_prompts;
CREATE POLICY "Clients can view enabled targeted prompts"
  ON public.client_feedback_prompts FOR SELECT
  TO authenticated
  USING (
    is_enabled = true
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    AND (
      cardinality(target_client_ids) = 0
      OR public.get_current_client_id() = ANY(target_client_ids)
    )
  );

-- PROMPT INTERACTIONS
DROP POLICY IF EXISTS "Admins have full access to prompt_interactions" ON public.client_prompt_interactions;
CREATE POLICY "Admins have full access to prompt_interactions"
  ON public.client_prompt_interactions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own prompt interactions" ON public.client_prompt_interactions;
CREATE POLICY "Clients can view own prompt interactions"
  ON public.client_prompt_interactions FOR SELECT
  TO authenticated
  USING (client_id = public.get_current_client_id());

DROP POLICY IF EXISTS "Clients can upsert own prompt interactions" ON public.client_prompt_interactions;
CREATE POLICY "Clients can upsert own prompt interactions"
  ON public.client_prompt_interactions FOR ALL
  TO authenticated
  USING (client_id = public.get_current_client_id())
  WITH CHECK (client_id = public.get_current_client_id());
