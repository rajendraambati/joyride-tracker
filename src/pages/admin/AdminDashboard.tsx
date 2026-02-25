import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buses, drivers, students, trips, messages, getDriverById, getRouteById } from "@/data/mockData";
import { Bus, Users, GraduationCap, MapPin, AlertTriangle, Clock } from "lucide-react";

const stats = [
  { label: "Total Buses", value: buses.length, icon: Bus, color: "text-primary" },
  { label: "Active Trips", value: trips.filter(t => t.status === "in-progress").length, icon: MapPin, color: "text-green-600" },
  { label: "Total Students", value: students.length, icon: GraduationCap, color: "text-amber-600" },
  { label: "Total Drivers", value: drivers.length, icon: Users, color: "text-purple-600" },
];

export default function AdminDashboard() {
  const activeTrips = trips.filter(t => t.status === "in-progress");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map placeholder + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Live Bus Map</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
              <div className="text-center space-y-2">
                <MapPin className="h-10 w-10 mx-auto opacity-40" />
                <p className="font-medium">Google Maps Integration</p>
                <p className="text-sm">Map will display live bus positions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active Trips</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activeTrips.length === 0 && <p className="text-sm text-muted-foreground">No active trips</p>}
            {activeTrips.map((trip) => {
              const driver = getDriverById(trip.driverId);
              const route = getRouteById(trip.routeId);
              return (
                <div key={trip.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{route?.name}</p>
                    <p className="text-xs text-muted-foreground">{driver?.name} • Started {trip.startTime}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Live</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Messages</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {messages.slice(0, 4).map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-lg ${msg.isEmergency ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50"}`}>
              {msg.isEmergency ? (
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{msg.subject}</p>
                <p className="text-xs text-muted-foreground">{msg.from} • {msg.timestamp}</p>
              </div>
              {!msg.read && <Badge className="text-xs">New</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
