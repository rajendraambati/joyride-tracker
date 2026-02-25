import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trips, buses, drivers, routes, notifications, getDriverById, getBusById, getRouteById } from "@/data/mockData";
import { MapPin, Clock, Bell, Bus } from "lucide-react";
import BusMap from "@/components/BusMap";

export default function ParentHome() {
  // Mock: parent p1's child is on bus b1
  const currentTrip = trips.find(t => t.busId === "b1" && t.date === "2026-02-25");
  const bus = getBusById("b1");
  const driver = getDriverById(bus?.driverId ?? "");
  const route = getRouteById(bus?.routeId ?? "");
  const parentNotifs = notifications.filter(n => n.userId === "p1" && !n.read);

  const statusColor = {
    "in-progress": "bg-green-100 text-green-700",
    "completed": "bg-blue-100 text-blue-700",
    "not-started": "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Notification banner */}
      {parentNotifs.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{parentNotifs[0].title}</p>
              <p className="text-xs text-muted-foreground">{parentNotifs[0].message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Today's Trip</CardTitle>
            {currentTrip && (
              <Badge variant="secondary" className={statusColor[currentTrip.status]}>{currentTrip.status.replace("-", " ")}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Bus className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{bus?.name} • {bus?.registrationNumber}</p>
              <p className="text-xs text-muted-foreground">Driver: {driver?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm">ETA: <span className="font-medium">7:15 AM</span> at MG Road Junction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map placeholder */}
      <Card>
        <CardHeader><CardTitle className="text-base">Live Bus Location</CardTitle></CardHeader>
        <CardContent>
          <BusMap
            height="224px"
            center={route ? { lat: route.stops[1]?.lat || 12.94, lng: route.stops[1]?.lng || 77.62 } : undefined}
            zoom={14}
            markers={[{ id: "bus1", position: { lat: route?.stops[1]?.lat || 12.94, lng: route?.stops[1]?.lng || 77.62 }, label: "🚌", color: "#2563eb" }]}
            routePath={route?.stops.map(s => ({ lat: s.lat, lng: s.lng }))}
          />
        </CardContent>
      </Card>

      {/* Route stops */}
      {route && (
        <Card>
          <CardHeader><CardTitle className="text-base">Route: {route.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {route.stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${i < 2 ? "bg-primary" : "bg-border"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.estimatedTime}</p>
                  </div>
                  {i < 2 && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Passed</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
