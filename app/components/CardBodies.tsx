import type { ReactNode } from "react";
import { theme } from "../lib/theme";
import type {
  DnsResult,
  EmailAuthResult,
  HeadersResult,
  IpResult,
  MitreResult,
  SslResult,
  SubdomainResult,
  SummaryResult,
  UrlRepResult,
  WhoisResult,
} from "../lib/types";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className={theme.label}>{label}</span>
      <span className={`${theme.text} text-right break-all`}>{children}</span>
    </div>
  );
}

const stripQuotes = (s: string) => s.replace(/^"|"$/g, "");

/* ---------- DNS ---------- */
const DNS_ORDER = ["A", "AAAA", "MX", "NS", "CNAME", "SOA", "TXT"];

export function DnsBody({ d }: { d: DnsResult }) {
  const failed = d.records["failed"] ?? [];

  return (
    <div className="max-h-56 overflow-y-auto pr-1 space-y-3">
      {DNS_ORDER.map((type) => {
        const values = d.records[type] ?? [];
        return (
          <div key={type}>
            <div className={theme.label}>{type}</div>
            {failed.includes(type) ? (
              <div className={theme.errorText}>lookup failed</div>
            ) : values.length === 0 ? (
              <div className={theme.muted}>none</div>
            ) : (
              values.map((v, i) => (
                <div key={i} className={`${theme.value} mt-0.5`}>
                  {type === "TXT" ? stripQuotes(v) : v}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- WHOIS ---------- */
const day = (s: string | null) => (s ? s.slice(0, 10) : "unknown");

export function WhoisBody({ d }: { d: WhoisResult }) {
  const age =
    d.domain_age_days != null
      ? `${d.domain_age_days.toLocaleString()} days (${(d.domain_age_days / 365).toFixed(1)} yrs)`
      : "unknown";

  return (
    <div>
      <Row label="Registrar">{d.registrar ?? "unknown"}</Row>
      <Row label="Created">{day(d.creation_date)}</Row>
      <Row label="Expires">{day(d.expiration_date)}</Row>
      <Row label="Age">{age}</Row>
    </div>
  );
}

/* ---------- Subdomains ---------- */
export function SubdomainBody({ d }: { d: SubdomainResult }) {
  const unavailable = d.lookup_ok === false;

  return (
    <div>
      <Row label="Found">{unavailable ? "unavailable" : d.subdomains.length}</Row>
      {unavailable ? (
        <p className={`${theme.muted} mt-1`}>
          crt.sh did not respond, so this list is unavailable. That does not mean there are none. Try again in a minute.
        </p>
      ) : d.subdomains.length === 0 ? (
        <p className={`${theme.muted} mt-1`}>No subdomains found in certificate transparency logs.</p>
      ) : (
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
          {d.subdomains.map((s) => (
            <div key={s} className={theme.value}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- IP ---------- */
export function IpBody({ d }: { d: IpResult }) {
  const score = d.abuse_confidence_score;
  const place = [d.city, d.country].filter(Boolean).join(", ");

  return (
    <div>
      <Row label="IP">{d.ip}</Row>
      <Row label="Location">{place || "unavailable"}</Row>
      <Row label="ISP">{d.isp ?? "unavailable"}</Row>
      <Row label="Abuse score">{score != null ? `${score}/100` : "unavailable"}</Row>
      {score != null && (
        <div className={`${theme.barTrack} mb-1`}>
          <div className={theme.barFill} style={{ width: `${Math.min(100, score)}%` }} />
        </div>
      )}
      <Row label="Reports">{d.total_reports ?? "unavailable"}</Row>
    </div>
  );
}

/* ---------- SSL ---------- */
export function SslBody({ d }: { d: SslResult }) {
  return (
    <div>
      <Row label="Issuer">{d.issuer ?? "unavailable"}</Row>
      <Row label="Expires">{d.expiry_date ?? "unavailable"}</Row>
      <Row label="Days left">{d.days_until_expiry ?? "unavailable"}</Row>
    </div>
  );
}

/* ---------- Security headers ---------- */
export function HeadersBody({ d }: { d: HeadersResult }) {
  const present = Object.keys(d.headers_present);

  return (
    <div>
      <Row label="Score">{d.score}</Row>

      <div className={`${theme.label} mt-2`}>Present</div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {present.length === 0 ? (
          <span className={theme.muted}>none</span>
        ) : (
          present.map((h) => (
            <span key={h} className={theme.chip}>
              {h}
            </span>
          ))
        )}
      </div>

      <div className={`${theme.label} mt-3`}>Missing</div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {d.headers_missing.length === 0 ? (
          <span className={theme.muted}>none</span>
        ) : (
          d.headers_missing.map((h) => (
            <span key={h} className={theme.chipWarn}>
              {h}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Email authentication ---------- */
function RecordLine({ record, status }: { record: string | null; status?: string }) {
  if (record) return <div className={`${theme.value} mt-0.5`}>{stripQuotes(record)}</div>;
  if (status === "unknown") return <div className={theme.muted}>check failed, try again</div>;
  return <div className={theme.muted}>not found</div>;
}

export function EmailBody({ d }: { d: EmailAuthResult }) {
  return (
    <div className="space-y-3">
      <div>
        <div className={theme.label}>SPF</div>
        <RecordLine record={d.spf_record} status={d.spf_status} />
      </div>
      <div>
        <div className={theme.label}>DMARC</div>
        <RecordLine record={d.dmarc_record} status={d.dmarc_status} />
      </div>
      <Row label="DMARC policy">{d.dmarc_policy ?? "none set"}</Row>
    </div>
  );
}

/* ---------- URL reputation ---------- */
export function UrlRepBody({ d }: { d: UrlRepResult }) {
  if (d.status !== "analyzed") {
    return <div className={theme.muted}>Status: {d.status}</div>;
  }

  const cells: [string, number | undefined][] = [
    ["Malicious", d.malicious_count],
    ["Suspicious", d.suspicious_count],
    ["Harmless", d.harmless_count],
    ["Undetected", d.undetected_count],
  ];

  return (
    <div>
      <Row label="URL">{d.url}</Row>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {cells.map(([label, n]) => (
          <div key={label} className={theme.tile}>
            <div className={theme.label}>{label}</div>
            <div className="font-mono text-lg text-yellow-100">{n ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- MITRE ATT&CK ---------- */
export function MitreBody({ d }: { d: MitreResult }) {
  if (d.mapped_techniques.length === 0) {
    return (
      <p className={theme.muted}>
        No ATT&CK techniques mapped. None of the warning or critical findings matched a known technique.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {d.mapped_techniques.map((t) => (
        <div key={t.technique_id} className={theme.tile}>
          <div className="flex flex-wrap items-center gap-2">
            <a href={t.url} target="_blank" rel="noopener noreferrer" className={`${theme.link} font-mono text-sm`}>
              {t.technique_id}
            </a>
            <span className={theme.text}>{t.technique_name}</span>
            <span className={theme.chip}>{t.tactic}</span>
          </div>
          <p className={`${theme.muted} mt-1`}>Triggered by: {t.matched_finding}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- AI summary ---------- */
export function SummaryBody({ d }: { d: SummaryResult }) {
  return (
    <div>
      <p className={`${theme.text} leading-relaxed`}>{d.summary}</p>
      <p className={`${theme.muted} mt-3`}>
        AI-generated from {d.findings_analyzed} findings across the checks that completed. Use it as a plain-English overview, not a full audit.
      </p>
    </div>
  );
}