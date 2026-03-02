import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Navigation, Clock, Ruler, MapPin, MousePointerClick } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BusMap, { RouteInfo } from "@/components/BusMap";
import { ScrollArea } from "@/components/ui/scroll-area";

const emptyForm = { name: "", source: "", destination: "" };
const emptyStopForm = { name: "", lat: "", lng: "", estimated_time: "" };

export default function AdminRoutes() {
  const [open, setOpen] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Stop management state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState(emptyStopForm);
  const [editStopId, setEditStopId] = useState<string | null>(null);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [addingViaMap, setAddingViaMap] = useState(false);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("*, buses!fk_routes_bus(name), route_stops(*)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRoutes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRoutes(); }, []);

  // Auto-select first route
  useEffect(() => {
    if (routes.length > 0 && !selectedRouteId) setSelectedRouteId(routes[0].id);
  }, [routes, selectedRouteId]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({ name: r.name, source: r.source || "", destination: r.destination || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Route name is required"); return; }
    setSaving(true);
    const payload = { name: form.name, source: form.source, destination: form.destination };
    const { error } = editId
      ? await supabase.from("routes").update(payload).eq("id", editId)
      : await supabase.from("routes").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Route updated" : "Route added");
    setOpen(false);
    fetchRoutes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("routes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Route deleted");
    if (selectedRouteId === id) setSelectedRouteId(null);
    fetchRoutes();
  };

  // Stop CRUD
  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const selectedStops = (selectedRoute?.route_stops ?? []).sort((a: any, b: any) => a.stop_order - b.stop_order);

  const openAddStop = () => {
    setEditStopId(null);
    setStopForm(emptyStopForm);
    setStopDialogOpen(true);
  };

  const openEditStop = (s: any) => {
    setEditStopId(s.id);
    setStopForm({ name: s.name, lat: String(s.lat), lng: String(s.lng), estimated_time: s.estimated_time || "" });
    setStopDialogOpen(true);
  };

  const handleSaveStop = async () => {
    if (!selectedRouteId) return;
    if (!stopForm.name || !stopForm.lat || !stopForm.lng) { toast.error("Name and coordinates required"); return; }
    const lat = parseFloat(stopForm.lat);
    const lng = parseFloat(stopForm.lng);
    if (isNaN(lat) || isNaN(lng)) { toast.error("Invalid coordinates"); return; }

    setSaving(true);
    if (editStopId) {
      const { error } = await supabase.from("route_stops").update({
        name: stopForm.name, lat, lng, estimated_time: stopForm.estimated_time,
      }).eq("id", editStopId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Stop updated");
    } else {
      const nextOrder = selectedStops.length > 0 ? Math.max(...selectedStops.map((s: any) => s.stop_order)) + 1 : 1;
      const { error } = await supabase.from("route_stops").insert({
        route_id: selectedRouteId, name: stopForm.name, lat, lng,
        stop_order: nextOrder, estimated_time: stopForm.estimated_time,
      });
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Stop added");
    }
    setSaving(false);
    setStopDialogOpen(false);
    setAddingViaMap(false);
    fetchRoutes();
  };

  const handleDeleteStop = async (id: string) => {
    const { error } = await supabase.from("route_stops").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Stop deleted");
    fetchRoutes();
  };

  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    if (!addingViaMap || !selectedRouteId) return;
    setStopForm(f => ({
      ...f,
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
      name: f.name || `Stop ${selectedStops.length + 1}`,
    }));
    setStopDialogOpen(true);
  }, [addingViaMap, selectedRouteId, selectedStops.length]);

  // Map data for selected route
  const routeStopMarkers = selectedStops.map((s: any) => ({
    id: s.id,
    position: { lat: s.lat, lng: s.lng },
    label: String(s.stop_order),
    color: "#2563eb",
  }));

  const routeStopPath = selectedStops.map((s: any) => ({ lat: s.lat, lng: s.lng }));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Route Management</h2>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Route</Button>
      </div>

      {/* Route form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Route" : "Add Route"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Route Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Route North" /></div>
            <div><Label>Source</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="MG Road" /></div>
            <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="School Campus" /></div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? "Update Route" : "Save Route"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop form dialog */}
      <Dialog open={stopDialogOpen} onOpenChange={(v) => { setStopDialogOpen(v); if (!v) setAddingViaMap(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStopId ? "Edit Stop" : "Add Stop"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Stop Name</Label><Input value={stopForm.name} onChange={e => setStopForm(f => ({ ...f, name: e.target.value }))} placeholder="MG Road Stop" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Latitude</Label><Input value={stopForm.lat} onChange={e => setStopForm(f => ({ ...f, lat: e.target.value }))} placeholder="12.9716" /></div>
              <div><Label>Longitude</Label><Input value={stopForm.lng} onChange={e => setStopForm(f => ({ ...f, lng: e.target.value }))} placeholder="77.5946" /></div>
            </div>
            <div><Label>Estimated Time</Label><Input value={stopForm.estimated_time} onChange={e => setStopForm(f => ({ ...f, estimated_time: e.target.value }))} placeholder="8:15 AM" /></div>
            <Button className="w-full" onClick={handleSaveStop} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editStopId ? "Update Stop" : "Add Stop"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Routes table */}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No routes added yet</TableCell></TableRow>
                ) : routes.map((r) => (
                  <TableRow
                    key={r.id}
                    className={`cursor-pointer ${selectedRouteId === r.id ? "bg-muted/50" : ""}`}
                    onClick={() => setSelectedRouteId(r.id)}
                  >
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell>{r.destination}</TableCell>
                    <TableCell>{r.route_stops?.length ?? 0}</TableCell>
                    <TableCell>{r.buses?.name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {r.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This will also delete all stops on this route.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(r.id)}>Delete</AlertDialogAction>
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

        {/* Map + route details + stops */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedRoute ? selectedRoute.name : "Select a route"}
                </CardTitle>
                {selectedRouteId && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={addingViaMap ? "default" : "outline"}
                      onClick={() => { setAddingViaMap(!addingViaMap); setEditStopId(null); setStopForm(emptyStopForm); }}
                    >
                      <MousePointerClick className="mr-1.5 h-3.5 w-3.5" />
                      {addingViaMap ? "Cancel" : "Click to Add"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={openAddStop}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Stop
                    </Button>
                  </div>
                )}
              </div>
              {addingViaMap && (
                <p className="text-xs text-muted-foreground mt-1">Click on the map to place a new stop</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <BusMap
                height="288px"
                markers={routeStopMarkers}
                routePath={routeStopPath.length >= 2 ? routeStopPath : undefined}
                useRouting={routeStopPath.length >= 2}
                onRouteInfo={setRouteInfo}
                onMapClick={addingViaMap ? handleMapClick : undefined}
              />
            </CardContent>
          </Card>

          {/* Route info */}
          {routeInfo && selectedStops.length >= 2 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" /> Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{(routeInfo.distance / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{Math.round(routeInfo.duration / 60)} min</span>
                  </div>
                </div>
                {routeInfo.steps.length > 0 && (
                  <ScrollArea className="h-48">
                    <div className="space-y-1.5 pr-3">
                      {routeInfo.steps.filter(s => s.instruction).map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/50">
                          <span className="text-muted-foreground font-mono w-5 shrink-0">{i + 1}.</span>
                          <span className="flex-1">{step.instruction}</span>
                          <span className="text-muted-foreground shrink-0">{(step.distance / 1000).toFixed(1)}km</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stops list */}
          {selectedRouteId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stops ({selectedStops.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStops.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No stops yet. Click "Add Stop" or use "Click to Add" on the map.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStops.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {s.stop_order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                            {s.estimated_time ? ` · ${s.estimated_time}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditStop(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete stop "{s.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This stop will be permanently removed from the route.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStop(s.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
