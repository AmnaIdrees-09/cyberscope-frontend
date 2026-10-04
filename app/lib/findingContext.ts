// Lightweight, client-side context that makes findings more actionable
// without needing any backend change. Matching is deliberately simple
// (keyword based) — good enough to add real value, not meant to be exhaustive.

interface ContextEntry {
  keywords: string[];
  why: string;
}

const CONTEXT: ContextEntry[] = [
  {
    keywords: ["spf"],
    why: "SPF tells receiving mail servers which servers are allowed to send email as this domain. Without it, it's easier for someone to send a convincing phishing email that appears to come from this domain.",
  },
  {
    keywords: ["dmarc"],
    why: "DMARC tells receiving mail servers what to do when a message fails SPF/DKIM checks. A missing or weak (p=none) policy means spoofed email is detected but not blocked.",
  },
  {
    keywords: ["content-security-policy"],
    why: "CSP restricts which scripts, styles, and resources a browser is allowed to load on the page. Without it, an attacker who finds an injection point has an easier time running malicious scripts in a visitor's browser.",
  },
  {
    keywords: ["strict-transport-security"],
    why: "HSTS tells browsers to always use HTTPS for this site, even if a visitor types http:// or clicks an old link. Without it, a visitor's first connection can be intercepted and silently downgraded to plain HTTP.",
  },
  {
    keywords: ["x-content-type-options"],
    why: "This stops the browser from guessing a file's type based on its content. Without it, a file meant to be downloaded could, in rare cases, be treated as something executable instead.",
  },
  {
    keywords: ["referrer-policy"],
    why: "Controls how much of the current page's URL gets sent to other sites when a visitor clicks a link. Without it, sensitive information in a URL could leak to a third party.",
  },
  {
    keywords: ["permissions-policy"],
    why: "Restricts which browser features (camera, microphone, location) a page — and anything embedded in it — is allowed to request. Without it, embedded third-party content has broader access than it may need.",
  },
  {
    keywords: ["expired"],
    why: "An expired certificate means encrypted connections to this site can no longer be verified as trustworthy. Browsers show a warning, and some visitors will leave rather than risk it.",
  },
  {
    keywords: ["expires in", "renewal is due"],
    why: "If a certificate isn't renewed before it expires, the site will start showing security warnings to every visitor with no notice beyond this kind of check.",
  },
  {
    keywords: ["registered", "days ago"],
    why: "Domains used for phishing or scams are frequently registered shortly before use and abandoned shortly after. A very new domain isn't proof of anything by itself, but it's a detail worth weighing alongside everything else found.",
  },
  {
    keywords: ["dev, staging, or admin"],
    why: "Non-production subdomains are often patched less often and monitored less closely than the main site, which makes them a common entry point in real attacks.",
  },
  {
    keywords: ["flagged", "malicious", "abuse"],
    why: "This reflects reports from independent security vendors or abuse databases, not a judgment made by this tool. A small number of flags out of many vendors is often a false positive; a large, consistent number is a stronger signal.",
  },
];

export function getWhyItMatters(message: string): string | null {
  const lower = message.toLowerCase();
  const match = CONTEXT.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  return match?.why ?? null;
}

// Large, well-known platforms commonly show a handful of warnings (missing
// headers, a stray VirusTotal flag, dozens of subdomains) simply because of
// their size and age — not because they're unusually risky. This is framing
// for the reader, not a correctness change to any individual check.
const BIG_PLATFORMS = [
  "google.com", "youtube.com", "gmail.com",
  "microsoft.com", "live.com", "outlook.com",
  "apple.com", "icloud.com",
  "amazon.com",
  "facebook.com", "instagram.com", "meta.com",
  "cloudflare.com", "github.com",
  "linkedin.com", "twitter.com", "x.com",
  "netflix.com", "yahoo.com",
];

export function isKnownBigPlatform(domain: string): boolean {
  const host = domain.toLowerCase().replace(/^www\./, "");
  return BIG_PLATFORMS.some((d) => host === d || host.endsWith(`.${d}`));
}