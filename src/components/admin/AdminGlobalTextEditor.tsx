import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteContent } from '../../types';
import {
  Type,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  PlaySquare,
  FolderKanban,
  Layers,
  BriefcaseBusiness,
  UsersRound,
  HelpCircle,
  Flame,
  PanelBottom,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Filter,
  Check,
  Link,
  Globe2,
  PanelTop,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type TextSectionKey =
  | 'all'
  | 'header'
  | 'hero'
  | 'vsl'
  | 'portfolio'
  | 'process'
  | 'services'
  | 'faq'
  | 'team'
  | 'cta'
  | 'footer'
  | 'copyright'
  | 'legal'
  | 'contactModal';

interface TextElementDefinition {
  id: string;
  section: TextSectionKey;
  sectionLabel: string;
  label: string;
  description: string;
  textPath: string;
  multiline?: boolean;
  supportsLink?: boolean;
  linkPath?: string;
  newTabPath?: string;
  visibilityPath?: string;
  placeholder?: string;
}

export const AdminGlobalTextEditor: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { content, updateWebsiteContent, resetWebsiteContent, saveStatus, navigateToPublic } =
    useApp();
  const [formData, setFormData] = useState<WebsiteContent>(content);
  const [activeSectionFilter, setActiveSectionFilter] = useState<TextSectionKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  // Deep getter helper
  const getValue = (path: string): any => {
    const parts = path.split('.');
    let curr: any = formData;
    for (const p of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[p];
    }
    return curr;
  };

  // Deep setter helper
  const setValue = (path: string, val: any) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let curr = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (curr[parts[i]] === undefined || curr[parts[i]] === null) {
          curr[parts[i]] = {};
        }
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
      return copy;
    });
  };

  // Check if anything has changed compared to live Supabase context
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(content);
  }, [formData, content]);

  // Comprehensive definitions of all visible website texts mapped directly to WebsiteContent paths
  const textElements: TextElementDefinition[] = useMemo(
    () => [
      // 1. Header & Navigation
      {
        id: 'header-brand-name',
        section: 'header',
        sectionLabel: 'Header / Brand',
        label: 'Brand Name',
        description: 'Displayed in top navbar and fallback branding.',
        textPath: 'brand.name',
        supportsLink: true,
        linkPath: 'brand.url',
        placeholder: 'Footazix',
      },
      {
        id: 'header-nav-work',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Nav Link: Work',
        description: 'First navigation bar link pointing to the Portfolio section.',
        textPath: 'header.navItems.0.label',
        supportsLink: true,
        linkPath: 'header.navItems.0.href',
        visibilityPath: 'header.navItems.0.visible',
        placeholder: 'Work',
      },
      {
        id: 'header-nav-system',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Nav Link: System',
        description: 'Second navigation bar link pointing to Founder VSL / System.',
        textPath: 'header.navItems.1.label',
        supportsLink: true,
        linkPath: 'header.navItems.1.href',
        visibilityPath: 'header.navItems.1.visible',
        placeholder: 'System',
      },
      {
        id: 'header-nav-services',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Nav Link: Services',
        description: 'Third navigation bar link pointing to Services Grid.',
        textPath: 'header.navItems.2.label',
        supportsLink: true,
        linkPath: 'header.navItems.2.href',
        visibilityPath: 'header.navItems.2.visible',
        placeholder: 'Services',
      },
      {
        id: 'header-nav-about',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Nav Link: About',
        description: 'Fourth navigation bar link pointing to About / Process section.',
        textPath: 'header.navItems.3.label',
        supportsLink: true,
        linkPath: 'header.navItems.3.href',
        visibilityPath: 'header.navItems.3.visible',
        placeholder: 'About',
      },
      {
        id: 'header-nav-faq',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Nav Link: FAQ',
        description: 'Fifth navigation bar link pointing to FAQ section.',
        textPath: 'header.navItems.4.label',
        supportsLink: true,
        linkPath: 'header.navItems.4.href',
        visibilityPath: 'header.navItems.4.visible',
        placeholder: 'FAQ',
      },
      {
        id: 'header-contact-btn',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Contact Link Button',
        description: 'Text for the subtle header Contact trigger.',
        textPath: 'header.contactButtonText',
        visibilityPath: 'header.showContactButton',
        placeholder: 'Contact',
      },
      {
        id: 'header-cta-btn',
        section: 'header',
        sectionLabel: 'Header / Navigation',
        label: 'Header Primary CTA Button',
        description: 'Glowing button on the right side of the desktop navigation bar.',
        textPath: 'header.ctaButtonText',
        visibilityPath: 'header.showCtaButton',
        supportsLink: true,
        linkPath: 'header.ctaButtonHref',
        placeholder: 'Start a Project',
      },
      {
        id: 'header-instagram',
        section: 'header',
        sectionLabel: 'Header / Social',
        label: 'Instagram Social Link',
        description: 'Header direct Instagram icon button URL.',
        textPath: 'brand.instagramHandle',
        supportsLink: true,
        linkPath: 'brand.instagram',
        newTabPath: 'brand.showInstagramButton',
        visibilityPath: 'sectionVisibility.instagram',
        placeholder: '@footazix',
      },

      // 2. Hero Section
      {
        id: 'hero-badge',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Top Eyebrow Badge',
        description: 'Pill badge above the main hero headline.',
        textPath: 'hero.badgeText',
        visibilityPath: 'sectionVisibility.heroBadge',
        placeholder: 'PREMIUM CONTENT PRODUCTION',
      },
      {
        id: 'hero-headline-1',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Headline Line 1',
        description: 'Primary large display headline first line.',
        textPath: 'hero.headlineLine1',
        placeholder: 'CONTENT WORTH',
      },
      {
        id: 'hero-headline-2',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Headline Line 2',
        description: 'Primary large display headline second line.',
        textPath: 'hero.headlineLine2',
        placeholder: 'WATCHING.',
      },
      {
        id: 'hero-supporting',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Supporting Tagline',
        description: 'Bold uppercase line above the description paragraph.',
        textPath: 'hero.supportingLine',
        placeholder: 'TURNING RAW FOOTAGE INTO AUDIENCE RETENTION',
      },
      {
        id: 'hero-description',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Hero Paragraph Description',
        description: 'Subheading explanation below the main headline.',
        textPath: 'hero.description',
        multiline: true,
        visibilityPath: 'sectionVisibility.heroDescription',
        placeholder:
          'Footazix partners with ambitious creators, brands, and businesses to engineer high-retention video content from raw footage.',
      },
      {
        id: 'hero-primary-cta',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Hero Primary Action Button',
        description: 'Main button triggering project inquiry.',
        textPath: 'hero.primaryCta',
        placeholder: 'START A PROJECT',
      },
      {
        id: 'hero-secondary-cta',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Hero Secondary Action Button',
        description: 'Secondary button scrolling to Founder VSL System.',
        textPath: 'hero.secondaryCta',
        visibilityPath: 'sectionVisibility.heroSecondaryCta',
        placeholder: 'SEE THE SYSTEM →',
      },
      {
        id: 'hero-availability',
        section: 'hero',
        sectionLabel: 'Hero Section',
        label: 'Studio Availability Badge',
        description: 'Status indicator badge (e.g. Taking on 2 new creators this month).',
        textPath: 'brand.tagline',
        placeholder: 'ACCEPTING SELECT NEW PROJECTS',
      },

      // 3. System / VSL
      {
        id: 'vsl-badge',
        section: 'vsl',
        sectionLabel: 'System / VSL',
        label: 'Section Eyebrow Label',
        description: 'Small badge text above the VSL headline.',
        textPath: 'vsl.label',
        visibilityPath: 'vsl.showBadge',
        placeholder: 'THE FOOTAZIX SYSTEM',
      },
      {
        id: 'vsl-heading',
        section: 'vsl',
        sectionLabel: 'System / VSL',
        label: 'Section Heading',
        description: 'Main heading above the video player.',
        textPath: 'vsl.heading',
        visibilityPath: 'vsl.showHeading',
        placeholder: 'SEE HOW FOOTAZIX TRANSFORMS CONTENT.',
      },
      {
        id: 'vsl-description',
        section: 'vsl',
        sectionLabel: 'System / VSL',
        label: 'Section Description',
        description: 'Context text describing the 90-second video framework.',
        textPath: 'vsl.description',
        multiline: true,
        visibilityPath: 'vsl.showDescription',
        placeholder:
          'A transparent breakdown of how we turn raw, unedited footage into high-retention video assets.',
      },
      {
        id: 'vsl-fallback',
        section: 'vsl',
        sectionLabel: 'System / VSL',
        label: 'Video Unavailable Message',
        description: 'Fallback text displayed if a video fails to stream.',
        textPath: 'vsl.fallbackMessage',
        placeholder: 'VIDEO UNAVAILABLE',
      },

      // 4. Portfolio / Selected Work
      {
        id: 'portfolio-badge',
        section: 'portfolio',
        sectionLabel: 'Portfolio',
        label: 'Portfolio Eyebrow Badge',
        description: 'Badge tag above selected work.',
        textPath: 'portfolio.badge',
        visibilityPath: 'portfolio.showBadge',
        placeholder: 'SELECTED WORK',
      },
      {
        id: 'portfolio-heading',
        section: 'portfolio',
        sectionLabel: 'Portfolio',
        label: 'Portfolio Section Heading',
        description: 'Large display title for the portfolio grid.',
        textPath: 'sectionHeadings.portfolioHeading',
        placeholder: 'SELECTED WORK',
      },
      {
        id: 'portfolio-subheading',
        section: 'portfolio',
        sectionLabel: 'Portfolio',
        label: 'Portfolio Subheading',
        description: 'Supporting description below the portfolio title.',
        textPath: 'sectionHeadings.portfolioSubheading',
        multiline: true,
        placeholder:
          'A curated selection of high-retention edits crafted for creators, brands, and media teams.',
      },
      {
        id: 'portfolio-view-text',
        section: 'portfolio',
        sectionLabel: 'Portfolio',
        label: 'Project Card View Button',
        description: 'Text shown on hover or action button for individual project cards.',
        textPath: 'portfolio.viewProjectText',
        placeholder: 'WATCH EDIT',
      },
      {
        id: 'portfolio-filter-all',
        section: 'portfolio',
        sectionLabel: 'Portfolio',
        label: 'Filter Button: "All"',
        description: 'Text for the default filter tab.',
        textPath: 'portfolio.filterAllLabel',
        placeholder: 'All Projects',
      },

      // 5. Process / About (Raw to Ready)
      {
        id: 'process-badge',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Process Eyebrow Badge',
        description: 'Top badge for the transformation pipeline.',
        textPath: 'rawToReady.badge',
        visibilityPath: 'rawToReady.showBadge',
        placeholder: 'THE TRANSFORMATION',
      },
      {
        id: 'process-core-step',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Core Step Badge',
        description: 'Badge highlighted on the middle editing stage.',
        textPath: 'rawToReady.coreStepBadge',
        placeholder: 'CORE STEP',
      },
      {
        id: 'process-heading',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Process Section Heading',
        description: 'Main heading for the three-stage workflow.',
        textPath: 'rawToReady.heading',
        placeholder: 'RAW → EDIT → READY',
      },
      {
        id: 'process-subheading',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Process Subheading',
        description: 'Supporting text for the workflow section.',
        textPath: 'rawToReady.subheading',
        multiline: true,
        visibilityPath: 'rawToReady.showSubheading',
        placeholder:
          'From raw unorganized recordings to polished, hook-optimized final deliverables ready to publish.',
      },
      {
        id: 'process-step-1-title',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 1 Title: Raw Footage',
        description: 'Heading for initial ingestion step.',
        textPath: 'rawToReady.steps.0.title',
        placeholder: '01. RAW FOOTAGE',
      },
      {
        id: 'process-step-1-desc',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 1 Description',
        description: 'Details for step 1.',
        textPath: 'rawToReady.steps.0.description',
        multiline: true,
        placeholder: 'Upload rough footage, zoom calls, screen recordings, or camera cards via cloud drive.',
      },
      {
        id: 'process-step-2-title',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 2 Title: The Edit',
        description: 'Heading for editing and pacing step.',
        textPath: 'rawToReady.steps.1.title',
        placeholder: '02. THE EDIT',
      },
      {
        id: 'process-step-2-desc',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 2 Description',
        description: 'Details for step 2.',
        textPath: 'rawToReady.steps.1.description',
        multiline: true,
        placeholder:
          'Storyboarding, hook optimization, dynamic sound design, sound fx, motion typography, and pacing.',
      },
      {
        id: 'process-step-3-title',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 3 Title: Ready to Post',
        description: 'Heading for final delivery step.',
        textPath: 'rawToReady.steps.2.title',
        placeholder: '03. READY TO POST',
      },
      {
        id: 'process-step-3-desc',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Step 3 Description',
        description: 'Details for step 3.',
        textPath: 'rawToReady.steps.2.description',
        multiline: true,
        placeholder: 'Final 4K / 1080p color-graded exports formatted perfectly for Reels, Shorts, and YouTube.',
      },
      {
        id: 'process-cta-btn',
        section: 'process',
        sectionLabel: 'Process (Raw → Ready)',
        label: 'Pipeline Action Button',
        description: 'Button below the three stages.',
        textPath: 'rawToReady.ctaText',
        visibilityPath: 'rawToReady.showCta',
        placeholder: 'SUBMIT YOUR FOOTAGE →',
      },

      // 6. Services
      {
        id: 'services-badge',
        section: 'services',
        sectionLabel: 'Services',
        label: 'Services Eyebrow Badge',
        description: 'Pill badge above services.',
        textPath: 'servicesContent.badge',
        visibilityPath: 'servicesContent.showBadge',
        placeholder: 'OUR CAPABILITIES',
      },
      {
        id: 'services-heading',
        section: 'services',
        sectionLabel: 'Services',
        label: 'Services Section Heading',
        description: 'Main services title.',
        textPath: 'sectionHeadings.servicesHeading',
        placeholder: 'WHAT WE BUILD',
      },
      {
        id: 'services-subheading',
        section: 'services',
        sectionLabel: 'Services',
        label: 'Services Subheading',
        description: 'Context description above the services cards.',
        textPath: 'sectionHeadings.servicesSubheading',
        multiline: true,
        placeholder: 'Tailored post-production pipelines designed to capture and hold modern viewer attention.',
      },

      // 7. FAQ Section
      {
        id: 'faq-badge',
        section: 'faq',
        sectionLabel: 'FAQ',
        label: 'FAQ Eyebrow Badge',
        description: 'Badge tag for the FAQ section.',
        textPath: 'faqSection.badge',
        placeholder: 'QUESTIONS & CLARITY',
      },
      {
        id: 'faq-heading',
        section: 'faq',
        sectionLabel: 'FAQ',
        label: 'FAQ Section Heading',
        description: 'Main heading for the FAQ accordion.',
        textPath: 'faqSection.heading',
        placeholder: 'FREQUENTLY ASKED QUESTIONS',
      },
      {
        id: 'faq-subheading',
        section: 'faq',
        sectionLabel: 'FAQ',
        label: 'FAQ Subheading',
        description: 'Supporting text below the FAQ title.',
        textPath: 'faqSection.subheading',
        multiline: true,
        placeholder:
          'Everything you need to know about our editing pipeline, raw footage workflow, and content partnerships.',
      },
      {
        id: 'faq-cta-btn',
        section: 'faq',
        sectionLabel: 'FAQ',
        label: 'Custom Question CTA Button',
        description: 'Call-to-action button displayed below FAQs.',
        textPath: 'faqSection.ctaText',
        visibilityPath: 'faqSection.ctaVisible',
        placeholder: 'HAVE A CUSTOM QUESTION? REACH OUT →',
      },

      // 8. Team & About
      {
        id: 'team-badge',
        section: 'team',
        sectionLabel: 'About & Team',
        label: 'About Eyebrow Badge',
        description: 'Top badge for the studio story and team.',
        textPath: 'aboutContent.badge',
        visibilityPath: 'aboutContent.showBadge',
        placeholder: 'THE CRAFT BEHIND FOOTAZIX',
      },
      {
        id: 'team-heading',
        section: 'team',
        sectionLabel: 'About & Team',
        label: 'Team Section Heading',
        description: 'Heading for the team section.',
        textPath: 'sectionHeadings.teamHeading',
        placeholder: 'THE EDITORS BEHIND THE SCREENS',
      },
      {
        id: 'team-copy',
        section: 'team',
        sectionLabel: 'About & Team',
        label: 'Studio Bio / Mission Copy',
        description: 'Paragraph describing the team ethos and standard.',
        textPath: 'sectionHeadings.teamCopy',
        multiline: true,
        placeholder:
          'Footazix was built on a simple conviction: raw footage contains authentic value, but only disciplined storytelling turns it into durable audience engagement.',
      },

      // 9. Final CTA
      {
        id: 'cta-badge',
        section: 'cta',
        sectionLabel: 'Final CTA',
        label: 'Final CTA Badge',
        description: 'Top eyebrow badge for final conversion banner.',
        textPath: 'finalCta.badge',
        visibilityPath: 'finalCta.showBadge',
        placeholder: 'READY TO LEVEL UP?',
      },
      {
        id: 'cta-headline',
        section: 'cta',
        sectionLabel: 'Final CTA',
        label: 'Final CTA Headline',
        description: 'Bold conversion headline at the bottom of the landing page.',
        textPath: 'sectionHeadings.finalCtaHeadline',
        placeholder: 'HAVE RAW FOOTAGE? LET’S TURN IT INTO CONTENT.',
      },
      {
        id: 'cta-supporting',
        section: 'cta',
        sectionLabel: 'Final CTA',
        label: 'Final CTA Supporting Text',
        description: 'Context text encouraging visitors to start a project.',
        textPath: 'sectionHeadings.finalCtaSupporting',
        multiline: true,
        placeholder:
          'Drop your details, tell us about your channel or brand, and let’s discuss building a dedicated pipeline.',
      },
      {
        id: 'cta-primary-btn',
        section: 'cta',
        sectionLabel: 'Final CTA',
        label: 'Primary CTA Button Label',
        description: 'Main button on the final conversion section.',
        textPath: 'finalCta.primaryCtaText',
        supportsLink: true,
        linkPath: 'finalCta.primaryCtaHref',
        newTabPath: 'finalCta.primaryCtaNewTab',
        placeholder: 'START A PROJECT NOW',
      },
      {
        id: 'cta-secondary-btn',
        section: 'cta',
        sectionLabel: 'Final CTA',
        label: 'Secondary CTA Button Label',
        description: 'Secondary button (e.g. Instagram or email direct).',
        textPath: 'finalCta.secondaryCtaText',
        visibilityPath: 'finalCta.showSecondaryCta',
        supportsLink: true,
        linkPath: 'finalCta.secondaryCtaHref',
        newTabPath: 'finalCta.secondaryCtaNewTab',
        placeholder: 'CONNECT ON INSTAGRAM →',
      },

      // 10. Footer Section
      {
        id: 'footer-tagline',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Brand Tagline / Supporting Line',
        description: 'Displayed under the brand logo in the footer grid.',
        textPath: 'footer.tagline',
        multiline: true,
        visibilityPath: 'footer.showDescription',
        placeholder: 'Turning raw footage into content worth watching.',
      },
      {
        id: 'footer-nav-title',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Navigation Column Title',
        description: 'Heading above footer navigation links.',
        textPath: 'footer.navSectionTitle',
        placeholder: 'Navigation',
      },
      {
        id: 'footer-social-title',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Social Column Title',
        description: 'Heading above footer social links.',
        textPath: 'footer.socialSectionTitle',
        placeholder: 'Connect',
      },
      {
        id: 'footer-instagram-label',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Instagram Link Label',
        description: 'Text for Instagram link in footer.',
        textPath: 'footer.instagramText',
        supportsLink: true,
        linkPath: 'brand.instagram',
        visibilityPath: 'footer.showInstagram',
        placeholder: 'Instagram',
      },
      {
        id: 'footer-contact-link',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Footer Contact Link',
        description: 'Clickable link opening the contact modal.',
        textPath: 'footer.contactText',
        visibilityPath: 'footer.showContact',
        placeholder: 'Contact',
      },
      {
        id: 'footer-cta-btn',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Footer CTA Button',
        description: 'Bottom call to action button.',
        textPath: 'footer.ctaText',
        visibilityPath: 'footer.showCta',
        placeholder: 'START A PROJECT →',
      },
      {
        id: 'footer-back-to-top',
        section: 'footer',
        sectionLabel: 'Footer',
        label: 'Back to Top Text',
        description: 'Smooth scroll-to-top button text in footer bar.',
        textPath: 'footer.backToTopText',
        visibilityPath: 'footer.showBackToTop',
        placeholder: 'Back to top',
      },

      // 11. Copyright & Developer Credit (EXACT USER REQUIREMENT)
      {
        id: 'copyright-text',
        section: 'copyright',
        sectionLabel: 'Copyright & Developer Credit',
        label: 'Copyright Notice',
        description: 'Base copyright statement (e.g. © Footazix).',
        textPath: 'footer.copyrightText',
        visibilityPath: 'footer.showCopyright',
        placeholder: '© Footazix',
      },
      {
        id: 'developer-attribution-prefix',
        section: 'copyright',
        sectionLabel: 'Copyright & Developer Credit',
        label: 'Developer Attribution Prefix',
        description: 'Prefix text before the developer name.',
        textPath: 'footer.developedByLabel',
        placeholder: 'Developed by',
      },
      {
        id: 'developer-name',
        section: 'copyright',
        sectionLabel: 'Copyright & Developer Credit',
        label: 'Developer Name',
        description: 'Clickable name credited in the footer bar.',
        textPath: 'footer.developerName',
        placeholder: 'Sanamatum Ningthoujam',
      },
      {
        id: 'developer-url',
        section: 'copyright',
        sectionLabel: 'Copyright & Developer Credit',
        label: 'Developer Hyperlink URL (Instagram)',
        description: 'Direct safe link opened when clicking developer name.',
        textPath: 'footer.developerUrl',
        supportsLink: true,
        linkPath: 'footer.developerUrl',
        newTabPath: 'footer.developerNewTab',
        visibilityPath: 'footer.showDeveloperCredit',
        placeholder: 'https://www.instagram.com/sanamatum_creates?stkn=MXVjbzVtamQwaGJveg==',
      },

      // 12. Legal Pages
      {
        id: 'legal-section-title',
        section: 'legal',
        sectionLabel: 'Legal Pages',
        label: 'Legal Section Heading',
        description: 'Footer heading above legal links.',
        textPath: 'footer.legalSectionTitle',
        visibilityPath: 'footer.showLegal',
        placeholder: 'Legal',
      },
      {
        id: 'legal-terms-label',
        section: 'legal',
        sectionLabel: 'Legal Pages',
        label: 'Terms & Conditions Link Label',
        description: 'Footer link label opening Terms & Conditions.',
        textPath: 'footer.termsLabel',
        placeholder: 'Terms & Conditions',
      },
      {
        id: 'legal-privacy-label',
        section: 'legal',
        sectionLabel: 'Legal Pages',
        label: 'Privacy Policy Link Label',
        description: 'Footer link label opening Privacy Policy.',
        textPath: 'footer.privacyLabel',
        placeholder: 'Privacy Policy',
      },
      {
        id: 'legal-terms-doc-title',
        section: 'legal',
        sectionLabel: 'Legal Pages',
        label: 'Terms Document Title',
        description: 'Title header on the Terms modal / page.',
        textPath: 'legal.terms.title',
        placeholder: 'Terms & Conditions',
      },
      {
        id: 'legal-privacy-doc-title',
        section: 'legal',
        sectionLabel: 'Legal Pages',
        label: 'Privacy Document Title',
        description: 'Title header on the Privacy modal / page.',
        textPath: 'legal.privacy.title',
        placeholder: 'Privacy Policy',
      },

      // 13. Contact Modal & Inquiry Form
      {
        id: 'modal-badge',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Modal Eyebrow Badge',
        description: 'Top badge on project inquiry popup modal.',
        textPath: 'contactModal.badge',
        placeholder: 'PROJECT INQUIRY',
      },
      {
        id: 'modal-title',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Modal Title',
        description: 'Main heading on the inquiry form modal.',
        textPath: 'contactModal.title',
        placeholder: 'START YOUR PROJECT WITH FOOTAZIX',
      },
      {
        id: 'modal-subtitle',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Modal Subtitle',
        description: 'Context line under the modal title.',
        textPath: 'contactModal.subtitle',
        multiline: true,
        placeholder: 'Tell us about your raw footage, timeline, and goals. We reply within 24 hours.',
      },
      {
        id: 'modal-submit-btn',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Submit Button Label',
        description: 'Button sending the inquiry to Supabase database.',
        textPath: 'contactModal.submitText',
        placeholder: 'SUBMIT PROJECT INQUIRY',
      },
      {
        id: 'modal-success-title',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Success Screen Title',
        description: 'Header displayed after successful submission.',
        textPath: 'contactModal.successTitle',
        placeholder: 'INQUIRY RECEIVED',
      },
      {
        id: 'modal-success-msg',
        section: 'contactModal',
        sectionLabel: 'Contact Modal',
        label: 'Success Screen Message',
        description: 'Confirmation message displayed to the prospective client.',
        textPath: 'contactModal.successMessage',
        multiline: true,
        placeholder: 'Thank you for reaching out. We will review your project details and follow up via email.',
      },
    ],
    []
  );

  // Filter elements by active section and search query
  const filteredElements = useMemo(() => {
    return textElements.filter((el) => {
      const matchesSection = activeSectionFilter === 'all' || el.section === activeSectionFilter;
      const textVal = String(getValue(el.textPath) || '');
      const linkVal = el.linkPath ? String(getValue(el.linkPath) || '') : '';
      const matchesQuery =
        !searchQuery ||
        el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.sectionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        textVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        linkVal.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesQuery;
    });
  }, [textElements, activeSectionFilter, searchQuery, formData]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const ok = await updateWebsiteContent(formData);
      if (ok) {
        setToastMessage({
          type: 'success',
          text: 'All website text edits published and synchronized to Supabase.',
        });
      } else {
        setToastMessage({
          type: 'error',
          text: 'Unable to publish text changes to Supabase.',
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: `Error saving: ${err?.message || 'Check database permissions.'}`,
      });
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReset = () => {
    setFormData(content);
    setToastMessage({ type: 'success', text: 'All unsaved changes reset.' });
    setTimeout(() => setToastMessage(null), 2500);
  };

  const sectionTabs: { id: TextSectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Website Text', icon: Globe2 },
    { id: 'header', label: 'Header & Nav', icon: PanelTop },
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'vsl', label: 'System (VSL)', icon: PlaySquare },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { id: 'process', label: 'Process / About', icon: Layers },
    { id: 'services', label: 'Services', icon: BriefcaseBusiness },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'team', label: 'Team', icon: UsersRound },
    { id: 'cta', label: 'Final CTA', icon: Flame },
    { id: 'footer', label: 'Footer', icon: PanelBottom },
    { id: 'copyright', label: 'Copyright & Credit', icon: Link },
    { id: 'legal', label: 'Legal Pages', icon: ShieldCheck },
    { id: 'contactModal', label: 'Contact Modal', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header Card with Quick Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10 sticky top-20 z-20 backdrop-blur-md bg-[#090910]/95 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Type className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Global Website Text Editor</span>
              {hasUnsavedChanges && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                  title="Unsaved changes pending"
                />
              )}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Edit all visible website text, section titles, buttons, descriptions, and hyperlinks with zero code changes. Supabase is the single source of truth.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 hover:border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={navigateToPublic}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 hover:border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving'}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(37,99,235,0.35)] cursor-pointer flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>PUBLISHING...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE & PUBLISH TO SUPABASE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              toastMessage.type === 'success'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar & Section Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090910] border border-white/10 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any text element by keyword, label, heading, or link URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder-zinc-500 focus:border-blue-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSectionFilter === tab.id;
            const count =
              tab.id === 'all'
                ? textElements.length
                : textElements.filter((el) => el.section === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSectionFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-[0_0_10px_rgba(37,99,235,0.15)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Elements Count and Live Summary Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
        <span>
          Showing {filteredElements.length} of {textElements.length} text elements
        </span>
        <span className="text-[11px] text-zinc-500">
          Changes synchronize directly to Supabase
        </span>
      </div>

      {/* Grid of Text Elements */}
      <div className="space-y-4">
        {filteredElements.map((el) => {
          const textValue = getValue(el.textPath) ?? '';
          const isVisible = el.visibilityPath ? getValue(el.visibilityPath) !== false : true;
          const linkValue = el.linkPath ? getValue(el.linkPath) ?? '' : undefined;
          const openInNewTab = el.newTabPath ? getValue(el.newTabPath) !== false : true;

          return (
            <div
              key={el.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                !isVisible
                  ? 'bg-[#090910]/60 border-white/5 opacity-75'
                  : 'bg-[#090910] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Element Header: Label, Section Badge & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 mb-3.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {el.label}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/20 text-blue-300 font-semibold">
                      {el.sectionLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{el.description}</p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {/* Visibility Toggle if supported */}
                  {el.visibilityPath && (
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => setValue(el.visibilityPath!, e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={isVisible ? 'text-zinc-200' : 'text-zinc-500'}>
                        {isVisible ? (
                          <span className="inline-flex items-center gap-1 text-blue-400">
                            <Eye className="w-3 h-3" />
                            <span>Visible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </span>
                        )}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Text Input / Textarea */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                    Text Content
                  </label>
                  {el.multiline ? (
                    <textarea
                      rows={3}
                      value={textValue}
                      onChange={(e) => setValue(el.textPath, e.target.value)}
                      placeholder={el.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 outline-none leading-relaxed transition-colors resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={textValue}
                      onChange={(e) => setValue(el.textPath, e.target.value)}
                      placeholder={el.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 outline-none font-medium transition-colors"
                    />
                  )}
                </div>

                {/* Optional Hyperlink & Open in New Tab Row */}
                {el.supportsLink && el.linkPath && (
                  <div className="p-3 rounded-xl bg-[#12121c] border border-white/5 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
                        <Link className="w-3 h-3" />
                        <span>Hyperlink URL</span>
                      </label>

                      {el.newTabPath && (
                        <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={openInNewTab}
                            onChange={(e) => setValue(el.newTabPath!, e.target.checked)}
                            className="w-3 h-3 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                          />
                          <span>Open link in new tab (target="_blank")</span>
                        </label>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={linkValue || ''}
                        onChange={(e) => setValue(el.linkPath!, e.target.value)}
                        placeholder="https://... or #section"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                      />
                      {linkValue && (
                        <a
                          href={linkValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                          title="Test Hyperlink"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Reminder when changes are active */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#090910] border border-blue-500/40 shadow-2xl backdrop-blur-md">
            <span className="text-xs text-blue-300 font-medium pl-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Unsaved text changes</span>
            </span>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)] cursor-pointer flex items-center gap-1.5"
            >
              {saveStatus === 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Publish Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
