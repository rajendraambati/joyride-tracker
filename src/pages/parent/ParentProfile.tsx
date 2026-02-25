import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fares, getStudentById, getStudentsByParent } from "@/data/mockData";
import { User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ParentProfile() {
  const { toast } = useToast();
  const children = getStudentsByParent("p1");
  const childFares = children.flatMap(c => fares.filter(f => f.studentId === c.id));

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">My Profile</h2>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Name</Label><Input defaultValue="Anita Sharma" /></div>
          <div><Label>Phone</Label><Input defaultValue="+91 99876 54321" /></div>
          <div><Label>Email</Label><Input defaultValue="anita@email.com" /></div>
          <div><Label>Address</Label><Input defaultValue="12, MG Road, Bangalore" /></div>
          <Button onClick={() => toast({ title: "Profile Updated" })}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Bus Fare & Payment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {childFares.map((f) => {
            const student = getStudentById(f.studentId);
            return (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{student?.name}</p>
                  <p className="text-xs text-muted-foreground">{f.month} • ₹{f.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusColors[f.status]}>{f.status}</Badge>
                  {f.status !== "paid" && (
                    <Button size="sm" onClick={() => toast({ title: "Payment Initiated", description: "Mock payment gateway" })}>
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
