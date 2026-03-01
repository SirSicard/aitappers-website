# AI Tappers Website Rebuild — Project Brief

## Overview
Complete rebuild of aitappers.com. Moving off WordPress to Next.js + Vercel. New positioning, new copy, new visual identity. The current site is outdated, generic, and doesn't reflect what AI Tappers actually does.

## Domain
aitappers.com (existing, will be pointed to Vercel)

## What AI Tappers Is
Governance-first AI capability partner. Helps orgs design, build, and operate AI inside real workflows.

**What it is NOT:**
- Not a SaaS platform
- Not a training business
- Not a body shop
- Not "AI Advantage" (completely separate company, do NOT reference or conflate)

**Operating principles:**
- Solve real operational problems
- Work inside client environments
- Design for ownership, governance, adoption
- Keep human judgment where it matters
- Scale deliberately

**Engagement model:**
1. **Discovery** (fixed-fee, time-bound) — use-case priorities, value/feasibility/risk signals, recommendation. No build commitment required.
2. **Build** (small, scoped units) — one problem, clear acceptance criteria, fits client systems and governance.

**Done means:** works with real data, real users use it, ownership is explicit, governance requirements met.

**Human in the loop** is a non-negotiable design constraint.

**Support tiers:**
- You own it (handover)
- We watch it (retainer)
- We're on the hook (SLA)

**Roles:**
- Marcus Cronan — client sponsor, commercial lead, governance
- Mattias Herzig — technical authority, delivery quality, architecture

**Real clients include:** global shipping companies (enterprise, GBP 30K+ engagements), beverage multinationals, digital agencies, medical practices, e-commerce brands.

## Site Structure (single page with anchor sections, expandable to multi-page later)

### 1. Hero
- Headline that communicates governance-first AI, not hype
- Subline: what they actually do in one sentence
- Primary CTA: Book a Discovery Call
- Secondary CTA: See How We Work
- Subtle animated background element (not flashy, think slow geometric movement or grain)

### 2. The Problem
- Most AI projects fail because of governance, adoption, and ownership gaps, not technology
- Shadow AI is everywhere (people screenshotting data into ChatGPT)
- Companies buy tools, not solutions
- Brief, punchy. 3-4 statements max.

### 3. How We Work
- Discovery → Build → Support model
- Visual timeline or stepped layout
- Each step: what it is, what you get, what it costs (structure, not prices)
- Emphasize: no build commitment from discovery. You get a recommendation regardless.

### 4. What Makes Us Different
- Governance-first (not move fast and break things)
- We work inside YOUR systems, not ours
- Human in the loop is non-negotiable
- Ownership is designed in from day one
- We build for adoption, not demos

### 5. Proof / Trust
- Client logos or industry sectors served (shipping, beverage, healthcare, e-commerce, agencies)
- Key metrics if available (anonymized)
- Testimonials (keep the good ones, reformat)

### 6. Team
- Marcus and Mattias with current photos
- Short, sharp bios aligned with their actual roles
- Marcus: commercial, strategic, client relationships, 25+ years digital media
- Mattias: technical authority, architecture, AI engineering, delivery quality
- LinkedIn links (CORRECT ones this time)

### 7. Contact / CTA
- "Start with Discovery" framing
- Contact form (name, email, company, message)
- Both email addresses
- No phone numbers on the public site (keep it professional, route through email)

## Visual Direction

**Vibe:** Dark, minimal, premium, confident. Think Linear.app, Vercel, Raycast. Not a marketing agency template. Not flashy. Quiet confidence.

**Color palette:**
- Primary background: near-black (hsl 220-240, low saturation, ~5-8% lightness)
- Text: off-white / light gray
- Accent: ONE color, used sparingly. Suggest cool blue or muted teal, NOT orange. Orange is the old brand.
- Secondary: subtle grays for cards, borders, muted text

**Typography:**
- Use defaults from TOOLS.md: Geist Sans (headings) + Inter (body) + Geist Mono (technical details if any)

**Imagery:**
- NO stock photos. Zero.
- Keep Marcus and Mattias headshots (extract from current site)
- Use abstract/geometric elements, subtle gradients, or grain textures for visual interest
- Icons: minimal line icons for the "How We Work" section, not illustrated

**Animation:**
- Subtle scroll reveals (fade up)
- Smooth section transitions
- Hero: subtle background animation (noise, slow particles, or geometric lines)
- Nothing that screams "look at my animations"
- Respect prefers-reduced-motion

## Technical Requirements
- Next.js 14+ App Router
- TypeScript
- Tailwind CSS + Shadcn/ui where applicable
- Geist + Inter fonts
- Framer Motion for scroll reveals and transitions
- SEO: full meta tags, Open Graph, JSON-LD (Organization, LocalBusiness)
- LLM-ready: semantic HTML, clean heading hierarchy, schema.org
- Dark mode default (light mode optional/later)
- Mobile-first responsive
- Contact form: can use Formspree, Resend, or Supabase for submissions
- Deploy to Vercel
- GitHub repo: SirSicard/aitappers-website

## Background & Animation Design

### Hero Background
- Dot grid or fine line grid across the full hero area
- Grid warps/distorts subtly on mouse movement (GPU-composited transforms only)
- Slow, ambient drift when no mouse interaction
- Color: very faint, barely visible against the dark background (5-8% opacity white or accent color)
- Communicates: systems thinking, architecture, precision

### Site-wide Texture
- Subtle noise/grain overlay across all dark sections (CSS or SVG filter, NOT an image)
- Adds depth and tactile feel to flat dark backgrounds
- Opacity: 3-5%, barely perceptible but makes the difference

### Scroll Animations
- All sections: fade-up reveal (40px travel, 500ms, ease-out-expo)
- Stagger between sibling elements: 60ms
- "How We Work" timeline: each step fades in sequentially, connecting line draws between steps as you scroll
- Team photos: scale-in from 0.95 to 1.0 on scroll enter
- Trust logos/sectors: fade in with stagger
- Trigger point: top 85% of viewport

### Micro-interactions
- CTA buttons: subtle glow/shimmer on hover (box-shadow transition, accent color at low opacity)
- Cards/sections: slight lift (translateY -2px) + faint border glow on hover
- Navigation links: smooth underline animation (scaleX from 0 to 1, transform-origin left)
- Section headings: very slight letter-spacing animation on scroll-enter (-0.02em to 0em)

### What NOT to Animate
- No parallax
- No 3D elements
- No text scramble or typewriter effects
- No horizontal scroll sections
- Nothing that moves fast
- Nothing that distracts from the content

### Performance
- All animations GPU-composited (transform, opacity only)
- Respect prefers-reduced-motion: disable all motion, show static state
- Hero grid: use Canvas or WebGL for the grid, NOT DOM elements
- Target 60fps on all animations

## Assets to Extract
- Marcus headshot from current site
- Mattias headshot from current site
- AI Tappers logo (or redesign if Forge has a better idea, keep it minimal)

## What NOT to Do
- Do NOT use em dashes or en dashes anywhere in copy
- Do NOT reference AI Advantage, AIA, or any community work
- Do NOT use stock photos
- Do NOT use orange as a brand color
- Do NOT use buzzwords like "revolutionize", "cutting-edge", "game-changing"
- Do NOT mention "200+ assistants, agents, automations" (old positioning)
- Do NOT use "SME" terminology (clients range from small to enterprise)
- Do NOT use "C.R.E.A.T.E. Framework"

## Copy Tone
- Direct, confident, no fluff
- Short sentences. No walls of text.
- Speak to decision-makers (CTOs, CDOs, ops directors, MDs)
- Show you've done this before without bragging
- Let the methodology speak for itself
