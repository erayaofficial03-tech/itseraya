import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXPECTED_IP = "185.158.133.1";
const DOMAINS = ["itseraya.in", "www.itseraya.in"];

type DnsResult = {
  domain: string;
  loading: boolean;
  resolved: boolean;
  ips: string[];
  matchesExpected: boolean;
  httpsOk: boolean | null;
  error?: string;
};

async function checkDns(domain: string): Promise<Pick<DnsResult, "resolved" | "ips" | "matchesExpected" | "error">> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
      headers: { Accept: "application/dns-json" },
    });
    const data = await res.json();
    const ips: string[] =
      data?.Answer?.filter((a: any) => a.type === 1).map((a: any) => a.data) ?? [];
    return {
      resolved: ips.length > 0,
      ips,
      matchesExpected: ips.includes(EXPECTED_IP),
    };
  } catch (e: any) {
    return { resolved: false, ips: [], matchesExpected: false, error: e?.message ?? "DNS lookup failed" };
  }
}

async function checkHttps(domain: string): Promise<boolean> {
  try {
    await fetch(`https://${domain}/`, { method: "HEAD", mode: "no-cors", cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

export default function DomainHealth() {
  const [results, setResults] = useState<DnsResult[]>(
    DOMAINS.map((d) => ({
      domain: d,
      loading: true,
      resolved: false,
      ips: [],
      matchesExpected: false,
      httpsOk: null,
    })),
  );
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const runChecks = async () => {
    setResults((prev) => prev.map((r) => ({ ...r, loading: true, httpsOk: null })));
    const next = await Promise.all(
      DOMAINS.map(async (domain) => {
        const dns = await checkDns(domain);
        const httpsOk = dns.resolved ? await checkHttps(domain) : false;
        return { domain, loading: false, ...dns, httpsOk } as DnsResult;
      }),
    );
    setResults(next);
    setCheckedAt(new Date());
  };

  useEffect(() => {
    runChecks();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Domain health</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Live DNS and HTTPS check for your custom domains. Expected A record:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{EXPECTED_IP}</code>
          </p>
        </header>

        <div className="space-y-4">
          {results.map((r) => {
            const allGood = r.resolved && r.matchesExpected && r.httpsOk;
            return (
              <div
                key={r.domain}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{r.domain}</span>
                  </div>
                  {r.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : allGood ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                      <XCircle className="h-4 w-4" /> Issue
                    </span>
                  )}
                </div>

                {!r.loading && (
                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <Row
                      label="DNS resolved"
                      ok={r.resolved}
                      detail={r.ips.length ? r.ips.join(", ") : r.error ?? "No A record"}
                    />
                    <Row
                      label="Points to Lovable"
                      ok={r.matchesExpected}
                      detail={r.matchesExpected ? EXPECTED_IP : `Expected ${EXPECTED_IP}`}
                    />
                    <Row
                      label="HTTPS reachable"
                      ok={!!r.httpsOk}
                      icon={<Lock className="h-3.5 w-3.5" />}
                      detail={r.httpsOk ? "SSL active" : "Unreachable"}
                    />
                    <div className="text-xs text-muted-foreground self-end">
                      <a
                        href={`https://dnschecker.org/#A/${r.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-foreground"
                      >
                        Global propagation →
                      </a>
                    </div>
                  </dl>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {checkedAt ? `Last checked ${checkedAt.toLocaleTimeString()}` : "Checking…"}
          </p>
          <Button onClick={runChecks} variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Re-check
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  ok,
  detail,
  icon,
}: {
  label: string;
  ok: boolean;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 inline-flex items-center gap-1.5 font-medium ${
          ok ? "text-emerald-600" : "text-destructive"
        }`}
      >
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <span className="truncate">{detail}</span>
      </div>
    </div>
  );
}
