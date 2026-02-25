import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminStudents() {
  const [openStudent, setOpenStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState({ name: "", standard: "", pickup_location: "", drop_location: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [studentsRes, parentsRes] = await Promise.all([
      supabase.from("students").select("*, buses(name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }),
    ]);
    if (studentsRes.error) toast.error(studentsRes.error.message);
    setStudents(studentsRes.data ?? []);
    // Filter to only parent profiles
    const parentProfiles = (parentsRes.data ?? []).filter((p: any) => p.user_roles?.role === "parent");
    setParents(parentProfiles);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveStudent = async () => {
    if (!studentForm.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("students").insert({
      name: studentForm.name,
      standard: studentForm.standard,
      pickup_location: studentForm.pickup_location,
      drop_location: studentForm.drop_location,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Student added");
    setStudentForm({ name: "", standard: "", pickup_location: "", drop_location: "" });
    setOpenStudent(false);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Students & Parents</h2>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openStudent} onOpenChange={setOpenStudent}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Student</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" /></div>
                  <div><Label>Standard/Class</Label><Input value={studentForm.standard} onChange={e => setStudentForm(f => ({ ...f, standard: e.target.value }))} placeholder="5th" /></div>
                  <div><Label>Pickup Location</Label><Input value={studentForm.pickup_location} onChange={e => setStudentForm(f => ({ ...f, pickup_location: e.target.value }))} placeholder="MG Road Junction" /></div>
                  <div><Label>Drop Location</Label><Input value={studentForm.drop_location} onChange={e => setStudentForm(f => ({ ...f, drop_location: e.target.value }))} placeholder="School Gate A" /></div>
                  <Button className="w-full" onClick={handleSaveStudent} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
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
                    <TableHead>Class</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students added yet</TableCell></TableRow>
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
