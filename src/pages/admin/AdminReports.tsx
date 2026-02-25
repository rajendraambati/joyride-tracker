import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trips, buses, drivers, students, getDriverById, getBusById, getRouteById } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const tripsPerBus = buses.map(b => ({
  name: b.name,
  trips: trips.filter(t => t.busId === b.id).length,
}));

const attendanceData = [
  { name: "Present", value: students.filter(s => !s.isAbsent).length },
  { name: "Absent", value: students.filter(s => s.isAbsent).length },
];

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Trips per Bus</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tripsPerBus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Student Attendance Today</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Trip History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{getBusById(t.busId)?.name}</TableCell>
                  <TableCell>{getDriverById(t.driverId)?.name}</TableCell>
                  <TableCell>{getRouteById(t.routeId)?.name}</TableCell>
                  <TableCell>{t.startTime || "—"}</TableCell>
                  <TableCell>{t.endTime || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      t.status === "completed" ? "bg-green-100 text-green-700" :
                      t.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                      "bg-muted text-muted-foreground"
                    }>{t.status}</Badge>
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
