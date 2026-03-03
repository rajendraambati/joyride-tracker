import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bus, Users, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DriverTrip() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [driver, setDriver] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedUp, setPickedUp] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: driverData } = await supabase
        .from("drivers")
        .select("*, buses!fk_drivers_bus(id, name, registration_number, route_id)")
        .eq("user_id", user.id)
        .single();
      if (!driverData) { setLoading(false); return; }
      setDriver(driverData);

      const busData = driverData.buses;
      setBus(busData);

      if (busData?.route_id) {
        const { data: routeData } = await supabase.from("routes").select("*").eq("id", busData.route_id).single();
        setRoute(routeData);
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

  const togglePickup = (id: string) => {
    setPickedUp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sendMessage = () => {
    if (!msg.trim()) return;
    toast({ title: "Message Sent", description: "Your message has been sent to admin." });
    setMsg("");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!driver) return <p className="text-center text-muted-foreground py-8">No driver profile found.</p>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Trip Details</h2>

      {bus && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2"><Bus className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{bus.name} • {bus.registration_number}</span></div>
            {route && <p className="text-sm text-muted-foreground">Route: {route.name} ({route.source} → {route.destination})</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Passengers ({students.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {students.length === 0 && <p className="text-sm text-muted-foreground">No students assigned to this bus.</p>}
          {students.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={pickedUp[s.id] || false}
                onCheckedChange={() => togglePickup(s.id)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">Class {s.standard || "—"} • {s.pickup_location || "—"}</p>
              </div>
              {s.is_absent ? (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Absent</Badge>
              ) : pickedUp[s.id] ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Picked Up</Badge>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Message Admin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="Send a message to admin..." value={msg} onChange={e => setMsg(e.target.value)} rows={2} />
          <Button className="w-full" onClick={sendMessage}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
