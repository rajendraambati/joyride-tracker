import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">Settings</h2>

      <Card>
        <CardHeader><CardTitle className="text-base">School Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>School Name</Label><Input defaultValue="Springfield International School" /></div>
          <div><Label>Address</Label><Input defaultValue="123 Education Lane, Bangalore 560001" /></div>
          <div><Label>Contact Phone</Label><Input defaultValue="+91 80 1234 5678" /></div>
          <div><Label>Email</Label><Input defaultValue="admin@springfield.edu" /></div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notification Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Default pickup alert radius (meters)</Label><Input type="number" defaultValue="500" /></div>
          <div><Label>Trip start notification</Label><Input defaultValue="Enabled" disabled /></div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
