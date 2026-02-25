import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BusMap from "@/components/BusMap";

export default function AdminRoutes() {
  const [open, setOpen] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", source: "", destination: "" });
  const [saving, setSaving] = useState(false);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("*, buses(name), route_stops(*)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRoutes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error("Route name is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("routes").insert({
      name: form.name, source: form.source, destination: form.destination,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Route added");
    setForm({ name: "", source: "", destination: "" });
    setOpen(false);
    fetchRoutes();
  };

  const allStops = routes.flatMap(r =>
    (r.route_stops ?? [])
      .sort((a: any, b: any) => a.stop_order - b.stop_order)
      .map((s: any) => ({
        id: s.id,
        position: { lat: s.lat, lng: s.lng },
        label: String(s.stop_order),
        color: "#2563eb",
      }))
  );

  const firstRouteStops = routes[0]?.route_stops
    ?.sort((a: any, b: any) => a.stop_order - b.stop_order)
    .map((s: any) => ({ lat: s.lat, lng: s.lng }));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Route Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Route</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Route</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Route Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Route North" /></div>
              <div><Label>Source</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="MG Road" /></div>
              <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="School Campus" /></div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Route</Button>
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
                {routes.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No routes added yet</TableCell></TableRow>
                ) : routes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell>{r.destination}</TableCell>
                    <TableCell>{r.route_stops?.length ?? 0}</TableCell>
                    <TableCell>{r.buses?.name ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <BusMap
              height="288px"
              markers={allStops}
              routePath={firstRouteStops}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
