import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Users, GraduationCap, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BusMap from "@/components/BusMap";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ buses: 0, drivers: 0, students: 0, routes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const [b, d, s, r] = await Promise.all([
        supabase.from("buses").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("routes").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        buses: b.count ?? 0,
        drivers: d.count ?? 0,
        students: s.count ?? 0,
        routes: r.count ?? 0,
      });
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "Total Buses", value: counts.buses, icon: Bus, color: "text-primary" },
    { label: "Total Routes", value: counts.routes, icon: MapPin, color: "text-green-600" },
    { label: "Total Students", value: counts.students, icon: GraduationCap, color: "text-amber-600" },
    { label: "Total Drivers", value: counts.drivers, icon: Users, color: "text-purple-600" },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Live Bus Map</CardTitle></CardHeader>
          <CardContent>
            <BusMap height="320px" markers={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You have {counts.buses} buses, {counts.drivers} drivers, {counts.students} students, and {counts.routes} routes configured.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to manage each entity. Add buses and routes first, then assign drivers and students.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
