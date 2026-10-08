/**
 * FOOTAZIX — Core TypeScript Types
 * 
 * Clean, decoupled domain types prepared for Supabase schema mapping.
 */

export type VideoSourceType = 'youtube' | 'drive' | 'direct' | 'local';

export interface HeaderLogoSettings {
  url: string;
  alt: string;
  desktopWidth: number;
  mobileWidth: number;
  visible: boolean;
}

export interface FaviconSettings {
  url: string;
  appleTouchIconUrl?: string;
  visible: boolean;
}

export interface FooterLogoSettings {
  useHeaderLogo: boolean;
  url: string;
  desktopWidth: number;
  visible: boolean;
}

export interface OgImageSettings {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface BrandingAssetsSettings {
  headerLogo: HeaderLogoSettings;
  favicon: FaviconSettings;
  footerLogo: FooterLogoSettings;
  ogImage: OgImageSettings;
}

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
}

export interface HeaderSettings {
  navWork: string;
  navSystem: string;
  navServices: string;
  navAbout: string;
  ctaText: string;
  showInstagram?: boolean;
  showCta?: boolean;
  showLogo?: boolean;
  showWorkLink?: boolean;
  showSystemLink?: boolean;
  showServicesLink?: boolean;
  showAboutLink?: boolean;
  navItems?: NavItemConfig[];
}

export interface HeroSettings {
  badgeText: string;
  showBadge?: boolean;
  eyebrow?: string;
  headlineLine1: string;
  headlineLine2: string;
  supportingLine: string;
  showSupportingLine?: boolean;
  description: string;
  showDescription?: boolean;
  primaryCta: string;
  showPrimaryCta?: boolean;
  secondaryCta: string;
  showSecondaryCta?: boolean;
  smallSupportingText?: string;
}

export interface VSLSettings {
  label: string;
  showBadge?: boolean;
  heading: string;
  showHeading?: boolean;
  description: string;
  showDescription?: boolean;
  videoSource: VideoSourceType;
  videoUrl: string;
  posterUrl: string;
  captionUrl?: string;
  published: boolean;
  fallbackMessage?: string;
  ctaText?: string;
  showCta?: boolean;
  aspectRatio?: AspectRatioType;
  posterMonochrome?: boolean;
  monochrome?: boolean;
}

export interface RawToReadyStep {
  num: string;
  title: string;
  desc: string;
  badge?: string;
}

export interface RawToReadySettings {
  badge?: string;
  showBadge?: boolean;
  heading: string;
  subheading: string;
  showSubheading?: boolean;
  coreStepBadge?: string;
  steps: RawToReadyStep[];
  ctaText?: string;
  showCta?: boolean;
}

export interface PortfolioSettings {
  badge?: string;
  showBadge?: boolean;
  heading?: string;
  subheading?: string;
  showSubheading?: boolean;
  categories?: string[];
  showFilters?: boolean;
  emptyTitle?: string;
  emptyDesc?: string;
  cardCtaText?: string;
  monochrome?: boolean;
}

export interface ServicesSectionSettings {
  badge?: string;
  showBadge?: boolean;
  heading?: string;
  subheading?: string;
  showSubheading?: boolean;
  highlightedBadge?: string;
  showFeatureList?: boolean;
  showCta?: boolean;
  showNumbers?: boolean;
}

export interface AboutSectionSettings {
  badge?: string;
  showBadge?: boolean;
  heading?: string;
  subheading?: string;
  copy?: string;
  socialButtonText?: string;
  emailButtonText?: string;
  emptyText?: string;
  showPhotos?: boolean;
  showSocialLinks?: boolean;
  showEmails?: boolean;
  monochrome?: boolean;
}

export interface FinalCtaSettings {
  badge?: string;
  showBadge?: boolean;
  heading?: string;
  supporting?: string;
  showSupporting?: boolean;
  primaryCta?: string;
  showPrimaryCta?: boolean;
  secondaryCta?: string;
  showSecondaryCta?: boolean;
}

export interface FooterNavItem {
  id?: string;
  label: string;
  href: string;
  visible?: boolean;
  order?: number;
}

export interface FooterSocialLinkItem {
  id?: string;
  platform?: string;
  label: string;
  url: string;
  visible?: boolean;
  order?: number;
}

export interface FooterLegalLinkItem {
  id?: string;
  label: string;
  href: string;
  visible?: boolean;
  order?: number;
}

export interface FooterSettings {
  description?: string;
  showDescription?: boolean;
  navSectionTitle?: string;
  navWork?: string;
  navSystem?: string;
  navServices?: string;
  navAbout?: string;
  contactText?: string;
  showContact?: boolean;
  ctaText?: string;
  showCta?: boolean;
  socialSectionTitle?: string;
  instagramText?: string;
  showInstagram?: boolean;
  copyrightText: string;
  showCopyright?: boolean;
  legalSectionTitle?: string;
  termsLabel?: string;
  privacyLabel?: string;
  showLegal?: boolean;
  backToTopText?: string;
  showBackToTop?: boolean;
  tagline?: string;
  navItems?: FooterNavItem[];
  socialLinks?: FooterSocialLinkItem[];
  legalLinks?: FooterLegalLinkItem[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  visible: boolean;
  featured?: boolean;
  lastReviewedDate?: string;
  relatedService?: string;
  relatedProject?: string;
  ctaText?: string;
  ctaUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQSectionSettings {
  badge?: string;
  heading: string;
  subheading?: string;
  description?: string;
  allowMultipleOpen?: boolean;
  ctaText?: string;
  ctaAction?: string;
  ctaVisible?: boolean;
  visible?: boolean;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  visible: boolean;
  order: number;
}

export interface SectionVisibilitySettings {
  header: boolean;
  hero: boolean;
  system: boolean;
  portfolio: boolean;
  process: boolean;
  services: boolean;
  faq: boolean;
  about: boolean;
  team: boolean;
  finalCta: boolean;
  footer: boolean;
  instagram: boolean;
  startProjectModal: boolean;
  heroBadge?: boolean;
  heroDescription?: boolean;
  heroSecondaryCta?: boolean;
  faqCta?: boolean;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageType?: string;
  canonicalUrl: string;
  keywords: string;
}

export interface ContactModalContentSettings {
  badge?: string;
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  companyLabel?: string;
  servicesLabel?: string;
  detailsLabel?: string;
  budgetLabel?: string;
  submitText?: string;
  successTitle?: string;
  successMessage?: string;
  doneButtonText?: string;
}

export interface BrandSettings {
  name: string;
  domain: string;
  url: string;
  instagram: string;
  instagramHandle: string;
  showInstagramButton?: boolean;
  email: string;
  tagline: string;
  supportingLine: string;
  accentColor: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  content: string;
}

export interface WebsiteContent {
  brand: BrandSettings;
  brandingAssets: BrandingAssetsSettings;
  header: HeaderSettings;
  hero: HeroSettings;
  vsl: VSLSettings;
  portfolio?: PortfolioSettings;
  rawToReady: RawToReadySettings;
  servicesContent?: ServicesSectionSettings;
  aboutContent?: AboutSectionSettings;
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
  finalCta?: FinalCtaSettings;
  faqSection?: FAQSectionSettings;
  socialLinks?: SocialLinkItem[];
  footer: FooterSettings;
  sectionVisibility: SectionVisibilitySettings;
  sectionOrder: string[];
  seo: SeoSettings;
  contactModal?: ContactModalContentSettings;
  legal?: {
    terms: LegalDocument;
    privacy: LegalDocument;
  };
}

export type ProjectCategory = 'Reels' | 'Shorts' | 'YouTube' | 'Brand' | 'Motion' | 'Other';
export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | 'auto' | 'original';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  coverImage: string;
  videoUrl?: string;
  projectUrl?: string;
  client?: string;
  displayOrder: number;
  status: 'published' | 'draft';
  visible?: boolean;
  videoAspectRatio?: AspectRatioType;
  thumbnailAspectRatio?: AspectRatioType;
  featured?: boolean;
  monochrome?: boolean;
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
  monochrome?: boolean;
}

export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'completed' | 'archived';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services: string[];
  details: string;
  budget?: string;
  status: InquiryStatus;
  createdAt: string;
  notes?: string;
}

export type MediaCategory = 'images' | 'videos' | 'posters' | 'logos' | 'branding' | 'favicons';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  category: MediaCategory;
  type?: 'image' | 'video' | 'poster' | 'logo' | string;
  size: string;
  dimensions?: string;
  uploadedAt: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor';
}
