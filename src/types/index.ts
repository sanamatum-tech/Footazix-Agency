/**
 * FOOTAZIX — Core TypeScript Types
 * 
 * Clean, decoupled domain types prepared for Supabase schema mapping.
 */

export type VideoSourceType = 'youtube' | 'drive' | 'direct' | 'local';

export interface VSLSettings {
  label: string;
  heading: string;
  description: string;
  videoSource: VideoSourceType;
  videoUrl: string;
  posterUrl: string;
  captionUrl?: string; // .vtt file url or local object url
  published: boolean;
}

export interface HeroSettings {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  supportingLine: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface RawToReadyStep {
  num: string;
  title: string;
  desc: string;
}

export interface RawToReadySettings {
  heading: string;
  subheading: string;
  steps: RawToReadyStep[];
}

export interface BrandSettings {
  name: string;
  domain: string;
  url: string;
  instagram: string;
  instagramHandle: string;
  email: string;
  tagline: string;
  supportingLine: string;
  accentColor: string;
}

export interface WebsiteContent {
  brand: BrandSettings;
  hero: HeroSettings;
  vsl: VSLSettings;
  rawToReady: RawToReadySettings;
  sectionHeadings: {
    portfolioHeading: string;
    portfolioSubheading: string;
    servicesHeading: string;
    servicesSubheading: string;
    teamHeading: string;
    teamCopy: string;
    finalCtaHeadline: string;
    finalCtaSupporting: string;
  };
  footer: {
    copyrightText: string;
    tagline: string;
  };
}

export type ProjectCategory = 'Reels' | 'Shorts' | 'YouTube' | 'Brand' | 'Motion' | 'Other';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  coverImage: string;
  videoUrl?: string;
  client?: string;
  displayOrder: number;
  status: 'published' | 'draft';
  createdAt?: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
  visible: boolean;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string;
  socialLink?: string;
  email?: string;
  displayOrder: number;
  visible: boolean;
}

export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'completed' | 'archived';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services: string[]; // e.g. ['Video Editing', 'Reels / Shorts']
  details: string;
  budget?: string;
  status: InquiryStatus;
  createdAt: string;
  notes?: string;
}

export type MediaCategory = 'images' | 'videos' | 'posters' | 'logos';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  category: MediaCategory;
  size: string;
  dimensions?: string;
  uploadedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor';
}
