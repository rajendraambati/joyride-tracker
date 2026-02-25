import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { routes, getStudentsByBus, trips } from "@/data/mockData";
import { MapPin, Users, Navigation, Clock } from "lucide-react";
import BusMap from "@/components/BusMap";

export default function DriverHome() {
  const [onDuty, setOnDuty] = useState(true);
  const route = routes[0]; // driver d1 drives route r1
  const busStudents = getStudentsByBus("b1");
  const currentTrip = trips.find(t => t.busId === "b1" && t.date === "2026-02-25");

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Duty toggle */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Duty Status</p>
            <p className="text-sm text-muted-foreground">{onDuty ? "You are on duty" : "You are off duty"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="duty" className="text-sm">{onDuty ? "On Duty" : "Off Duty"}</Label>
            <Switch id="duty" checked={onDuty} onCheckedChange={setOnDuty} />
          </div>
        </CardContent>
      </Card>

      {/* Trip Status */}
      {currentTrip && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Current Trip</p>
                <p className="text-sm text-muted-foreground">Started at {currentTrip.startTime}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">{currentTrip.status.replace("-", " ")}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Map placeholder */}
      <Card>
        <CardHeader><CardTitle className="text-base">Navigation — {route.name}</CardTitle></CardHeader>
        <CardContent>
          <BusMap
            height="192px"
            center={{ lat: route.stops[0].lat, lng: route.stops[0].lng }}
            zoom={13}
            markers={route.stops.map(s => ({ id: s.id, position: { lat: s.lat, lng: s.lng }, label: String(s.order), color: "#2563eb" }))}
            routePath={route.stops.map(s => ({ lat: s.lat, lng: s.lng }))}
          />
        </CardContent>
      </Card>

      {/* Upcoming stops */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Upcoming Stops</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {route.stops.map((stop) => {
              const stopStudents = busStudents.filter(s => s.pickupLocation === stop.name);
              return (
                <div key={stop.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{stop.order}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.estimatedTime}</p>
                    {stopStudents.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{stopStudents.map(s => s.name).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
