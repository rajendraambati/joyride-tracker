import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBusById, getDriverById, getRouteById } from "@/data/mockData";
import { Bus, User, MapPin, Clock } from "lucide-react";

export default function ParentTrip() {
  const bus = getBusById("b1")!;
  const driver = getDriverById(bus.driverId)!;
  const route = getRouteById(bus.routeId)!;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Trip Details</h2>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bus className="h-5 w-5 text-primary" /> Bus Information</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bus Name</span><span className="text-sm font-medium">{bus.name}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Registration</span><span className="text-sm font-medium">{bus.registrationNumber}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Capacity</span><span className="text-sm font-medium">{bus.capacity} seats</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Route</span><span className="text-sm font-medium">{route.name}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Driver Information</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{driver.name}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{driver.phone}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">License</span><span className="text-sm font-medium">{driver.licenseNumber}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Stops</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {route.stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{stop.name}</p>
                </div>
                <span className="text-sm text-muted-foreground">{stop.estimatedTime}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
