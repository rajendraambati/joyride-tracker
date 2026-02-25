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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusOptions = [
  { value: "active", label: "Active", className: "bg-green-100 text-green-700" },
  { value: "graduated", label: "Graduated", className: "bg-blue-100 text-blue-700" },
  { value: "transferred", label: "Transferred", className: "bg-amber-100 text-amber-700" },
  { value: "left", label: "Left School", className: "bg-red-100 text-red-700" },
];

const emptyStudentForm = {
  name: "", standard: "", pickup_location: "", drop_location: "",
  enrollment_status: "active", bus_id: "", parent_id: "",
};

export default function AdminStudents() {
  const [openStudent, setOpenStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");

  const fetchData = async () => {
    const [studentsRes, profilesRes, rolesRes, busesRes] = await Promise.all([
      supabase.from("students").select("*, buses!fk_students_bus(name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("buses").select("id, name").order("name"),
    ]);
    if (studentsRes.error) toast.error(studentsRes.error.message);
    setStudents(studentsRes.data ?? []);
    setBuses(busesRes.data ?? []);

    const parentUserIds = new Set(
      (rolesRes.data ?? []).filter((r: any) => r.role === "parent").map((r: any) => r.user_id)
    );
    const parentProfiles = (profilesRes.data ?? []).filter((p: any) => parentUserIds.has(p.user_id));
    setParents(parentProfiles);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.standard || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.enrollment_status === statusFilter;
    const matchesBus = busFilter === "all" || s.bus_id === busFilter || (busFilter === "none" && !s.bus_id);
    return matchesSearch && matchesStatus && matchesBus;
  });

  const openAddStudent = () => { setEditStudentId(null); setStudentForm(emptyStudentForm); setOpenStudent(true); };
  const openEditStudent = (s: any) => {
    setEditStudentId(s.id);
    setStudentForm({
      name: s.name, standard: s.standard || "",
      pickup_location: s.pickup_location || "", drop_location: s.drop_location || "",
      enrollment_status: s.enrollment_status || "active",
      bus_id: s.bus_id || "", parent_id: s.parent_id || "",
    });
    setOpenStudent(true);
  };

  const handleSaveStudent = async () => {
    if (!studentForm.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload: any = {
      name: studentForm.name,
      standard: studentForm.standard,
      pickup_location: studentForm.pickup_location,
      drop_location: studentForm.drop_location,
      enrollment_status: studentForm.enrollment_status,
      bus_id: studentForm.bus_id || null,
      parent_id: studentForm.parent_id || null,
    };
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

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("students").update({ enrollment_status: newStatus }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find((o) => o.value === status) || statusOptions[0];
    return <Badge variant="secondary" className={opt.className}>{opt.label}</Badge>;
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "—";
    const p = parents.find((pr) => pr.user_id === parentId);
    return p?.name || "—";
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const activeCount = students.filter((s) => s.enrollment_status === "active").length;
  const inactiveCount = students.length - activeCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Students & Parents</h2>
          <p className="text-sm text-muted-foreground">{activeCount} active · {inactiveCount} inactive · {students.length} total</p>
        </div>
      </div>

      {/* Student Form Dialog */}
      <Dialog open={openStudent} onOpenChange={setOpenStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editStudentId ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" /></div>
            <div><Label>Standard / Class</Label><Input value={studentForm.standard} onChange={e => setStudentForm(f => ({ ...f, standard: e.target.value }))} placeholder="5th" /></div>
            <div>
              <Label>Enrollment Status</Label>
              <Select value={studentForm.enrollment_status} onValueChange={v => setStudentForm(f => ({ ...f, enrollment_status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Bus</Label>
              <Select value={studentForm.bus_id || "none"} onValueChange={v => setStudentForm(f => ({ ...f, bus_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No bus assigned</SelectItem>
                  {buses.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parent</Label>
              <Select value={studentForm.parent_id || "none"} onValueChange={v => setStudentForm(f => ({ ...f, parent_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent linked</SelectItem>
                  {parents.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.name} ({p.email})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Pickup Location</Label><Input value={studentForm.pickup_location} onChange={e => setStudentForm(f => ({ ...f, pickup_location: e.target.value }))} placeholder="MG Road Junction" /></div>
            <div><Label>Drop Location</Label><Input value={studentForm.drop_location} onChange={e => setStudentForm(f => ({ ...f, drop_location: e.target.value }))} placeholder="School Gate A" /></div>
            <Button className="w-full" onClick={handleSaveStudent} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editStudentId ? "Update Student" : "Save Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or class..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={busFilter} onValueChange={setBusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bus" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buses</SelectItem>
                <SelectItem value="none">No Bus</SelectItem>
                {buses.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openAddStudent}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {students.length === 0 ? "No students added yet" : "No students match the current filters"}
                    </TableCell></TableRow>
                  ) : filteredStudents.map((s) => (
                    <TableRow key={s.id} className={s.enrollment_status !== "active" ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.standard || "—"}</TableCell>
                      <TableCell>
                        <Select value={s.enrollment_status || "active"} onValueChange={(v) => handleQuickStatusChange(s.id, v)}>
                          <SelectTrigger className="h-7 w-[120px] text-xs border-0 bg-transparent p-0">
                            {getStatusBadge(s.enrollment_status || "active")}
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{s.buses?.name ?? "—"}</TableCell>
                      <TableCell>{getParentName(s.parent_id)}</TableCell>
                      <TableCell>{s.pickup_location || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditStudent(s)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {s.name}?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. The student record will be permanently removed.</AlertDialogDescription>
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
                    <TableHead>Children</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No parents registered yet</TableCell></TableRow>
                  ) : parents.map((p) => {
                    const childNames = students.filter((s) => s.parent_id === p.user_id).map((s) => s.name);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.phone || "—"}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.address || "—"}</TableCell>
                        <TableCell>{childNames.length > 0 ? childNames.join(", ") : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
