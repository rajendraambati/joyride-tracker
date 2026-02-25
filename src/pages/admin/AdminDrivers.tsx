import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyForm = { name: "", phone: "", email: "", license_number: "" };

export default function AdminDrivers() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    const { data, error } = await supabase.from("drivers").select("*, buses!fk_drivers_bus(name)").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setDrivers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (d: any) => {
    setEditId(d.id);
    setForm({ name: d.name, phone: d.phone || "", email: d.email, license_number: d.license_number || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    setSaving(true);
    const payload = { name: form.name, phone: form.phone, email: form.email, license_number: form.license_number };
    const { error } = editId
      ? await supabase.from("drivers").update(payload).eq("id", editId)
      : await supabase.from("drivers").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Driver updated" : "Driver added");
    setOpen(false);
    fetchDrivers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("drivers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Driver deleted");
    fetchDrivers();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Driver Management</h2>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Driver</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Driver" : "Add New Driver"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="driver@school.com" /></div>
            <div><Label>License Number</Label><Input value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} placeholder="DL-1420110012345" /></div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? "Update Driver" : "Save Driver"}</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No drivers added yet</TableCell></TableRow>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {d.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction>
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
