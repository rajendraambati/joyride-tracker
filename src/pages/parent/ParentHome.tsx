import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Bus, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ParentHome() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("students").select("*, buses!fk_students_bus(name, status, registration_number)").eq("parent_id", user.id),
      supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_read", false).order("created_at", { ascending: false }).limit(5),
    ]).then(([studentsRes, notifsRes]) => {
      setChildren(studentsRes.data ?? []);
      setNotifications(notifsRes.data ?? []);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Notification banner */}
      {notifications.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{notifications[0].title}</p>
              <p className="text-xs text-muted-foreground">{notifications[0].message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold">My Children's Buses</h2>

      {children.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No children linked to your account yet.</p>
      )}

      {children.map((child) => (
        <Card key={child.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bus className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{child.name} — {child.buses?.name || "No bus assigned"}</p>
                  <p className="text-xs text-muted-foreground">{child.buses?.registration_number || ""}</p>
                </div>
              </div>
              <Badge variant="secondary" className={child.is_absent ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
                {child.is_absent ? "Absent" : "Present"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Pickup: {child.pickup_location || "—"} → Drop: {child.drop_location || "—"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
