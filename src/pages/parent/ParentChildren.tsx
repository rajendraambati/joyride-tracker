import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, CalendarX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ParentChildren() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("students")
      .select("*, buses!fk_students_bus(name)")
      .eq("parent_id", user.id)
      .order("name");
    if (error) { toast({ title: "Error loading children", description: error.message, variant: "destructive" }); return; }
    setChildren(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchChildren(); }, [user?.id]);

  const toggleAbsent = async (student: any) => {
    const newAbsent = !student.is_absent;
    const { error } = await supabase
      .from("students")
      .update({ is_absent: newAbsent })
      .eq("id", student.id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: newAbsent ? "Marked absent" : "Marked present", description: "Updated attendance for today." });
    fetchChildren();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">My Children</h2>

      {children.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No children linked to your account yet. Contact the school admin.</p>
      )}

      {children.map((child) => (
        <Card key={child.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {child.name[0]}
                </div>
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-xs text-muted-foreground">Class {child.standard || "—"}</p>
                </div>
              </div>
              {child.is_absent ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">Absent</Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-700">Present</Badge>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Pickup: {child.pickup_location || "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Drop: {child.drop_location || "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> Bus: {child.buses?.name || "—"}
              </div>
            </div>

            <Button
              variant={child.is_absent ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => toggleAbsent(child)}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              {child.is_absent ? "Mark Present" : "Mark Absent Today"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
