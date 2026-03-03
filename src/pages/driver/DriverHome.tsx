import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Users, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DriverHome() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onDuty, setOnDuty] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Get driver record for this user
      const { data: driverData } = await supabase
        .from("drivers")
        .select("*, buses!fk_drivers_bus(id, name, registration_number, route_id)")
        .eq("user_id", user.id)
        .single();

      if (!driverData) { setLoading(false); return; }
      setDriver(driverData);
      setOnDuty(driverData.duty_status === "on-duty");

      const busData = driverData.buses;
      setBus(busData);

      if (busData?.route_id) {
        const [routeRes, stopsRes] = await Promise.all([
          supabase.from("routes").select("*").eq("id", busData.route_id).single(),
          supabase.from("route_stops").select("*").eq("route_id", busData.route_id).order("stop_order"),
        ]);
        setRoute(routeRes.data);
        setStops(stopsRes.data ?? []);
      }

      if (busData?.id) {
        const { data: studentsData } = await supabase
          .from("students")
          .select("*")
          .eq("bus_id", busData.id)
          .eq("enrollment_status", "active");
        setStudents(studentsData ?? []);
      }

      setLoading(false);
    })();
  }, [user?.id]);

  const toggleDuty = async (checked: boolean) => {
    if (!driver) return;
    setOnDuty(checked);
    await supabase.from("drivers").update({ duty_status: checked ? "on-duty" : "off-duty" }).eq("id", driver.id);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!driver) return <p className="text-center text-muted-foreground py-8">No driver profile found for your account.</p>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Duty Status</p>
            <p className="text-sm text-muted-foreground">{onDuty ? "You are on duty" : "You are off duty"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="duty" className="text-sm">{onDuty ? "On Duty" : "Off Duty"}</Label>
            <Switch id="duty" checked={onDuty} onCheckedChange={toggleDuty} />
          </div>
        </CardContent>
      </Card>

      {bus && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{bus.name} — {bus.registration_number}</p>
              {route && <p className="text-sm text-muted-foreground">Route: {route.name}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {stops.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Stops</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stops.map((stop: any) => (
                <div key={stop.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{stop.stop_order}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.estimated_time || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {students.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Passengers ({students.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Class {s.standard || "—"} • {s.pickup_location || "—"}</p>
                  </div>
                  {s.is_absent && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">Absent</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
