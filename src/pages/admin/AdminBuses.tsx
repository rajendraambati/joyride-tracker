import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  maintenance: "bg-amber-100 text-amber-700",
};

interface BusRow {
  id: string;
  name: string;
  registration_number: string;
  capacity: number;
  driver_id: string | null;
  route_id: string | null;
  status: string;
  drivers?: { name: string } | null;
  routes?: { name: string } | null;
}

export default function AdminBuses() {
  const [open, setOpen] = useState(false);
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", registration_number: "", capacity: "40", status: "active" });
  const [saving, setSaving] = useState(false);

  const fetchBuses = async () => {
    const { data, error } = await supabase
      .from("buses")
      .select("*, drivers(name), routes(name)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setBuses((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBuses(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.registration_number) { toast.error("Name and registration are required"); return; }
    setSaving(true);
    const { error } = await supabase.from("buses").insert({
      name: form.name,
      registration_number: form.registration_number,
      capacity: parseInt(form.capacity) || 40,
      status: form.status,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bus added");
    setForm({ name: "", registration_number: "", capacity: "40", status: "active" });
    setOpen(false);
    fetchBuses();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bus Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Bus</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Bus</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Bus Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bus Alpha" /></div>
              <div><Label>Registration Number</Label><Input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} placeholder="KA-01-AB-1234" /></div>
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Bus</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No buses added yet</TableCell></TableRow>
              ) : buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell>{bus.registration_number}</TableCell>
                  <TableCell>{(bus as any).drivers?.name ?? "—"}</TableCell>
                  <TableCell>{(bus as any).routes?.name ?? "—"}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusColors[bus.status]}>{bus.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
