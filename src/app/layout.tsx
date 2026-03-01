import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Tappers | Governance-First AI Capability Partner",
  description:
    "AI Tappers helps organisations design, build, and operate AI inside real workflows. Governance-first. Human in the loop. Ownership by design.",
  metadataBase: new URL("https://www.aitappers.com"),
  openGraph: {
    title: "AI Tappers | Governance-First AI Capability Partner",
    description:
      "We help organisations design, build, and operate AI inside real workflows. Governance-first approach with human oversight built in.",
    url: "https://www.aitappers.com",
    siteName: "AI Tappers",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tappers | Governance-First AI Capability Partner",
    description:
      "We help organisations design, build, and operate AI inside real workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.aitappers.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable} dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI Tappers",
              url: "https://www.aitappers.com",
              description:
                "Governance-first AI capability partner. Helps organisations design, build, and operate AI inside real workflows.",
              founders: [
                {
                  "@type": "Person",
                  name: "Marcus Cronan",
                  jobTitle: "Commercial Lead & Governance",
                  url: "https://www.linkedin.com/in/marcuscronan888/",
                },
                {
                  "@type": "Person",
                  name: "Mattias Herzig",
                  jobTitle: "Technical Authority & Architecture",
                  url: "https://www.linkedin.com/in/mattiasherzig/",
                },
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "marcus@aitappers.io",
                contactType: "sales",
              },
              sameAs: [
                "https://www.linkedin.com/company/ai-tappers/",
              ],
              knowsAbout: [
                "Artificial Intelligence",
                "AI Governance",
                "Workflow Automation",
                "AI Integration",
                "Enterprise AI",
              ],
              areaServed: "Worldwide",
              serviceType: [
                "AI Discovery",
                "AI Build",
                "AI Support",
                "AI Governance Consulting",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AI Tappers",
              url: "https://www.aitappers.com",
              description:
                "AI capability partner specialising in governance-first AI implementation for organisations.",
              priceRange: "$$$$",
              areaServed: {
                "@type": "Place",
                name: "Worldwide",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "AI Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Discovery",
                      description:
                        "Fixed-fee, time-bound assessment of AI use-case priorities with value, feasibility, and risk signals.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Build",
                      description:
                        "Scoped AI solutions built inside your systems with clear acceptance criteria and governance compliance.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Support",
                      description:
                        "Ongoing AI support from full handover to managed SLA, designed for your ownership model.",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
