import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminDrivers() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "", license_number: "" });
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*, buses(name)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setDrivers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    setSaving(true);
    const { error } = await supabase.from("drivers").insert({
      name: form.name, phone: form.phone, email: form.email, license_number: form.license_number,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Driver added");
    setForm({ name: "", phone: "", email: "", license_number: "" });
    setOpen(false);
    fetchDrivers();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Driver Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Driver</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="driver@school.com" /></div>
              <div><Label>License Number</Label><Input value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} placeholder="DL-1420110012345" /></div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Driver</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead>Duty Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No drivers added yet</TableCell></TableRow>
              ) : drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.license_number}</TableCell>
                  <TableCell>{d.buses?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={d.duty_status === "on-duty" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                      {d.duty_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
