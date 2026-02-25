import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buses, getDriverById, getRouteById } from "@/data/mockData";
import { Plus, Pencil } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  maintenance: "bg-amber-100 text-amber-700",
};

export default function AdminBuses() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bus Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Bus</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Bus</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Bus Name</Label><Input placeholder="Bus Alpha" /></div>
              <div><Label>Registration Number</Label><Input placeholder="KA-01-AB-1234" /></div>
              <div><Label>Capacity</Label><Input type="number" placeholder="40" /></div>
              <Button className="w-full" onClick={() => setOpen(false)}>Save Bus</Button>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell>{bus.registrationNumber}</TableCell>
                  <TableCell>{getDriverById(bus.driverId)?.name ?? "—"}</TableCell>
                  <TableCell>{getRouteById(bus.routeId)?.name ?? "—"}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[bus.status]}>{bus.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
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
