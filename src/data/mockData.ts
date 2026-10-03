/**
 * FOOTAZIX — Initial Mock Dataset
 * 
 * Production-ready mock data that serves as the default state.
 * All data conforms strictly to the Footazix brand guidelines.
 */

import {
  WebsiteContent,
  Project,
  Service,
  TeamMember,
  Inquiry,
  MediaAsset,
} from '../types';

export const INITIAL_WEBSITE_CONTENT: WebsiteContent = {
  brand: {
    name: 'FOOTAZIX',
    domain: 'footazix.site',
    url: 'https://footazix.site',
    instagram: 'https://www.instagram.com/footazix',
    instagramHandle: '@footazix',
    showInstagramButton: true,
    email: 'footazix@gmail.com',
    tagline: 'Turning Raw Footage Into Content Worth Watching.',
    supportingLine: 'Video Editing • Content • Growth',
    accentColor: '#2563eb', // Core Electric Cobalt Blue
  },
  brandingAssets: {
    headerLogo: {
      url: '/assets/logo/footazix-logo.png',
      alt: 'Footazix Creative Agency',
      desktopWidth: 155,
      mobileWidth: 125,
      visible: true,
    },
    favicon: {
      url: '/favicon.svg',
      appleTouchIconUrl: '/apple-touch-icon.png',
      visible: true,
    },
    footerLogo: {
      useHeaderLogo: true,
      url: '/assets/logo/footazix-logo.png',
      desktopWidth: 145,
      visible: true,
    },
    ogImage: {
      url: '/assets/vsl/vsl-poster.jpg',
      alt: 'Footazix Content Growth Agency',
    },
  },
  header: {
    navWork: 'Work',
    navSystem: 'System',
    navServices: 'Services',
    navAbout: 'About',
    ctaText: 'Build with Footazix',
    showInstagram: true,
    showCta: true,
    showLogo: true,
    showWorkLink: true,
    showSystemLink: true,
    showServicesLink: true,
    showAboutLink: true,
    navItems: [
      { id: 'nav-work', label: 'Work', href: '#work', visible: true, order: 1 },
      { id: 'nav-system', label: 'System', href: '#system', visible: true, order: 2 },
      { id: 'nav-services', label: 'Services', href: '#services', visible: true, order: 3 },
      { id: 'nav-about', label: 'About', href: '#about', visible: true, order: 4 },
    ],
  },
  hero: {
    badgeText: 'FOOTAZIX / CONTENT GROWTH AGENCY',
    showBadge: true,
    eyebrow: '',
    headlineLine1: 'TURN RAW FOOTAGE INTO',
    headlineLine2: 'CONTENT WORTH WATCHING.',
    supportingLine: 'Video Editing • Content • Growth',
    showSupportingLine: true,
    description: 'We turn raw footage and ideas into content people want to watch. High-retention editing for creators, brands, and businesses.',
    showDescription: true,
    primaryCta: 'BUILD WITH FOOTAZIX →',
    showPrimaryCta: true,
    secondaryCta: 'EXPLORE THE FOOTAZIX SYSTEM ↓',
    showSecondaryCta: true,
    smallSupportingText: '',
  },
  vsl: {
    label: 'THE FOOTAZIX SYSTEM',
    showBadge: true,
    heading: 'SEE HOW FOOTAZIX TRANSFORMS CONTENT.',
    showHeading: true,
    description: 'See how we transform raw footage into content built for attention.',
    showDescription: true,
    videoSource: 'youtube',
    videoUrl: 'https://youtu.be/lqXIbp2SxdM?si=ZXwtfDQQY2CTLiZL',
    posterUrl: '/assets/vsl/vsl-poster.jpg',
    captionUrl: '',
    published: true,
    fallbackMessage: 'VIDEO UNAVAILABLE',
    ctaText: 'WATCH THE SYSTEM',
    showCta: false,
  },
  portfolio: {
    badge: 'PORTFOLIO',
    showBadge: true,
    heading: 'SELECTED WORK',
    subheading: 'Raw footage in. Content worth watching out.',
    showSubheading: true,
    categories: ['All', 'Reels', 'Shorts', 'YouTube', 'Brand'],
    showFilters: true,
    emptyTitle: 'No projects in this category',
    emptyDesc: 'Check other categories or explore all published work.',
    cardCtaText: 'INQUIRE ABOUT THIS STYLE',
  },
  rawToReady: {
    badge: 'THE TRANSFORMATION',
    showBadge: true,
    heading: 'RAW → EDIT → READY',
    subheading: 'A focused transformation pipeline designed to turn unedited footage into high-retention content.',
    showSubheading: true,
    coreStepBadge: 'CORE STEP',
    steps: [
      {
        num: '01',
        title: 'RAW FOOTAGE',
        desc: 'Uncut video, raw audio, and unpaced clips from your shoots.',
        badge: 'STAGE 01',
      },
      {
        num: '02',
        title: 'FOOTAZIX EDIT',
        desc: 'Hook construction, pacing, sound design, and color grading.',
        badge: 'CORE STEP',
      },
      {
        num: '03',
        title: 'READY TO PUBLISH',
        desc: 'Polished, platform-ready master content tuned for retention.',
        badge: 'DELIVERY',
      },
    ],
    ctaText: 'START YOUR PIPELINE',
    showCta: false,
  },
  servicesContent: {
    badge: 'SERVICES',
    showBadge: true,
    heading: 'WHAT WE DO',
    subheading: 'High-retention editing and content strategy built around growth.',
    showSubheading: true,
    highlightedBadge: 'MAIN SPECIALTY',
    showFeatureList: true,
    showCta: true,
    showNumbers: true,
  },
  aboutContent: {
    badge: 'TEAM & PHILOSOPHY',
    showBadge: true,
    heading: 'BUILT AROUND CONTENT.',
    subheading: 'Creators • Brands • Retention',
    copy: 'Footazix is a creator-focused content growth agency helping creators, brands and businesses turn raw footage into stronger content.',
    socialButtonText: 'Profile',
    emailButtonText: 'Email',
    emptyText: 'No team members published yet. Add team members in the Admin CMS.',
    showPhotos: true,
    showSocialLinks: true,
    showEmails: true,
  },
  sectionHeadings: {
    portfolioHeading: 'SELECTED WORK',
    portfolioSubheading: 'Raw footage in. Content worth watching out.',
    servicesHeading: 'WHAT WE DO',
    servicesSubheading: 'High-retention editing and content strategy built around growth.',
    teamHeading: 'BUILT AROUND CONTENT.',
    teamCopy: 'Footazix is a creator-focused content growth agency helping creators, brands and businesses turn raw footage into stronger content.',
    finalCtaHeadline: 'READY TO UPGRADE YOUR CONTENT?',
    finalCtaSupporting: "Send us your footage. We'll turn it into something worth watching.",
  },
  finalCta: {
    badge: "LET'S TALK",
    showBadge: true,
    heading: 'READY TO UPGRADE YOUR CONTENT?',
    supporting: "Send us your footage. We'll turn it into something worth watching.",
    showSupporting: true,
    primaryCta: 'BUILD WITH FOOTAZIX',
    showPrimaryCta: true,
    secondaryCta: 'INSTAGRAM',
    showSecondaryCta: true,
  },
  footer: {
    description: 'Turning raw footage into content worth watching.',
    showDescription: true,
    navSectionTitle: 'Navigation',
    navWork: 'Work',
    navSystem: 'System',
    navServices: 'Services',
    navAbout: 'About',
    contactText: 'Contact',
    socialSectionTitle: 'Connect',
    instagramText: 'Instagram',
    showInstagram: true,
    copyrightText: 'Footazix. footazix.site. All rights reserved.',
    showCopyright: true,
    legalSectionTitle: 'Legal',
    termsLabel: 'Terms & Conditions',
    privacyLabel: 'Privacy Policy',
    showLegal: true,
    backToTopText: 'Back to top',
    showBackToTop: true,
    tagline: 'Turning raw footage into content worth watching.',
  },
  sectionVisibility: {
    header: true,
    hero: true,
    system: true,
    portfolio: true,
    process: true,
    services: true,
    about: true,
    team: true,
    finalCta: true,
    footer: true,
    instagram: true,
    startProjectModal: true,
  },
  sectionOrder: ['hero', 'system', 'portfolio', 'process', 'services', 'about', 'finalCta'],
  seo: {
    siteTitle: 'Footazix – Content Growth Agency | High-Retention Video Editing',
    metaDescription: 'Turning raw footage into content worth watching. High-retention video editing and creative growth for modern creators, brands, and businesses.',
    ogTitle: 'Footazix – High-Retention Video Editing & Growth Agency',
    ogDescription: 'We turn raw footage and ideas into content people want to watch. Creators • Brands • Retention.',
    ogImage: '/assets/vsl/vsl-poster.jpg',
    canonicalUrl: 'https://footazix.site',
    keywords: 'video editing, high-retention editing, content agency, reels, shorts, youtube editing, footazix',
  },
  contactModal: {
    badge: 'START A PROJECT',
    title: 'BUILD WITH FOOTAZIX',
    subtitle: 'Tell us about your content, and our team will connect with you.',
    nameLabel: 'Name',
    emailLabel: 'Email',
    phoneLabel: 'Phone / WhatsApp',
    companyLabel: 'Brand / Channel / Company',
    servicesLabel: 'Services Needed',
    detailsLabel: 'Project Details / Footage Link',
    budgetLabel: 'Estimated Monthly Budget / Scope',
    submitText: 'SUBMIT PROJECT INQUIRY',
    successTitle: 'REQUEST RECEIVED.',
    successMessage: 'Thank you. Our team will review your request and connect with you shortly.',
    doneButtonText: 'Done',
  },
  legal: {
    terms: {
      title: 'Terms & Conditions',
      lastUpdated: 'October 2026',
      content: `1. Scope & Acceptance
Welcome to Footazix ("we", "our", or "us"). By engaging our content creation, editing, or consulting services, accessing https://footazix.site, or submitting raw footage, you agree to be bound by these Terms & Conditions.

2. Intellectual Property & Footage Rights
You retain 100% ownership and copyright of all raw footage, voiceover recordings, audio files, and brand materials supplied to Footazix. Upon final settlement of project retainers or service invoices, you receive full commercial rights to publish and monetize the edited deliverables across all global platforms.

3. Turnaround Times & Revisions
Standard editing deliverables follow the turnaround schedules agreed upon during project onboarding. Revisions must align with the original creative brief. We prioritize high-retention storytelling, kinetic hooks, and platform-native formats.

4. Client Responsibilities
You are solely responsible for ensuring you have full legal rights, music clearances, or permissions for all third-party media and footage provided to Footazix.

5. Confidentiality & Security
Footazix treats all unreleased footage, creator scripts, and business data with strict confidentiality. Projects are processed in secure environments and are never publicly shared or displayed in our portfolio without client consent.

6. Termination & Contact
Retainers may be adjusted or paused with written notice according to the specific service agreement. For inquiries or questions regarding these terms, reach our studio at footazix@gmail.com.`,
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'October 2026',
      content: `1. Information We Collect
Footazix collects client contact information (name, email address, phone/WhatsApp number, handle/company name) and project specifications solely when voluntarily submitted through our inquiry forms or direct communication.

2. How We Use Information
We utilize client information exclusively for:
- Reviewing video footage requirements and delivering project scopes
- Communicating regarding edits, revisions, and production status
- Invoicing and client relationship management

3. Protection of Raw Media Assets
All raw video footage, audio tracks, and assets uploaded to Footazix are stored within encrypted, access-restricted studio storage. We do not distribute, sell, or license raw footage to third parties under any circumstances.

4. Cookies & Analytics
Our website uses minimal, non-invasive cookies necessary for session state, navigation performance, and security. We do not engage in invasive behavioral tracking or third-party ad retargeting.

5. Data Retention & Deletion
Clients may request the permanent deletion of their contact records or archived project files at any time by contacting footazix@gmail.com.`,
    },
  },
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    title: 'Creator Short-Form Retention Reel',
    category: 'Reels',
    description: 'High-energy vertical pacing with kinetic framing, visual resets, and immersive sound design.',
    coverImage: '/assets/portfolio/project-01/cover.jpg',
    videoUrl: '',
    client: 'Creator Partner',
    displayOrder: 1,
    status: 'published',
    createdAt: '2026-09-15',
  },
  {
    id: 'proj-02',
    title: 'Cinematic Brand Campaign Still & Cut',
    category: 'Brand',
    description: 'Clean modern commercial aesthetic with precision timing and bespoke soundscape.',
    coverImage: '/assets/vsl/vsl-poster.jpg',
    videoUrl: '',
    client: 'Studio Client',
    displayOrder: 2,
    status: 'published',
    createdAt: '2026-09-18',
  },
  {
    id: 'proj-03',
    title: 'Founder Deep-Dive & YouTube Format',
    category: 'YouTube',
    description: 'Structured episodic story arc built with narrative pacing, visual cutaways, and seamless flow.',
    coverImage: '/assets/portfolio/project-01/cover.jpg',
    videoUrl: '',
    client: 'Founder Series',
    displayOrder: 3,
    status: 'published',
    createdAt: '2026-09-22',
  },
  {
    id: 'proj-04',
    title: 'High-Impact Social Video Teaser',
    category: 'Shorts',
    description: 'Rapid-tempo teaser engineered to command attention and stop scrolling in the first frame.',
    coverImage: '/assets/vsl/vsl-poster.jpg',
    videoUrl: '',
    client: 'Media Brand',
    displayOrder: 4,
    status: 'published',
    createdAt: '2026-09-25',
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-01',
    number: '01',
    title: 'VIDEO EDITING',
    description: 'Reels, Shorts, YouTube and social content engineered for viewer retention and visual clarity.',
    features: [
      'Pacing & hook design',
      'Dynamic typography & visual resets',
      'Atmospheric sound design',
      'Color grading & master export',
    ],
    ctaText: 'START EDITING PROJECT',
    highlighted: true,
    visible: true,
    order: 1,
  },
  {
    id: 'srv-02',
    number: '02',
    title: 'CONTENT',
    description: 'Hooks, scripts, ideas and storytelling frameworks to make every recording session count.',
    features: [
      'Hook testing & ideation',
      'Script structure & retention flow',
      'Content angle development',
      'Trend adaptation for brands',
    ],
    ctaText: 'DEVELOP CONTENT',
    highlighted: false,
    visible: true,
    order: 2,
  },
  {
    id: 'srv-03',
    number: '03',
    title: 'GROWTH',
    description: 'Content strategy, platform optimization and creative direction for creators and brands.',
    features: [
      'Publishing cadences & packaging',
      'Thumbnail & title alignment',
      'Performance review & iteration',
      'Audience retention analysis',
    ],
    ctaText: 'DISCUSS STRATEGY',
    highlighted: false,
    visible: true,
    order: 3,
  },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-01',
    name: 'Sanamatum',
    role: 'Founder & Creative Lead',
    description: 'Video editor, content strategist, and creative lead. Turning unedited footage into high-retention video systems.',
    photo: '/assets/founder.jpg',
    socialLink: 'https://www.instagram.com/footazix',
    email: 'footazix@gmail.com',
    displayOrder: 1,
    visible: true,
  },
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-01',
    name: 'Alex Rivera',
    email: 'alex.rivera@creatorstudio.io',
    phone: '+1 (555) 234-5678',
    company: 'Rivera Media',
    services: ['Video Editing', 'Reels / Shorts'],
    details: 'Need 12 high-retention vertical reels per month from our raw podcast recordings. Looking for hook testing and kinetic subtitles.',
    budget: 'Standard monthly production',
    status: 'new',
    createdAt: '2026-09-28',
    notes: 'Requested sample retention hook turnaround.',
  },
  {
    id: 'inq-02',
    name: 'Elena Rostova',
    email: 'elena@modernbrand.co',
    phone: '+44 20 7946 0912',
    company: 'Vanguard Fitness',
    services: ['Content & Scripting', 'YouTube Editing'],
    details: 'Launching an educational YouTube series with weekly episodic drops. Raw 4K footage delivered via cloud drive.',
    budget: 'High-volume / Priority growth retainer',
    status: 'contacted',
    createdAt: '2026-09-26',
    notes: 'Sent pricing deck and onboarding link.',
  },
];

export const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'med-01',
    name: 'footazix-logo.png',
    url: '/assets/logo/footazix-logo.png',
    category: 'logos',
    type: 'logo',
    size: '180 KB',
    uploadedAt: '2026-10-01',
  },
  {
    id: 'med-02',
    name: 'vsl-poster.jpg',
    url: '/assets/vsl/vsl-poster.jpg',
    category: 'posters',
    type: 'poster',
    size: '142 KB',
    uploadedAt: '2026-09-20',
  },
  {
    id: 'med-03',
    name: 'founder.jpg',
    url: '/assets/founder.jpg',
    category: 'images',
    type: 'image',
    size: '88 KB',
    uploadedAt: '2026-09-18',
  },
];
