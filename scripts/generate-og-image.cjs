const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const iconPath = path.join(__dirname, '../public/assets/branding/footazix-icon-white.png');
  const iconBase64 = fs.readFileSync(iconPath).toString('base64');

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradients -->
    <radialGradient id="topAura" cx="50%" cy="22%" r="55%">
      <stop offset="0%" stop-color="#B1FF00" stop-opacity="0.16" />
      <stop offset="40%" stop-color="#121808" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#070809" stop-opacity="1" />
    </radialGradient>

    <radialGradient id="centerGlow" cx="50%" cy="38%" r="35%">
      <stop offset="0%" stop-color="#B1FF00" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#B1FF00" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#070809" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="cardStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B1FF00" stop-opacity="0.45" />
      <stop offset="30%" stop-color="#292E25" stop-opacity="0.8" />
      <stop offset="70%" stop-color="#171A1C" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#B1FF00" stop-opacity="0.3" />
    </linearGradient>

    <linearGradient id="limeText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B1FF00" />
      <stop offset="100%" stop-color="#C8FF4D" />
    </linearGradient>

    <linearGradient id="whiteText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
  </defs>

  <!-- Deep Obsidian Canvas (#070809) -->
  <rect width="1200" height="630" fill="#070809" />
  
  <!-- Atmospheric Neon Lime Aura -->
  <rect width="1200" height="630" fill="url(#topAura)" />
  <circle cx="600" cy="230" r="340" fill="url(#centerGlow)" />

  <!-- Subtle High-Tech Blueprint Grid -->
  <g opacity="0.08" stroke="#B1FF00" stroke-width="1">
    <line x1="120" y1="0" x2="120" y2="630" />
    <line x1="1080" y1="0" x2="1080" y2="630" />
    <line x1="0" y1="85" x2="1200" y2="85" />
    <line x1="0" y1="545" x2="1200" y2="545" />
  </g>

  <!-- Luxury Card Bezel -->
  <rect x="42" y="36" width="1116" height="558" rx="28" fill="none" stroke="url(#cardStroke)" stroke-width="1.5" />

  <!-- Technical Corner Brackets -->
  <path d="M 42 76 L 42 36 L 82 36" fill="none" stroke="#B1FF00" stroke-width="3" stroke-linecap="round" />
  <path d="M 1158 76 L 1158 36 L 1118 36" fill="none" stroke="#B1FF00" stroke-width="3" stroke-linecap="round" />
  <path d="M 42 554 L 42 594 L 82 594" fill="none" stroke="#B1FF00" stroke-width="3" stroke-linecap="round" />
  <path d="M 1158 554 L 1158 594 L 1118 594" fill="none" stroke="#B1FF00" stroke-width="3" stroke-linecap="round" />

  <!-- Top Badge: CONTENT GROWTH AGENCY -->
  <g transform="translate(600, 96)">
    <rect x="-175" y="-18" width="350" height="36" rx="18" fill="#0C1006" stroke="#B1FF00" stroke-opacity="0.45" stroke-width="1.2" />
    <circle cx="-145" cy="0" r="4.5" fill="#B1FF00" />
    <text x="-128" y="5" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#B1FF00" letter-spacing="3">CONTENT GROWTH AGENCY</text>
  </g>

  <!-- Official Brand Lockup: Official Logo Mark + FOOTAZIX Perfectly Centered -->
  <g transform="translate(575, 215)">
    <!-- Official High-Res Footazix White Ribbon Mark -->
    <image href="data:image/png;base64,${iconBase64}" x="-225" y="-55" width="76" height="110" />

    <!-- Official Typography -->
    <text x="-125" y="24" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="78" font-weight="bold" fill="#FFFFFF" letter-spacing="1">FOOTAZIX</text>
    
    <!-- Neon Lime Dot Accent -->
    <circle cx="282" cy="18" r="8" fill="#B1FF00" />
  </g>

  <!-- Agency Category Sub-title -->
  <g transform="translate(600, 292)">
    <text x="0" y="0" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#94A3B8" letter-spacing="4">HIGH-RETENTION VIDEO EDITING • CREATORS &amp; BRANDS</text>
  </g>

  <!-- Primary Headline -->
  <g transform="translate(600, 372)">
    <text x="0" y="0" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#F5F7F2" letter-spacing="1">
      TURN RAW FOOTAGE INTO
    </text>
    <text x="0" y="52" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" fill="url(#limeText)" letter-spacing="1.5">
      CONTENT WORTH WATCHING
    </text>
  </g>

  <!-- Feature Highlights Bar -->
  <g transform="translate(600, 514)">
    <!-- Feature 1 -->
    <g transform="translate(-310, 0)">
      <rect x="-105" y="-18" width="210" height="36" rx="10" fill="#0D0F10" stroke="#292E25" stroke-width="1.2" />
      <text x="0" y="5" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#E2E8F0">
        Short &amp; Long Form
      </text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(0, 0)">
      <rect x="-120" y="-18" width="240" height="36" rx="10" fill="#0D0F10" stroke="#292E25" stroke-width="1.2" />
      <text x="0" y="5" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#E2E8F0">
        Viral Scripting &amp; Hooks
      </text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(310, 0)">
      <rect x="-115" y="-18" width="230" height="36" rx="10" fill="#0D0F10" stroke="#292E25" stroke-width="1.2" />
      <text x="0" y="5" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#E2E8F0">
        Retention &amp; Growth
      </text>
    </g>
  </g>

  <!-- Domain Verified Footer -->
  <g transform="translate(1085, 574)">
    <circle cx="-62" cy="-4" r="3.5" fill="#B1FF00" />
    <text x="-50" y="0" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" letter-spacing="1">footazix.site</text>
  </g>
</svg>`;

  const outV2 = path.join(__dirname, '../public/assets/branding/footazix-og-preview-v2.png');
  const outDefault = path.join(__dirname, '../public/assets/branding/footazix-og-default.png');
  const out2026 = path.join(__dirname, '../public/assets/branding/footazix-og-2026.png');

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(outV2, pngBuffer);
  fs.writeFileSync(outDefault, pngBuffer);
  fs.writeFileSync(out2026, pngBuffer);

  console.log('Successfully generated OG preview images:');
  console.log('-', outV2);
  console.log('-', outDefault);
  console.log('-', out2026);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
