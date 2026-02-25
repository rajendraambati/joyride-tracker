import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudentsByParent, getBusById } from "@/data/mockData";
import { GraduationCap, MapPin, CalendarX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ParentChildren() {
  const children = getStudentsByParent("p1");
  const [absents, setAbsents] = useState<Record<string, boolean>>(
    Object.fromEntries(children.map(c => [c.id, c.isAbsent]))
  );
  const { toast } = useToast();

  const toggleAbsent = (id: string) => {
    setAbsents(prev => {
      const next = { ...prev, [id]: !prev[id] };
      toast({
        title: next[id] ? "Marked absent" : "Marked present",
        description: `Updated attendance for today.`,
      });
      return next;
    });
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">My Children</h2>

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
                  <p className="text-xs text-muted-foreground">Class {child.standard}</p>
                </div>
              </div>
              {absents[child.id] ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">Absent</Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-700">Present</Badge>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Pickup: {child.pickupLocation}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Drop: {child.dropLocation}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> Bus: {getBusById(child.busId)?.name}
              </div>
            </div>

            <Button
              variant={absents[child.id] ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => toggleAbsent(child.id)}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              {absents[child.id] ? "Mark Present" : "Mark Absent Today"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
