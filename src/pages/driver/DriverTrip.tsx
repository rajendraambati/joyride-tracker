import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getStudentsByBus, getBusById, getRouteById, notifications, messages } from "@/data/mockData";
import { Bus, Users, Send, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DriverTrip() {
  const bus = getBusById("b1")!;
  const route = getRouteById(bus.routeId)!;
  const busStudents = getStudentsByBus("b1");
  const driverNotifs = notifications.filter(n => n.userId === "d1");
  const [pickedUp, setPickedUp] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const { toast } = useToast();

  const togglePickup = (id: string) => {
    setPickedUp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Trip Details</h2>

      {/* Bus info */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2"><Bus className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{bus.name} • {bus.registrationNumber}</span></div>
          <p className="text-sm text-muted-foreground">Route: {route.name} ({route.source} → {route.destination})</p>
        </CardContent>
      </Card>

      {/* Passenger list with pickup toggle */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Passengers ({busStudents.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {busStudents.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={pickedUp[s.id] || false}
                onCheckedChange={() => togglePickup(s.id)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">Class {s.standard} • {s.pickupLocation}</p>
              </div>
              {s.isAbsent ? (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Absent</Badge>
              ) : pickedUp[s.id] ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Picked Up</Badge>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Send message */}
      <Card>
        <CardHeader><CardTitle className="text-base">Message Admin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="Send a message to admin..." value={msg} onChange={e => setMsg(e.target.value)} rows={2} />
          <Button className="w-full" onClick={() => { toast({ title: "Message Sent" }); setMsg(""); }}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {driverNotifs.length === 0 && <p className="text-sm text-muted-foreground">No notifications</p>}
          {driverNotifs.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
              <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
