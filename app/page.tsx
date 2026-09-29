"use client";

import { useRef, useState } from "react";
import CursorBackground from "./components/CursorBackground";
import ResultCard from "./components/ResultCard";
import {
  DnsBody,
  EmailBody,
  HeadersBody,
  IpBody,
  MitreBody,
  SslBody,
  SubdomainBody,
  SummaryBody,
  UrlRepBody,
  WhoisBody,
} from "./components/CardBodies";
import { API_BASE, describeError, parseInput, postJson, type ValidInput } from "./lib/api";
import { theme } from "./lib/theme";
import { useCard } from "./lib/useCard";
import {
  dataOf,
  type CardState,
  type DnsResult,
  type EmailAuthResult,
  type HeadersResult,
  type IpResult,
  type MitreResult,
  type SslResult,
  type SubdomainResult,
  type SummaryResult,
  type UrlRepResult,
  type WhoisResult,
} from "./lib/types";

export default function Home() {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [target, setTarget] = useState<ValidInput | null>(null);
  const [report, setReport] = useState<CardState<true>>({ status: "idle" });
  const token = useRef(0);

  const summary = useCard<SummaryResult>();
  const dns = useCard<DnsResult>();
  const whois = useCard<WhoisResult>();
  const subdomains = useCard<SubdomainResult>();
  const ip = useCard<IpResult>();
  const ssl = useCard<SslResult>();
  const headers = useCard<HeadersResult>();
  const email = useCard<EmailAuthResult>();
  const urlRep = useCard<UrlRepResult>();
  const mitre = useCard<MitreResult>();

  const statuses = [
    summary.state.status,
    dns.state.status,
    whois.state.status,
    subdomains.state.status,
    ip.state.status,
    ssl.state.status,
    headers.state.status,
    email.state.status,
    urlRep.state.status,
    mitre.state.status,
  ];
  const pending = statuses.filter((s) => s === "loading").length;
  const busy = pending > 0;

  const allFindings = [
    dataOf(dns.state)?.findings,
    dataOf(whois.state)?.findings,
    dataOf(subdomains.state)?.findings,
    dataOf(ip.state)?.findings,
    dataOf(ssl.state)?.findings,
    dataOf(headers.state)?.findings,
    dataOf(email.state)?.findings,
    dataOf(urlRep.state)?.findings,
  ].flatMap((f) => f ?? []);

  const counts = {
    critical: allFindings.filter((f) => f.severity === "critical").length,
    warning: allFindings.filter((f) => f.severity === "warning").length,
    info: allFindings.filter((f) => f.severity === "info").length,
  };

  async function scanDomain(domain: string, url: string, myToken: number) {
    const d = encodeURIComponent(domain);

    // AI summary and MITRE wait for every other check, then analyse them together
    summary.wait();
    mitre.wait();

    const dnsPromise = dns.run(`/investigate/${d}`);

    // The IP check needs an address, which comes from the DNS result
    const ipPromise = dnsPromise.then((data) => {
      if (myToken !== token.current) return null; // a newer scan has started
      const firstIp = data?.records["A"]?.[0];
      if (firstIp) return ip.run(`/ip/${firstIp}`);
      ip.skip(
        data
          ? "This domain has no A record, so there is no IP to check."
          : "The DNS lookup failed, so there is no IP to check."
      );
      return null;
    });

    const results = await Promise.all([
      dnsPromise,
      ipPromise,
      whois.run(`/whois/${d}`),
      subdomains.run(`/subdomains/${d}`),
      ssl.run(`/ssl/${d}`),
      headers.run(`/headers/${d}`),
      email.run(`/email-auth/${d}`),
      urlRep.run(`/url-reputation?url=${encodeURIComponent(url)}`),
    ]);

    if (myToken !== token.current) return;

    const findings = results
      .flatMap((r) => r?.findings ?? [])
      .slice(0, 200)
      .map((f) => ({ severity: f.severity, message: f.message.slice(0, 1000) }));

    const payload = { domain, findings };
    void summary.exec(() => postJson<SummaryResult>("/summary", payload));
    void mitre.exec(() => postJson<MitreResult>("/mitre", payload));
  }

  function investigate() {
    const parsed = parseInput(input);
    if (parsed.kind === "invalid") {
      setInputError(parsed.reason);
      return;
    }

    setInputError("");
    setTarget(parsed);
    setReport({ status: "idle" });
    const myToken = ++token.current;

    if (parsed.kind === "ip") {
      const note = "Enter a domain to run this check.";
      [summary, dns, whois, subdomains, ssl, headers, email, mitre].forEach((c) =>
        c.skip(note)
      );
      void ip.run(`/ip/${parsed.ip}`);
      if (parsed.url) {
        void urlRep.run(`/url-reputation?url=${encodeURIComponent(parsed.url)}`);
      } else {
        urlRep.skip("Enter a full URL (https://...) to check URL reputation.");
      }
      return;
    }

    void scanDomain(parsed.domain, parsed.url, myToken);
  }

  async function downloadReport() {
    if (target?.kind !== "domain") return;
    setReport({ status: "loading" });
    try {
      const res = await fetch(`${API_BASE}/report/${encodeURIComponent(target.domain)}`, {
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`Report failed (${res.status})`);

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${target.domain}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setReport({ status: "done", data: true });
    } catch (e) {
      setReport({ status: "error", error: describeError(e) });
    }
  }

  return (
    <div className={theme.page}>
      <CursorBackground />

      <main className={theme.container}>
        <h1 className={theme.title}>CyberScope</h1>
        <p className={theme.tagline}>&gt; automated domain security investigation</p>

        <div className="max-w-2xl mb-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && investigate()}
            placeholder="example.com, 8.8.8.8, or https://example.com"
            aria-label="Domain, IP address, or URL to investigate"
            className={theme.input}
          />
          <button onClick={investigate} disabled={busy} className={theme.button}>
            {busy ? "SCANNING..." : "INVESTIGATE"}
          </button>
        </div>

        {inputError && <div className={`${theme.errorBox} max-w-2xl mb-6`}>{inputError}</div>}

        {!target && !inputError && (
          <p className={`${theme.muted} mb-8`}>
            Try a domain like google.com, an IPv4 address like 8.8.8.8, or a full URL.
          </p>
        )}

        {target && (
          <>
            <div
              className={`${theme.card} mt-6 mb-5 flex flex-wrap items-center justify-between gap-4`}
              aria-live="polite"
            >
              <div className="font-mono text-sm">
                <span className={theme.label}>Target </span>
                <span className={theme.text}>
                  {target.kind === "domain" ? target.domain : target.ip}
                </span>
              </div>
              <div className="flex gap-5 font-mono text-sm">
                <span className={theme.statCritical}>{counts.critical} critical</span>
                <span className={theme.statWarning}>{counts.warning} warning</span>
                <span className={theme.statInfo}>{counts.info} info</span>
              </div>
              <div className={theme.label}>
                {busy ? `${pending} checks running` : "scan complete"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResultCard index={1} title="AI summary" state={summary.state} wide>
                {(d) => <SummaryBody d={d} />}
              </ResultCard>

              <ResultCard index={2} title="DNS records" state={dns.state} findings={dataOf(dns.state)?.findings}>
                {(d) => <DnsBody d={d} />}
              </ResultCard>

              <ResultCard index={3} title="WHOIS" state={whois.state} findings={dataOf(whois.state)?.findings}>
                {(d) => <WhoisBody d={d} />}
              </ResultCard>

              <ResultCard index={4} title="Subdomains" state={subdomains.state} findings={dataOf(subdomains.state)?.findings}>
                {(d) => <SubdomainBody d={d} />}
              </ResultCard>

              <ResultCard index={5} title="IP reputation" state={ip.state} findings={dataOf(ip.state)?.findings}>
                {(d) => <IpBody d={d} />}
              </ResultCard>

              <ResultCard index={6} title="SSL / TLS" state={ssl.state} findings={dataOf(ssl.state)?.findings}>
                {(d) => <SslBody d={d} />}
              </ResultCard>

              <ResultCard index={7} title="Security headers" state={headers.state} findings={dataOf(headers.state)?.findings}>
                {(d) => <HeadersBody d={d} />}
              </ResultCard>

              <ResultCard index={8} title="Email auth" state={email.state} findings={dataOf(email.state)?.findings}>
                {(d) => <EmailBody d={d} />}
              </ResultCard>

              <ResultCard index={9} title="URL reputation" state={urlRep.state} findings={dataOf(urlRep.state)?.findings}>
                {(d) => <UrlRepBody d={d} />}
              </ResultCard>

              <ResultCard index={10} title="MITRE ATT&CK" state={mitre.state} wide>
                {(d) => <MitreBody d={d} />}
              </ResultCard>

              <section className={`${theme.card} md:col-span-2 flex flex-wrap items-center justify-between gap-4`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={theme.cardIndex}>11</span>
                    <h2 className={theme.cardTitle}>PDF report</h2>
                  </div>
                  <p className={`${theme.muted} mt-1`}>
                    {target.kind === "domain"
                      ? "Builds a downloadable report from the same checks. It is quick if you just scanned this domain."
                      : "PDF reports are available for domain scans."}
                  </p>
                  {report.status === "error" && (
                    <p className={`${theme.errorText} mt-2`}>{report.error}</p>
                  )}
                </div>
                <button
                  onClick={downloadReport}
                  disabled={target.kind !== "domain" || report.status === "loading"}
                  className={theme.buttonGhost}
                >
                  {report.status === "loading" ? "GENERATING..." : "DOWNLOAD PDF"}
                </button>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}