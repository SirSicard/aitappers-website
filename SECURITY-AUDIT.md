# Security Audit — AI Tappers Website

**Date:** 2026-03-01  
**Auditor:** Forge ⚒️  
**Scope:** Full codebase review of `aitappers-website` (Next.js 16.1.6, React 19)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MEDIUM | 4 |
| LOW | 3 |

---

## Findings

### 1. Missing Security Headers in next.config.ts

**Severity: HIGH** — **✅ FIXED**

`next.config.ts` is completely empty — no security headers configured at all. Missing:

- `X-Frame-Options` (clickjacking)
- `X-Content-Type-Options` (MIME sniffing)
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

**Remediation:**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### 2. No Rate Limiting on Contact Form

**Severity: HIGH** — **✅ FIXED**

The contact form submits directly to Formspree with no client-side or server-side rate limiting. An attacker could spam the endpoint with automated requests, exhausting Formspree quota and flooding the inbox.

**Remediation:**

Option A (recommended): Add a Next.js API route (`/api/contact`) that proxies to Formspree with rate limiting (e.g., `next-rate-limit` or simple in-memory/Redis counter). Also hides the Formspree endpoint from the client.

Option B (quick): Add a honeypot field + Formspree's built-in reCAPTCHA integration. Formspree does have some built-in spam protection, but relying solely on it is insufficient for targeted abuse.

---

### 3. No Server-Side Form Validation

**Severity: MEDIUM** — **✅ FIXED**

The form relies entirely on HTML5 `required` and `type="email"` attributes — client-side only. Since the form posts directly to Formspree (third-party), there's no server-side validation layer. Malformed or malicious data goes straight through.

**Impact:** Lower severity because Formspree handles input on their end and there's no database on our side, but it means no control over what data hits the inbox (e.g., extremely long messages, encoded payloads).

**Recommendation:** Wrap submission in a Next.js API route with validation (zod schema) before forwarding to Formspree.

---

### 4. Formspree Endpoint Exposed in Client Bundle

**Severity: MEDIUM** — **✅ FIXED**

The Formspree form ID (`xpwzgkla`) is hardcoded in the client component `contact.tsx`. Anyone can extract it and submit directly, bypassing the website entirely.

**Impact:** Enables spam without visiting the site. Not a secret leak per se (Formspree IDs are designed to be public), but it removes any control layer.

**Recommendation:** Proxy through a Next.js API route. The Formspree ID stays server-side, and you gain a choke point for validation/rate limiting.

---

### 5. No CSRF Protection on Contact Form

**Severity: MEDIUM** — **✅ FIXED (mitigated)**

The form submits client-side via `fetch()` to a third-party (Formspree), so traditional CSRF isn't directly exploitable against your server (you don't have one for this endpoint). However, there's no CSRF token or origin validation.

**Impact:** Low practical risk since Formspree handles its own CORS/origin checks. But if you move to a self-hosted API route, CSRF protection becomes mandatory.

**Recommendation:** When implementing the API route proxy (per findings #2/#3), add CSRF tokens (e.g., `csrf` package or Next.js middleware origin check).

---

### 6. JSON-LD Uses `dangerouslySetInnerHTML` with Static Data

**Severity: MEDIUM**

`layout.tsx` uses `dangerouslySetInnerHTML` for JSON-LD structured data. Currently safe because all data is hardcoded static strings — no user input flows into the JSON-LD.

**Impact:** No current risk. But if JSON-LD content ever becomes dynamic (e.g., from a CMS or URL params), this becomes an XSS vector.

**Recommendation:** No action needed now. Flag for future awareness: never interpolate user-controlled data into `dangerouslySetInnerHTML` blocks.

---

### 7. XSS Surface Analysis

**Severity: LOW**

The site has minimal XSS surface:
- No user-generated content is rendered
- No URL parameters are read or displayed
- Contact form values are sent via `FormData` to Formspree, never rendered back in the DOM
- No `dangerouslySetInnerHTML` with dynamic content
- The mailto fallback uses `encodeURIComponent()` correctly

**Status:** ✅ No XSS vulnerabilities found.

---

### 8. Open Redirect Analysis

**Severity: LOW**

- No `window.location` assignments from URL parameters
- The only `window.location.href` usage is the mailto fallback in `contact.tsx`, which constructs the URL from form field values (not URL params)
- All `<a href>` values are hardcoded strings or `#` anchors
- External link (LinkedIn) uses `rel="noopener noreferrer"` ✅

**Status:** ✅ No open redirect vulnerabilities.

---

### 9. Dependency Audit

**Severity: LOW**

```
npm audit: 0 vulnerabilities
```

Dependencies are minimal and current:
- `next@16.1.6`, `react@19.2.3`, `framer-motion@12.34.3`, `geist@1.7.0`, `clsx@2.1.1`
- No unnecessary packages

**Note:** `package.json` uses `^` (caret ranges) on several deps. Pin exact versions for supply chain safety:

```json
"clsx": "2.1.1",
"framer-motion": "12.34.3",
"geist": "1.7.0"
```

`next`, `react`, `react-dom` are already pinned. DevDependencies with `^` are lower risk but should ideally be pinned too.

---

### 10. Hardcoded Secrets / API Keys

**Status:** ✅ None found.

- No `.env` or `.env.local` files present
- No API keys, tokens, or passwords in source
- The Formspree ID is a public form endpoint, not a secret
- `.gitignore` correctly excludes `.env*` files

---

### 11. Image/Asset Security

**Status:** ✅ No issues.

- The site uses no external images or user-uploaded assets
- No `next/image` with remote patterns configured (none needed)
- SVG icons are inline, no external SVG loading

---

### 12. Environment Variable Exposure

**Status:** ✅ Clean.

- No `NEXT_PUBLIC_*` variables in use
- No `.env` files exist
- No `process.env` references in source code

---

### 13. Dependency Supply Chain

**Severity: LOW (advisory)**

- All deps are well-known, high-download packages
- No obscure or typo-squattable dependencies
- `package-lock.json` present ✅ (integrity hashes locked)
- Recommend: enable `npm audit` in CI, consider using `socket.dev` or similar for ongoing monitoring

---

## Priority Remediation Checklist

1. **[HIGH]** ✅ Add security headers to `next.config.ts` — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
2. **[HIGH]** ✅ Add rate limiting — `/api/contact` proxy with in-memory rate limiter (5 req/IP/hour)
3. **[MEDIUM]** ✅ Create `/api/contact` route to proxy Formspree, with server-side validation + Formspree endpoint hidden from client
4. **[MEDIUM]** ✅ Pin all dependency versions in `package.json`

---

*Audit complete. No critical vulnerabilities. Two high-priority items should be addressed before production launch.*
