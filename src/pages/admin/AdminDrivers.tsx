import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { drivers, getBusById } from "@/data/mockData";
import { Plus, Pencil } from "lucide-react";

export default function AdminDrivers() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Driver Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Driver</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input placeholder="Full name" /></div>
              <div><Label>Phone</Label><Input placeholder="+91 98765 43210" /></div>
              <div><Label>Email</Label><Input type="email" placeholder="driver@school.com" /></div>
              <div><Label>License Number</Label><Input placeholder="DL-1420110012345" /></div>
              <Button className="w-full" onClick={() => setOpen(false)}>Save Driver</Button>
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
                <TableHead>Assigned Bus</TableHead>
                <TableHead>Duty Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{getBusById(d.busId)?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={d.dutyStatus === "on-duty" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                      {d.dutyStatus}
                    </Badge>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
