/**
-- ==============================================================================
-- FOOTAZIX — Client Portal Type Definitions
-- File: src/types/clientPortal.ts
-- ==============================================================================
*/

export type ClientAccountStatus = 'active' | 'deactivated' | 'invited';

export interface ClientNavigationConfig {
  overview: boolean;
  videos: boolean;
  documents: boolean;
  agreements: boolean;
  invoices: boolean;
  feedback: boolean;
  notifications: boolean;
  profile: boolean;
}

export interface ClientAccount {
  id: string;
  auth_user_id?: string | null;
  email: string;
  full_name: string;
  company_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status: ClientAccountStatus;
  portal_title?: string;
  welcome_message?: string;
  announcement?: string | null;
  announcement_type?: 'info' | 'important' | 'alert';
  navigation_config: ClientNavigationConfig;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliverableStatus =
  | 'in_progress'
  | 'delivered'
  | 'awaiting_feedback'
  | 'approved';

export interface ClientDeliverable {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url: string;
  category: string;
  delivery_date: string;
  status: DeliverableStatus;
  version_info?: string;
  delivery_notes?: string;
  published: boolean;
  is_private?: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | 'Agreements'
  | 'Invoices'
  | 'Terms and Conditions'
  | 'Privacy and Policy Documents'
  | 'Project Briefs'
  | 'Delivery Reports'
  | 'Other';

export type DocumentStatus = 'active' | 'draft' | 'archived' | 'superseded';

export interface ClientDocument {
  id: string;
  client_id: string;
  title: string;
  category: DocumentCategory;
  issue_date: string;
  expiry_date?: string | null;
  status: DocumentStatus;
  file_url?: string | null;
  file_type?: 'pdf' | 'text' | 'external' | 'doc';
  text_content?: string | null;
  version_number?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export type InvoicePaymentStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface ClientInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  currency: string;
  subtotal: number;
  tax: number;
  total_amount: number;
  payment_status: InvoicePaymentStatus;
  pdf_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AgreementStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface AgreementVersionHistoryItem {
  version: string;
  modified_at: string;
  modified_by?: string;
  change_summary?: string;
  document_url?: string;
}

export interface ClientAgreement {
  id: string;
  client_id: string;
  title: string;
  agreement_period?: string;
  included_services: string[];
  agreed_deliverables?: string;
  delivery_terms?: string;
  revision_policy?: string;
  document_url?: string | null;
  text_content?: string | null;
  status: AgreementStatus;
  version_number: string;
  version_history?: AgreementVersionHistoryItem[];
  created_at: string;
  updated_at: string;
}

export type FeedbackCategory =
  | 'Video Revision'
  | 'Pacing & Hooks'
  | 'Sound & Audio'
  | 'Graphics & Text'
  | 'General Feedback'
  | 'Agreement / Invoice';

export type FeedbackStatus = 'SUBMITTED' | 'UNDER REVIEW' | 'RESOLVED';

export interface ClientFeedback {
  id: string;
  client_id: string;
  deliverable_id?: string | null;
  category: FeedbackCategory;
  message: string;
  reference_link?: string | null;
  attachment_url?: string | null;
  status: FeedbackStatus;
  admin_response?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined or client view
  deliverable_title?: string;
}

export interface ClientFeedbackPrompt {
  id: string;
  title: string;
  message: string;
  target_client_ids: string[];
  related_deliverable_id?: string | null;
  is_enabled: boolean;
  start_date?: string | null;
  end_date?: string | null;
  trigger_event: 'on_dashboard_load' | 'on_deliverables_view' | 'manual';
  disappear_after_submit: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPromptInteraction {
  id: string;
  prompt_id: string;
  client_id: string;
  dismissed: boolean;
  completed: boolean;
  completed_at?: string | null;
  dismissed_at?: string | null;
  feedback_id?: string | null;
  created_at: string;
}

export interface ClientDashboardStats {
  totalVideos: number;
  deliveredVideos: number;
  inProgressVideos: number;
  awaitingFeedbackVideos: number;
  pendingDeliverables: number;
  availableDocuments: number;
  outstandingInvoices: number;
  unresolvedFeedbackCount: number;
}
