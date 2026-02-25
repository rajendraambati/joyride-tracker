import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  maintenance: "bg-amber-100 text-amber-700",
};

const emptyForm = { name: "", registration_number: "", capacity: "40", status: "active" };

export default function AdminBuses() {
  const [open, setOpen] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBuses = async () => {
    const { data, error } = await supabase
      .from("buses")
      .select("*, drivers!fk_buses_driver(name), routes!fk_buses_route(name)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setBuses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBuses(); }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (bus: any) => {
    setEditId(bus.id);
    setForm({ name: bus.name, registration_number: bus.registration_number, capacity: String(bus.capacity), status: bus.status });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.registration_number) { toast.error("Name and registration are required"); return; }
    setSaving(true);
    const payload = { name: form.name, registration_number: form.registration_number, capacity: parseInt(form.capacity) || 40, status: form.status };
    const { error } = editId
      ? await supabase.from("buses").update(payload).eq("id", editId)
      : await supabase.from("buses").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Bus updated" : "Bus added");
    setOpen(false);
    fetchBuses();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("buses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Bus deleted");
    fetchBuses();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bus Management</h2>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Bus</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Bus" : "Add New Bus"}</DialogTitle></DialogHeader>
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
            <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? "Update Bus" : "Save Bus"}</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No buses added yet</TableCell></TableRow>
              ) : buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell>{bus.registration_number}</TableCell>
                  <TableCell>{bus.drivers?.name ?? "—"}</TableCell>
                  <TableCell>{bus.routes?.name ?? "—"}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusColors[bus.status]}>{bus.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(bus)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {bus.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(bus.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
