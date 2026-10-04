import type { ReactNode } from "react";
import { theme } from "../lib/theme";
import { getWhyItMatters } from "../lib/findingContext";
import type { CardState, Finding, Severity } from "../lib/types";

const RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export function Badge({ severity }: { severity: Severity }) {
  return (
    <span className={`${theme.badgeBase} ${theme.badge[severity] ?? theme.badge.info}`}>
      {severity}
    </span>
  );
}

export function Findings({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) return null;
  const sorted = [...findings].sort((a, b) => RANK[a.severity] - RANK[b.severity]);

  return (
    <div className={`mt-4 pt-3 border-t ${theme.divider} space-y-2`}>
      <div className={theme.label}>Findings</div>
      {sorted.map((f, i) => {
        const why = getWhyItMatters(f.message);
        return (
          <div key={i} className="text-sm">
            <div className="flex gap-2 items-start">
              <Badge severity={f.severity} />
              <span className={theme.text}>{f.message}</span>
            </div>
            {why && (
              <details className="ml-1">
                <summary className={theme.detailsToggle}>Why does this matter?</summary>
                <p className={theme.detailsBody}>{why}</p>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}

function worstSeverity(findings?: Finding[]): Severity | null {
  if (!findings || findings.length === 0) return null;
  return findings.reduce<Severity>(
    (worst, f) => (RANK[f.severity] < RANK[worst] ? f.severity : worst),
    "info"
  );
}

interface Props<T> {
  index: number;
  title: string;
  state: CardState<T>;
  findings?: Finding[];
  wide?: boolean;
  children: (data: T) => ReactNode;
}

export default function ResultCard<T>({
  index,
  title,
  state,
  findings,
  wide,
  children,
}: Props<T>) {
  const worst = state.status === "done" ? worstSeverity(findings) : null;

  return (
    <section className={`${theme.card} ${wide ? "md:col-span-2" : ""}`}>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={theme.cardIndex}>{String(index).padStart(2, "0")}</span>
          <h2 className={theme.cardTitle}>{title}</h2>
        </div>

        {state.status === "loading" && (
          <span className={`${theme.label} animate-pulse`}>scanning</span>
        )}
        {state.status === "error" && (
          <span className={theme.statCritical + " text-xs font-mono uppercase"}>error</span>
        )}
        {state.status === "skipped" && <span className={theme.label}>skipped</span>}
        {worst && <Badge severity={worst} />}
      </header>

      {state.status === "loading" && (
        <div role="status" aria-label={`Loading ${title}`} className="space-y-2 animate-pulse">
          <div className={`${theme.skeleton} h-3 w-3/4`} />
          <div className={`${theme.skeleton} h-3 w-1/2`} />
          <div className={`${theme.skeleton} h-3 w-2/3`} />
        </div>
      )}

      {state.status === "error" && <p className={theme.errorText}>{state.error}</p>}

      {state.status === "skipped" && <p className={theme.muted}>{state.note}</p>}

      {state.status === "done" && (
        <>
          {children(state.data)}
          {findings && <Findings findings={findings} />}
        </>
      )}
    </section>
  );
}