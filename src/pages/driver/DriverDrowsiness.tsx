import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Eye, EyeOff, Shield, Activity } from "lucide-react";

interface DrowsinessAlert {
  id: string;
  score: number;
  status: string;
  left_eye: string;
  right_eye: string;
  created_at: string;
}

export default function DriverDrowsiness() {
  const [alerts, setAlerts] = useState<DrowsinessAlert[]>([]);
  const [latest, setLatest] = useState<DrowsinessAlert | null>(null);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("drowsiness_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setAlerts(data as DrowsinessAlert[]);
      if (data.length > 0) setLatest(data[0] as DrowsinessAlert);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const channel = supabase
      .channel("driver-drowsiness")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "drowsiness_alerts" }, () => {
        fetchAlerts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "alert": return "bg-destructive text-destructive-foreground";
      case "warning": return "bg-amber-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "alert": return <AlertTriangle className="h-8 w-8 text-destructive" />;
      case "warning": return <Activity className="h-8 w-8 text-amber-500" />;
      default: return <Shield className="h-8 w-8 text-green-500" />;
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Drowsiness Monitor</h2>

      {/* Current Status */}
      <Card className={`border-2 ${latest?.status === "alert" ? "border-destructive" : latest?.status === "warning" ? "border-amber-500" : "border-green-500"}`}>
        <CardContent className="p-6 flex items-center gap-4">
          {latest ? <StatusIcon status={latest.status} /> : <Shield className="h-8 w-8 text-muted-foreground" />}
          <div className="flex-1">
            <p className="font-semibold text-lg">
              {latest ? latest.status === "alert" ? "⚠️ Drowsiness Detected!" : latest.status === "warning" ? "Caution - Getting Drowsy" : "All Good - Stay Alert" : "Waiting for detection system..."}
            </p>
            {latest && (
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {latest.left_eye === "closed" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  Left: {latest.left_eye}
                </span>
                <span className="flex items-center gap-1">
                  {latest.right_eye === "closed" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  Right: {latest.right_eye}
                </span>
              </div>
            )}
          </div>
          {latest && <Badge className={statusColor(latest.status)}>{latest.status}</Badge>}
        </CardContent>
      </Card>

      {/* Score */}
      {latest && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Drowsiness Score</p>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${Number(latest.score) >= 5 ? "bg-destructive" : Number(latest.score) >= 3 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(Number(latest.score) * 10, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Score: {Number(latest.score).toFixed(0)} / 10</p>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
          {alerts.slice(0, 10).map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {a.status === "alert" ? <AlertTriangle className="h-4 w-4 text-destructive" /> : a.status === "warning" ? <Activity className="h-4 w-4 text-amber-500" /> : <Shield className="h-4 w-4 text-green-500" />}
                <span className="text-sm">{a.status === "alert" ? "Drowsiness detected" : a.status === "warning" ? "Getting drowsy" : "Normal"}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
