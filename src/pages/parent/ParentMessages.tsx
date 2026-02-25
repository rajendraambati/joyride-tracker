import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { notifications, messages } from "@/data/mockData";
import { Bell, Send, AlertTriangle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ParentMessages() {
  const parentNotifs = notifications.filter(n => n.userId === "p1");
  const parentMessages = messages.filter(m => m.fromRole === "parent" || m.toRole === "parent");
  const [issue, setIssue] = useState("");
  const { toast } = useToast();

  const sendIssue = () => {
    if (!issue.trim()) return;
    toast({ title: "Issue Reported", description: "Your message has been sent to the admin." });
    setIssue("");
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Notifications</h2>

      <div className="space-y-2">
        {parentNotifs.map((n) => (
          <Card key={n.id} className={!n.read ? "border-primary/30" : ""}>
            <CardContent className="p-3 flex items-start gap-3">
              <Bell className={`h-5 w-5 mt-0.5 ${n.type === "alert" ? "text-amber-500" : "text-primary"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.timestamp}</p>
              </div>
              {!n.read && <Badge className="text-xs">New</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-bold pt-2">Report an Issue</h2>
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Describe your issue (e.g., bus was late, driver not answering)..."
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            rows={3}
          />
          <Button className="w-full" onClick={sendIssue}>
            <Send className="mr-2 h-4 w-4" /> Send to Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
