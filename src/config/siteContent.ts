/**
 * FOOTAZIX — CENTRAL CONFIGURATION FILE
 * 
 * Clean, modular configuration.
 * Designed for easy maintenance and future CMS/backend connection.
 */

export interface PortfolioProject {
  id: string;
  title: string;
  category: 'Reels' | 'Shorts' | 'YouTube' | 'Brand';
  description: string;
  coverImage: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  highlighted: boolean;
}

export const SITE_CONFIG = {
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
    primaryCta: 'WORK WITH FOOTAZIX →',
    secondaryCta: 'WATCH THE VSL ↓',
  },

  vsl: {
    label: 'FROM THE FOUNDER',
    heading: 'SEE HOW FOOTAZIX WORKS.',
    description: 'Who we are, what we do, and how we turn raw footage into better content.',
    videoSrc: '/assets/vsl/footazix-vsl.mp4',
    posterSrc: '/assets/vsl/vsl-poster.jpg',
    captions: [
      { start: 0, end: 4, text: "Hey, I'm Sanamatum, Founder of Footazix." },
      { start: 4, end: 10, text: "Most creators and brands have hours of raw footage, but lose attention in the first three seconds." },
      { start: 10, end: 17, text: "We don't just cut clips. We shape pacing, storytelling, and sound design to keep viewers watching." },
      { start: 17, end: 25, text: "From vertical Reels and Shorts to long-form YouTube, here's how we upgrade your content." }
    ],
  },

  portfolio: {
    heading: 'SELECTED WORK',
    subheading: 'Raw footage in. Content worth watching out.',
    projects: [
      {
        id: 'project-01',
        title: 'Creator Short-Form Retention Reel',
        category: 'Reels',
        description: 'High-energy vertical pacing with kinetic framing and immersive sound design.',
        coverImage: '/assets/portfolio/project-01/cover.jpg',
      },
      {
        id: 'project-02',
        title: 'Cinematic Brand Campaign Still & Cut',
        category: 'Brand',
        description: 'Clean modern commercial aesthetic with precision timing and bespoke soundscape.',
        coverImage: '/assets/vsl/vsl-poster.jpg',
      },
      {
        id: 'project-03',
        title: 'Founder Deep-Dive & YouTube Format',
        category: 'YouTube',
        description: 'Structured episodic story arc built with visual resets and tight pacing.',
        coverImage: '/assets/portfolio/project-01/cover.jpg',
      },
      {
        id: 'project-04',
        title: 'High-Impact Social Video Teaser',
        category: 'Shorts',
        description: 'Rapid-tempo teaser engineered to command attention in the first frame.',
        coverImage: '/assets/vsl/vsl-poster.jpg',
      }
    ] as PortfolioProject[],
  },

  rawToReady: {
    heading: 'RAW → EDIT → READY',
    subheading: 'A focused transformation pipeline designed to turn unedited footage into high-retention content.',
    steps: [
      {
        num: '01',
        title: 'RAW FOOTAGE',
        desc: 'Uncut video, raw audio, and unpaced clips.'
      },
      {
        num: '02',
        title: 'FOOTAZIX EDIT',
        desc: 'Hook construction, pacing, sound design, and color.'
      },
      {
        num: '03',
        title: 'READY TO PUBLISH',
        desc: 'Polished, platform-ready master content.'
      }
    ]
  },

  services: {
    heading: 'WHAT WE DO',
    items: [
      {
        id: 'video-editing',
        number: '01',
        title: 'VIDEO EDITING',
        description: 'Reels, Shorts, YouTube and social content.',
        highlighted: true, // Visually dominant
      },
      {
        id: 'content',
        number: '02',
        title: 'CONTENT',
        description: 'Hooks, scripts, ideas and storytelling.',
        highlighted: false,
      },
      {
        id: 'growth',
        number: '03',
        title: 'GROWTH',
        description: 'Content strategy, optimization and direction.',
        highlighted: false,
      }
    ] as ServiceItem[],
  },

  about: {
    heading: 'BUILT AROUND CONTENT.',
    copy: 'Footazix is a creator-focused content growth agency helping creators, brands and businesses turn raw footage into stronger content.',
    founder: {
      name: 'Sanamatum',
      role: 'Founder & Creative Lead',
      photo: '/assets/founder.jpg',
      instagram: 'https://www.instagram.com/footazix',
      instagramHandle: '@footazix',
      email: 'footazix@gmail.com',
    }
  },

  finalCta: {
    headline: 'READY TO UPGRADE YOUR CONTENT?',
    supporting: "Send us your footage. We'll turn it into something worth watching.",
    primaryCta: 'START A PROJECT →',
    secondaryCta: 'INSTAGRAM →'
  },

  contact: {
    heading: 'START A PROJECT',
    subheading: 'Tell us about your content, and we will get back to you quickly.',
    serviceOptions: [
      'Video Editing (Reels, Shorts, YouTube)',
      'Content (Hooks, Scripts, Ideas)',
      'Growth (Strategy & Direction)',
      'Full Agency Collaboration'
    ],
    budgetOptions: [
      'Flexible / Exploring options',
      'Under $1,000 / project',
      '$1,000 – $3,000 / month',
      '$3,000+ / retainer'
    ]
  }
};
