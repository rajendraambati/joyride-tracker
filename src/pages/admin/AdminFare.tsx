import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fares, getStudentById, getParentById } from "@/data/mockData";
import { Bell, Filter } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
};

export default function AdminFare() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? fares : fares.filter(f => f.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bus Fare</h2>
        <div className="flex gap-2">
          {["all", "paid", "unpaid", "overdue"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => {
                const student = getStudentById(f.studentId);
                const parent = student ? getParentById(student.parentId) : null;
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{student?.name}</TableCell>
                    <TableCell>{parent?.name}</TableCell>
                    <TableCell>{f.month}</TableCell>
                    <TableCell>₹{f.amount}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColors[f.status]}>{f.status}</Badge></TableCell>
                    <TableCell>{f.reminderSent ? "Sent" : "—"}</TableCell>
                    <TableCell>
                      {f.status !== "paid" && (
                        <Button variant="outline" size="sm"><Bell className="mr-1 h-3 w-3" /> Remind</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
