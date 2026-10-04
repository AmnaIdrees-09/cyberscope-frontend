// Locally this points at your FastAPI server. When you deploy, set
// NEXT_PUBLIC_API_BASE in the hosting dashboard instead of editing code.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://cyberscope-production.up.railway.app/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(90_000), // never hang forever
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // response had no JSON body; keep the generic message
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export function getJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function describeError(e: unknown): string {
  if (e instanceof DOMException && e.name === "TimeoutError") {
    return "This check took too long and was cancelled.";
  }
  if (e instanceof TypeError) {
    return "Cannot reach the CyberScope API. Is the backend running?";
  }
  return e instanceof Error ? e.message : "Request failed";
}

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const DOMAIN =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$/;

export type ValidInput =
  | { kind: "domain"; domain: string; url: string }
  | { kind: "ip"; ip: string; url: string | null };

export type ParsedInput = ValidInput | { kind: "invalid"; reason: string };

export function parseInput(raw: string): ParsedInput {
  const text = raw.trim();
  if (!text) {
    return { kind: "invalid", reason: "Enter a domain, IP address, or URL." };
  }

  let host = text;
  let url: string | null = null;

  if (/^https?:\/\//i.test(text)) {
    try {
      const parsed = new URL(text);
      host = parsed.hostname;
      url = parsed.toString();
    } catch {
      return { kind: "invalid", reason: "That URL doesn't look valid." };
    }
  }

  host = host.toLowerCase().replace(/\.$/, "");

  if (IPV4.test(host)) return { kind: "ip", ip: host, url };
  if (DOMAIN.test(host)) {
    return { kind: "domain", domain: host, url: url ?? `https://${host}` };
  }

  return {
    kind: "invalid",
    reason: "Enter a valid domain (example.com), an IPv4 address, or a full URL (https://...).",
  };
}