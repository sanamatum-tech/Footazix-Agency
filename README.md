# FOOTAZIX — Content Growth & Video Editing Agency

> **"Turning Raw Footage Into Content Worth Watching."**

Production-ready, frontend-focused website for **FOOTAZIX** (Domain: [footazix.site](https://footazix.site), Instagram: [@footazix](https://www.instagram.com/footazix)).

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and Three.js.

---

## 💎 Design System & Palette

- **Strict Color Language**: Black (`#050508`), White / Off-White (`#F4F4F6`), and Cobalt Electric Blue (`#2563EB`).
- **Typography**: Clean, premium modern sans-serif (**Manrope** ExtraBold/Bold for headings, Medium for subheadings, Regular for body text).
- **Interactive 3D**: Custom Three.js abstract titanium sculpture with dynamic cursor tracking, subtle blue lighting, and automatic fallback for mobile/reduced motion.
- **Zero-Pill Discipline**: Clean unboxed metadata with typographic separators (`·`).

---

## 🚀 How to Customize

All site copy, links, services, portfolio items, and media paths are centralized in:
📂 `src/config/siteContent.ts`

### 1. Founder VSL Video & Poster
- **Video**: Drop your 60–90 second `.mp4` into:
  `/public/assets/vsl/footazix-vsl.mp4`
- **Poster Image**: Drop your high-resolution poster frame into:
  `/public/assets/vsl/vsl-poster.jpg`
- *Note:* The video player includes interactive playback controls, captions support, scrub bar, and fullscreen.

### 2. Portfolio Projects
Add or replace media inside:
- `/public/assets/portfolio/project-01/`
- `/public/assets/portfolio/project-02/`
- `/public/assets/portfolio/project-03/`
Then update title, duration, and tags in `src/config/siteContent.ts`.

### 3. Founder Details & Socials
Update `SITE_CONFIG.about.founder` and `SITE_CONFIG.brand`:
- Founder: Sanamatum (Founder & Creative Lead)
- Photo: `/public/assets/founder.jpg`
- Email: `footazix@gmail.com`
- Instagram: `https://www.instagram.com/footazix`

### 4. Contact Inquiries
The contact form creates formatted `mailto:` links with URI encoding, supports one-click clipboard copying with instant toast feedback, and direct links to Instagram DM and email.

---

## 🛠 Export to GitHub & Deploy

1. Initialize Git and commit:
```bash
git init
git add .
git commit -m "Initial Footazix agency release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/footazix.git
git push -u origin main
```

2. Build for production:
```bash
npm run build
```
The output will be in `/dist`, ready to deploy to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
