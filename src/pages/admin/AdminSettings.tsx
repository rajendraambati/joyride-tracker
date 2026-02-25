import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const { toast } = useToast();

  const handleCreateUser = async () => {
    if (!name || !email || !password || !role) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { name, email, phone, password, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "User created!", description: `${name} (${role}) — credentials: ${email} / ${password}` });
      setOpen(false);
      setName(""); setEmail(""); setPhone(""); setPassword(""); setRole("");
    } catch (err: any) {
      toast({ title: "Failed to create user", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Settings</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Create User Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" /></div>
              <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
              <div><Label>Password</Label><Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Initial password" /></div>
              <p className="text-xs text-muted-foreground">Share the email and password with the user so they can log in.</p>
              <Button className="w-full" onClick={handleCreateUser} disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
