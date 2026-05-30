import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Globe, Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EXPECTED_IP = "185.158.133.1";
const LOVABLE_CNAME = "cname.lovable.app";

type DnsResult = {
  domain: string;
  loading: boolean;
  resolved: boolean;
  ips: string[];
  matchesExpected: boolean;
  httpsOk: boolean | null;
  error?: string;
};

async function checkDns(domain: string) {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
      headers: { Accept: "application/dns-json" },
    });
    const data = await res.json();
    const ips: string[] = data?.Answer?.filter((a: any) => a.type === 1).map((a: any) => a.data) ?? [];
    return { resolved: ips.length > 0, ips, matchesExpected: ips.includes(EXPECTED_IP) };
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

export default function DomainAdmin() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
      return data;
    },
  });

  const [customDomain, setCustomDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<DnsResult[]>([]);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (settings?.custom_domain) setCustomDomain(settings.custom_domain);
  }, [settings?.custom_domain]);

  const domainsToCheck = Array.from(
    new Set(
      ["itseraya.in", "www.itseraya.in", settings?.custom_domain]
        .filter(Boolean)
        .map((d) => d!.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
    )
  );

  const runChecks = async () => {
    setResults(domainsToCheck.map((d) => ({
      domain: d, loading: true, resolved: false, ips: [], matchesExpected: false, httpsOk: null,
    })));
    const next = await Promise.all(
      domainsToCheck.map(async (domain) => {
        const dns = await checkDns(domain);
        const httpsOk = dns.resolved ? await checkHttps(domain) : false;
        return { domain, loading: false, ...dns, httpsOk } as DnsResult;
      })
    );
    setResults(next);
    setCheckedAt(new Date());
  };

  useEffect(() => {
    if (domainsToCheck.length) runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.custom_domain]);

  const saveDomain = async () => {
    setSaving(true);
    const cleaned = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const { error } = await supabase
      .from("settings")
      .update({ custom_domain: cleaned || null, domain_verified: false })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Could not save domain");
      return;
    }
    toast.success("Domain saved. Configure DNS to activate.");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Globe className="h-7 w-7" /> Domain
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your store is live at:{" "}
          <a href="https://itseraya.in" target="_blank" rel="noreferrer" className="font-medium underline">
            itseraya.in
          </a>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>Connect your own domain like shop.eraya.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Custom Domain</Label>
            <div className="flex gap-2">
              <Input
                id="custom-domain"
                placeholder="shop.eraya.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <Button onClick={saveDomain} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Domain"}
              </Button>
            </div>
          </div>

          {settings?.custom_domain && (
            <div className="rounded-lg border border-border bg-muted/40 p-5 space-y-4">
              <div>
                <h3 className="font-semibold">Point your domain to Eraya</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Add ONE of these records to your domain registrar's DNS settings.
                </p>
              </div>

              <div className="rounded-md border bg-background p-4 space-y-2 text-sm">
                <p className="font-medium">Option 1 — CNAME (recommended for subdomains)</p>
                <DnsRow label="Name" value="www or @" />
                <DnsRow label="Type" value="CNAME" />
                <DnsRow label="Value" value={LOVABLE_CNAME} onCopy={() => copy(LOVABLE_CNAME)} />
              </div>

              <div className="rounded-md border bg-background p-4 space-y-2 text-sm">
                <p className="font-medium">Option 2 — A Record (for root domains)</p>
                <DnsRow label="Name" value="@" />
                <DnsRow label="Type" value="A" />
                <DnsRow label="Value" value={EXPECTED_IP} onCopy={() => copy(EXPECTED_IP)} />
              </div>

              <Button onClick={runChecks} variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5 mr-2" /> Check DNS Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domain Health</CardTitle>
              <CardDescription>
                Live DNS &amp; HTTPS check. Expected A record:{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{EXPECTED_IP}</code>
              </CardDescription>
            </div>
            <Button onClick={runChecks} variant="outline" size="sm">
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Re-check
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((r) => {
            const allGood = r.resolved && r.matchesExpected && r.httpsOk;
            return (
              <div key={r.domain} className="rounded-xl border border-border bg-card p-5">
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
                  ) : r.resolved && !r.matchesExpected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Loader2 className="h-4 w-4" /> Propagating
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                      <XCircle className="h-4 w-4" /> Issue
                    </span>
                  )}
                </div>

                {!r.loading && (
                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <Row label="DNS resolved" ok={r.resolved} detail={r.ips.length ? r.ips.join(", ") : r.error ?? "No A record"} />
                    <Row label="Points to Lovable" ok={r.matchesExpected} detail={r.matchesExpected ? EXPECTED_IP : `Expected ${EXPECTED_IP}`} />
                    <Row label="HTTPS / SSL active" ok={!!r.httpsOk} icon={<Lock className="h-3.5 w-3.5" />} detail={r.httpsOk ? "SSL active" : "Unreachable"} />
                    <div className="text-xs text-muted-foreground self-end">
                      <a href={`https://dnschecker.org/#A/${r.domain}`} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                        Global propagation →
                      </a>
                    </div>
                  </dl>
                )}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            {checkedAt ? `Last checked ${checkedAt.toLocaleTimeString()}` : "Checking…"} · DNS propagation can take 24–48 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DnsRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground w-16">{label}:</span>
      <code className="flex-1 px-2 py-1 rounded bg-muted text-xs font-mono">{value}</code>
      {onCopy && (
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function Row({ label, ok, detail, icon }: { label: string; ok: boolean; detail: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 inline-flex items-center gap-1.5 font-medium ${ok ? "text-emerald-600" : "text-destructive"}`}>
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <span className="truncate">{detail}</span>
      </div>
    </div>
  );
}
