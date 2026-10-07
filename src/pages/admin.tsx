import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FlaskConical, Sparkles } from "lucide-react";
import { isAdmin } from "@/lib/auth-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface BetaTester {
  id: string;
  email: string;
  name: string | null;
  isonboarded: boolean;
  onboarding_day: number | null;
  traits_count: number;
  session_count: number;
  last_active: string | null;
  consent_given_at: string | null;
  created_at: string;
}

export default function Admin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [betaLoading, setBetaLoading] = useState(false);
  const [discovery, setDiscovery] = useState<Record<string, number | null> | null>(null);
  const [transformation, setTransformation] = useState<Record<string, number | null> | null>(null);

  const fetchBetaTesters = useCallback(async () => {
    setBetaLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch('/api/admin/beta-testers', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setBetaTesters(json.testers || []);
      }
    } catch (err) {
      console.error('Failed to fetch beta testers:', err);
    } finally {
      setBetaLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        const adminStatus = await isAdmin();
        
        if (!adminStatus) {
          toast.error("You don't have permission to access the admin area");
          router.push("/dashboard");
          return;
        }
        
        setAuthorized(true);
        fetchBetaTesters();
        // Constitution §10/§12 metrics — aggregate counts only.
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            const res = await fetch('/api/admin/kpis', { headers: { Authorization: `Bearer ${session.access_token}` } });
            if (res.ok) {
              const kpis = await res.json();
              setDiscovery(kpis.discovery ?? null);
              setTransformation(kpis.transformation ?? null);
            }
          } catch {
            // metrics are optional on this page
          }
        })();
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Authentication error");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [router, fetchBetaTesters]);
  
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-lg">Loading admin panel...</p>
      </div>
    );
  }
  
  if (!authorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 bg-popover border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-foreground ml-2">
            Admin dashboard
          </h1>
          <div className="ml-auto">
            <Badge variant="outline" className="bg-primary/10 text-brand-hover border-primary">
              Admin Mode
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="discovery" className="mb-8">
          <TabsList className="mb-6 grid grid-cols-2">
            <TabsTrigger value="discovery">
              <Sparkles className="w-4 h-4 mr-2" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="beta">
              <FlaskConical className="w-4 h-4 mr-2" />
              Beta testers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="discovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meaningful discovery rate — last {discovery?.window_days ?? 28} days</CardTitle>
                <CardDescription>
                  Insights, self-chosen experiments and recognized growth per active user-week (constitution §10).
                  Counts only — no content is ever shown here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!discovery ? (
                  <p className="text-sm text-brand-text-secondary">No metrics yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Meaningful discovery rate', discovery.meaningful_discovery_rate],
                      ['Active user-weeks', discovery.active_user_weeks],
                      ['Self-discoveries', discovery.self_discoveries],
                      ['Mirror answers', discovery.mirror_discoveries],
                      ['Experiments created', discovery.experiments_created],
                      ['Experiments tried', discovery.experiments_tried],
                      ['Experiment follow-through', discovery.experiment_follow_through],
                      ['Growth recognized', discovery.growth_recognized],
                      ['Guesses confirmed', discovery.traits_confirmed],
                      ['Guesses corrected', discovery.traits_rejected],
                      ['Correction rate', discovery.correction_rate],
                      ['Mirror usefulness', discovery.mirror_usefulness],
                      ['Items shared by couples', discovery.shared_items],
                      ['Own reasons given', discovery.reasons_given],
                      ['Experiments with their own reason', discovery.own_reason_rate],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-lg border bg-popover p-4">
                        <p className="text-xs text-brand-text-secondary">{label}</p>
                        <p className="text-2xl font-semibold text-foreground">{value ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lived change — last {transformation?.window_days ?? 28} days</CardTitle>
                <CardDescription>
                  Real-world practice, adaptation after setbacks, and user agency (constitution v1.2 §10). Agreement
                  with Peter is never a metric. Counts only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!transformation ? (
                  <p className="text-sm text-brand-text-secondary">Not available until the v1.2 migration has run.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Missions tried', transformation.missions_tried],
                      ['Reflected on (share)', transformation.reflection_rate],
                      ['Setbacks', transformation.setbacks],
                      ['Adapted after a setback', transformation.adaptation_rate],
                      ['Tried again within 14 days', transformation.persistence_after_setback],
                      ['Designed by the user (share)', transformation.user_designed_share],
                      ['Accepted ideas', transformation.accepted_from_suggestion],
                      ['Identity steps linked', transformation.identity_steps],
                      ['Deep Whys found', transformation.deep_whys],
                      ['Chapters marked', transformation.growth_arcs],
                      ['Missions reaching others', transformation.contribution_missions],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-lg border bg-white p-4">
                        <p className="text-xs text-brand-text-secondary">{label}</p>
                        <p className="text-2xl font-semibold text-gray-900">{value ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beta" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Beta testers</CardTitle>
                <CardDescription>
                  Monitor therapist testers progressing through the 14-day loop
                </CardDescription>
              </CardHeader>
              <CardContent>
                {betaLoading ? (
                  <p className="text-center py-6 text-brand-text-secondary">Loading...</p>
                ) : betaTesters.length === 0 ? (
                  <p className="text-center py-6 text-brand-text-secondary">No users yet</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-background">
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-center p-3 font-medium">Day</th>
                          <th className="text-center p-3 font-medium">Traits</th>
                          <th className="text-center p-3 font-medium">Sessions</th>
                          <th className="text-left p-3 font-medium">Last Active</th>
                          <th className="text-left p-3 font-medium">Consent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {betaTesters.map((t) => (
                          <tr key={t.id} className="border-b last:border-b-0 hover:bg-background">
                            <td className="p-3 font-mono text-xs">{t.email}</td>
                            <td className="p-3">{t.name || '—'}</td>
                            <td className="p-3 text-center">
                              <Badge variant={t.onboarding_day && t.onboarding_day >= 14 ? 'default' : 'outline'}>
                                {t.onboarding_day ?? '—'}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">{t.traits_count}</td>
                            <td className="p-3 text-center">{t.session_count}</td>
                            <td className="p-3 text-xs text-brand-text-secondary">{t.last_active || '—'}</td>
                            <td className="p-3 text-xs">
                              {t.consent_given_at ? (
                                <span className="text-success-emphasis">Yes</span>
                              ) : (
                                <span className="text-brand-text-secondary">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
 