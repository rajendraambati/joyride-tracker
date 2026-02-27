import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Eye, EyeOff, Shield, Activity } from "lucide-react";

interface DrowsinessAlert {
  id: string;
  driver_id: string;
  bus_id: string | null;
  score: number;
  status: string;
  left_eye: string;
  right_eye: string;
  created_at: string;
  drivers?: { name: string; bus_id: string | null } | null;
}

export default function AdminDrowsiness() {
  const [alerts, setAlerts] = useState<DrowsinessAlert[]>([]);
  const [latestByDriver, setLatestByDriver] = useState<Record<string, DrowsinessAlert>>({});

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("drowsiness_alerts")
      .select("*, drivers(name, bus_id)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      setAlerts(data as DrowsinessAlert[]);
      const latest: Record<string, DrowsinessAlert> = {};
      for (const a of data as DrowsinessAlert[]) {
        if (!latest[a.driver_id]) latest[a.driver_id] = a;
      }
      setLatestByDriver(latest);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("drowsiness-realtime")
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

  const activeAlerts = Object.values(latestByDriver).filter(a => a.status === "alert").length;
  const warnings = Object.values(latestByDriver).filter(a => a.status === "warning").length;
  const normal = Object.values(latestByDriver).filter(a => a.status === "normal").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drowsiness Monitoring</h1>
        <p className="text-muted-foreground">Real-time driver drowsiness detection status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAlerts}</p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{warnings}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{normal}</p>
              <p className="text-sm text-muted-foreground">Normal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Driver Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Driver Status</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(latestByDriver).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No drowsiness data received yet. Waiting for driver detection system to connect...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(latestByDriver).map((alert) => (
                <Card key={alert.driver_id} className={`border-l-4 ${alert.status === "alert" ? "border-l-destructive" : alert.status === "warning" ? "border-l-amber-500" : "border-l-green-500"}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{(alert as any).drivers?.name || "Unknown Driver"}</p>
                      <Badge className={statusColor(alert.status)}>{alert.status.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {alert.left_eye === "closed" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        L: {alert.left_eye}
                      </span>
                      <span className="flex items-center gap-1">
                        {alert.right_eye === "closed" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        R: {alert.right_eye}
                      </span>
                      <span>Score: {Number(alert.score).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last update: {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Left Eye</TableHead>
                <TableHead>Right Eye</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.filter(a => a.status !== "normal").slice(0, 20).map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{(alert as any).drivers?.name || "Unknown"}</TableCell>
                  <TableCell><Badge className={statusColor(alert.status)}>{alert.status}</Badge></TableCell>
                  <TableCell>{alert.left_eye === "closed" ? <EyeOff className="h-4 w-4 text-destructive" /> : <Eye className="h-4 w-4 text-green-500" />}</TableCell>
                  <TableCell>{alert.right_eye === "closed" ? <EyeOff className="h-4 w-4 text-destructive" /> : <Eye className="h-4 w-4 text-green-500" />}</TableCell>
                  <TableCell>{Number(alert.score).toFixed(0)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {alerts.filter(a => a.status !== "normal").length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">No alerts recorded yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
