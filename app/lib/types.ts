export type Severity = "critical" | "warning" | "info";

export interface Finding {
  severity: Severity;
  message: string;
}

export type CardState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: T }
  | { status: "error"; error: string }
  | { status: "skipped"; note: string };

export function dataOf<T>(state: CardState<T>): T | undefined {
  return state.status === "done" ? state.data : undefined;
}

export interface DnsResult {
  domain: string;
  // Record types plus a "failed" list of types whose lookup did not complete
  records: Record<string, string[]>;
  findings: Finding[];
}

export interface WhoisResult {
  domain: string;
  registrar: string | null;
  creation_date: string | null;
  expiration_date: string | null;
  domain_age_days: number | null;
  findings: Finding[];
}

export interface SubdomainResult {
  domain: string;
  subdomains: string[];
  lookup_ok?: boolean;
  findings: Finding[];
}

export interface IpResult {
  ip: string;
  country: string | null;
  city: string | null;
  isp: string | null;
  abuse_confidence_score: number | null;
  total_reports: number | null;
  findings: Finding[];
}

export interface SslResult {
  domain: string;
  issuer: string | null;
  expiry_date: string | null;
  days_until_expiry: number | null;
  findings: Finding[];
}

export interface HeadersResult {
  headers_present: Record<string, string>;
  headers_missing: string[];
  score: string;
  findings: Finding[];
}

export interface EmailAuthResult {
  domain: string;
  spf_record: string | null;
  spf_status?: string;
  dmarc_record: string | null;
  dmarc_status?: string;
  dmarc_policy: string | null;
  findings: Finding[];
}

export interface UrlRepResult {
  url: string;
  status: string;
  malicious_count?: number;
  suspicious_count?: number;
  harmless_count?: number;
  undetected_count?: number;
  findings: Finding[];
}

export interface MitreTechnique {
  technique_id: string;
  technique_name: string;
  tactic: string;
  url: string;
  matched_finding: string;
}

export interface MitreResult {
  domain: string;
  mapped_techniques: MitreTechnique[];
}

export interface SummaryResult {
  domain: string;
  summary: string;
  findings_analyzed: number;
}