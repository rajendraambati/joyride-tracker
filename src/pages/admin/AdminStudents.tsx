import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parents, students, getParentById, getBusById } from "@/data/mockData";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminStudents() {
  const [openParent, setOpenParent] = useState(false);
  const [openStudent, setOpenStudent] = useState(false);

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
                  <div><Label>Name</Label><Input placeholder="Student name" /></div>
                  <div><Label>Standard/Class</Label><Input placeholder="5th" /></div>
                  <div><Label>Pickup Location</Label><Input placeholder="MG Road Junction" /></div>
                  <div><Label>Drop Location</Label><Input placeholder="School Gate A" /></div>
                  <Button className="w-full" onClick={() => setOpenStudent(false)}>Save</Button>
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
                    <TableHead>Parent</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.standard}</TableCell>
                      <TableCell>{getParentById(s.parentId)?.name}</TableCell>
                      <TableCell>{getBusById(s.busId)?.name}</TableCell>
                      <TableCell>{s.pickupLocation}</TableCell>
                      <TableCell>
                        {s.isAbsent ? <Badge variant="secondary" className="bg-amber-100 text-amber-700">Absent</Badge> : <Badge variant="secondary" className="bg-green-100 text-green-700">Present</Badge>}
                      </TableCell>
                      <TableCell><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openParent} onOpenChange={setOpenParent}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Parent</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Parent</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input placeholder="Parent name" /></div>
                  <div><Label>Phone</Label><Input placeholder="+91 99876 54321" /></div>
                  <div><Label>Email</Label><Input type="email" /></div>
                  <div><Label>Address</Label><Input placeholder="Address" /></div>
                  <Button className="w-full" onClick={() => setOpenParent(false)}>Save</Button>
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
                    <TableHead>Address</TableHead>
                    <TableHead>Children</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.address}</TableCell>
                      <TableCell>{p.childrenIds.length}</TableCell>
                      <TableCell><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></TableCell>
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
