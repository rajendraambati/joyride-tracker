import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, User, MapPin, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ParentTrip() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("students")
      .select("*, buses!fk_students_bus(name, registration_number, capacity, routes!fk_buses_route(name, source, destination, route_stops(*)), drivers!fk_buses_driver(name, phone))")
      .eq("parent_id", user.id)
      .then(({ data }) => {
        setChildren(data ?? []);
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (children.length === 0) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold">Trip Details</h2>
        <p className="text-sm text-muted-foreground text-center py-8">No children linked to view trip details.</p>
      </div>
    );
  }

  const child = children[0];
  const bus = child.buses;
  const route = bus?.routes;
  const driver = bus?.drivers;
  const stops = (route?.route_stops ?? []).sort((a: any, b: any) => a.stop_order - b.stop_order);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Trip Details</h2>

      {bus ? (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bus className="h-5 w-5 text-primary" /> Bus Information</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bus Name</span><span className="text-sm font-medium">{bus.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Registration</span><span className="text-sm font-medium">{bus.registration_number}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Capacity</span><span className="text-sm font-medium">{bus.capacity} seats</span></div>
              {route && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Route</span><span className="text-sm font-medium">{route.name}</span></div>}
            </CardContent>
          </Card>

          {driver && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Driver Information</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{driver.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{driver.phone || "—"}</span></div>
              </CardContent>
            </Card>
          )}

          {stops.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Stops</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stops.map((stop: any) => (
                    <div key={stop.id} className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{stop.name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{stop.estimated_time || "—"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No bus assigned to your child yet.</p>
      )}
    </div>
  );
}
