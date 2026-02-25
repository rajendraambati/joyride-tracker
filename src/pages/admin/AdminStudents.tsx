import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyStudentForm = { name: "", standard: "", pickup_location: "", drop_location: "" };

export default function AdminStudents() {
  const [openStudent, setOpenStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [studentsRes, parentsRes] = await Promise.all([
      supabase.from("students").select("*, buses!fk_students_bus(name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }),
    ]);
    if (studentsRes.error) toast.error(studentsRes.error.message);
    setStudents(studentsRes.data ?? []);
    const parentProfiles = (parentsRes.data ?? []).filter((p: any) => p.user_roles?.role === "parent");
    setParents(parentProfiles);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAddStudent = () => { setEditStudentId(null); setStudentForm(emptyStudentForm); setOpenStudent(true); };
  const openEditStudent = (s: any) => {
    setEditStudentId(s.id);
    setStudentForm({ name: s.name, standard: s.standard || "", pickup_location: s.pickup_location || "", drop_location: s.drop_location || "" });
    setOpenStudent(true);
  };

  const handleSaveStudent = async () => {
    if (!studentForm.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = { name: studentForm.name, standard: studentForm.standard, pickup_location: studentForm.pickup_location, drop_location: studentForm.drop_location };
    const { error } = editStudentId
      ? await supabase.from("students").update(payload).eq("id", editStudentId)
      : await supabase.from("students").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editStudentId ? "Student updated" : "Student added");
    setOpenStudent(false);
    fetchData();
  };

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Student deleted");
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Students & Parents</h2>

      <Dialog open={openStudent} onOpenChange={setOpenStudent}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStudentId ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" /></div>
            <div><Label>Standard/Class</Label><Input value={studentForm.standard} onChange={e => setStudentForm(f => ({ ...f, standard: e.target.value }))} placeholder="5th" /></div>
            <div><Label>Pickup Location</Label><Input value={studentForm.pickup_location} onChange={e => setStudentForm(f => ({ ...f, pickup_location: e.target.value }))} placeholder="MG Road Junction" /></div>
            <div><Label>Drop Location</Label><Input value={studentForm.drop_location} onChange={e => setStudentForm(f => ({ ...f, drop_location: e.target.value }))} placeholder="School Gate A" /></div>
            <Button className="w-full" onClick={handleSaveStudent} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editStudentId ? "Update" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddStudent}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students added yet</TableCell></TableRow>
                  ) : students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.standard}</TableCell>
                      <TableCell>{s.buses?.name ?? "—"}</TableCell>
                      <TableCell>{s.pickup_location}</TableCell>
                      <TableCell>
                        {s.is_absent
                          ? <Badge variant="secondary" className="bg-amber-100 text-amber-700">Absent</Badge>
                          : <Badge variant="secondary" className="bg-green-100 text-green-700">Present</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditStudent(s)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {s.name}?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStudent(s.id)}>Delete</AlertDialogAction>
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
        </TabsContent>

        <TabsContent value="parents" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No parents registered yet</TableCell></TableRow>
                  ) : parents.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone || "—"}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.address || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
