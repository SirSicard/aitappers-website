# AI Tappers Website

Governance-first AI capability partner. Built with Next.js 16, TypeScript, Tailwind CSS, Framer Motion.

## Live

- Preview: https://aitappers-website.vercel.app
- Production: https://www.aitappers.com (once DNS pointed)

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Geist + Inter fonts

## Run locally

```bash
npm install
npm run dev
```

## Structure

Single-page site with anchor sections:
- Hero (canvas dot grid with mouse interaction)
- The Problem
- How We Work (Discovery / Build / Support)
- What Makes Us Different
- Trust / Testimonials
- Team
- Contact (Formspree integration)

## Env vars

- `NEXT_PUBLIC_FORMSPREE_ID` (optional, currently hardcoded as `xpwzgkla`)

## Deploy

Connected to Vercel via GitHub. Push to `master` to deploy.

## DNS

Point `aitappers.com` and `www.aitappers.com` to Vercel:
- CNAME `www` -> `cname.vercel-dns.com`
- A record `@` -> `76.76.21.21`

## TODO

- [ ] Set up real Formspree endpoint or switch to Resend
- [ ] Add favicon / OG image
- [ ] Connect custom domain in Vercel dashboard
- [ ] Light mode toggle (optional)
