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
    email: 'footazix@gmail.com',
    tagline: 'Turning Raw Footage Into Content Worth Watching.',
    supportingLine: 'Video Editing • Content • Growth',
    accentColor: '#2563eb', // Core Electric Cobalt Blue
  },
  hero: {
    badgeText: 'FOOTAZIX / CONTENT GROWTH AGENCY',
    headlineLine1: 'TURN RAW FOOTAGE INTO',
    headlineLine2: 'CONTENT WORTH WATCHING.',
    supportingLine: 'Video Editing • Content • Growth',
    description: 'We turn raw footage and ideas into content people want to watch.',
    primaryCta: 'WORK WITH FOOTAZIX →',
    secondaryCta: 'WATCH THE VSL ↓',
  },
  vsl: {
    label: 'FROM THE FOUNDER',
    heading: 'SEE HOW FOOTAZIX WORKS.',
    description: 'Who we are, what we do, and how we turn raw footage into better content.',
    videoSource: 'direct',
    videoUrl: '/assets/vsl/footazix-vsl.mp4',
    posterUrl: '/assets/vsl/vsl-poster.jpg',
    captionUrl: '', // empty by default = no CC button (per prompt rule)
    published: true,
  },
  rawToReady: {
    heading: 'RAW → EDIT → READY',
    subheading: 'A focused transformation pipeline designed to turn unedited footage into high-retention content.',
    steps: [
      {
        num: '01',
        title: 'RAW FOOTAGE',
        desc: 'Uncut video, raw audio, and unpaced clips from your shoots.',
      },
      {
        num: '02',
        title: 'FOOTAZIX EDIT',
        desc: 'Hook construction, pacing, sound design, and color grading.',
      },
      {
        num: '03',
        title: 'READY TO PUBLISH',
        desc: 'Polished, platform-ready master content tuned for retention.',
      },
    ],
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
  footer: {
    copyrightText: 'Footazix. footazix.site. All rights reserved.',
    tagline: 'Turning raw footage into content worth watching.',
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
    highlighted: true, // Visually dominant
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
    ctaText: 'PLAN STRATEGY',
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
    description: 'Leading creative direction, visual pacing, and editing architecture across all client productions.',
    photo: '/assets/founder.jpg',
    socialLink: 'https://www.instagram.com/footazix',
    email: 'footazix@gmail.com',
    displayOrder: 1,
    visible: true,
  },
  {
    id: 'team-02',
    name: 'Footazix Editorial Crew',
    role: 'Senior Video Editors & Motion',
    description: 'Dedicated post-production team focused on high-retention cuts, sound design, and color finishing.',
    photo: '/assets/portfolio/project-01/cover.jpg',
    socialLink: 'https://footazix.site',
    email: 'footazix@gmail.com',
    displayOrder: 2,
    visible: true,
  },
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-101',
    name: 'Sanamatum',
    email: 'creator@example.com',
    phone: '+1 555-0192',
    company: 'Creator Studio',
    services: ['Video Editing', 'Reels / Shorts'],
    details: 'Looking for weekly editing of 5 high-energy retention Reels from raw talking head footage.',
    budget: 'Standard monthly retainer',
    status: 'new',
    createdAt: '2026-09-30 11:20',
    notes: 'High priority creator request',
  },
  {
    id: 'inq-102',
    name: 'Alex Rivera',
    email: 'alex@brandcollective.co',
    phone: '',
    company: 'Brand Collective',
    services: ['YouTube Editing', 'Content & Scripting'],
    details: 'Need 2 episodic YouTube video edits per month with custom motion graphics and B-roll pacing.',
    budget: 'Premium production',
    status: 'contacted',
    createdAt: '2026-09-29 16:45',
  },
  {
    id: 'inq-103',
    name: 'Jordan Hayes',
    email: 'jordan@vlogdaily.com',
    company: 'Daily Creator',
    services: ['Video Editing'],
    details: 'Short-form cuts from Twitch/YouTube live streams into TikToks and Shorts.',
    budget: 'Exploring options',
    status: 'completed',
    createdAt: '2026-09-27 09:15',
  },
];

export const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'media-01',
    name: 'vsl-poster.jpg',
    url: '/assets/vsl/vsl-poster.jpg',
    category: 'posters',
    size: '142 KB',
    dimensions: '1920x1080',
    uploadedAt: '2026-09-20',
  },
  {
    id: 'media-02',
    name: 'founder.jpg',
    url: '/assets/founder.jpg',
    category: 'images',
    size: '611 KB',
    dimensions: '1200x1200',
    uploadedAt: '2026-09-22',
  },
  {
    id: 'media-03',
    name: 'portfolio-reel-01.jpg',
    url: '/assets/portfolio/project-01/cover.jpg',
    category: 'images',
    size: '228 KB',
    dimensions: '1080x1920',
    uploadedAt: '2026-09-24',
  },
];
