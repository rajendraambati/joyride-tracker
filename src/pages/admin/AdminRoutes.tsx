import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes, getBusById } from "@/data/mockData";
import { Plus, MapPin } from "lucide-react";
import { useState } from "react";

export default function AdminRoutes() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Route Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Route</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Route</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Route Name</Label><Input placeholder="Route North" /></div>
              <div><Label>Source</Label><Input placeholder="MG Road" /></div>
              <div><Label>Destination</Label><Input placeholder="School Campus" /></div>
              <Button className="w-full" onClick={() => setOpen(false)}>Save Route</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Bus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell>{r.destination}</TableCell>
                    <TableCell>{r.stops.length}</TableCell>
                    <TableCell>{getBusById(r.busId)?.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="h-72 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
              <div className="text-center space-y-2">
                <MapPin className="h-8 w-8 mx-auto opacity-40" />
                <p className="font-medium">Route Map</p>
                <p className="text-sm">Google Maps route visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
