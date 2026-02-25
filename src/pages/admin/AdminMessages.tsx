import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { messages } from "@/data/mockData";
import { Send, AlertTriangle, Mail, MailOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminMessages() {
  const [open, setOpen] = useState(false);
  const inbox = messages.filter(m => m.toRole === "admin");
  const sent = messages.filter(m => m.fromRole === "admin");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Messages</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Send className="mr-2 h-4 w-4" /> New Message</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Message</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>To</Label><Input placeholder="All Parents / All Drivers / Individual" /></div>
              <div><Label>Subject</Label><Input placeholder="Subject" /></div>
              <div><Label>Message</Label><Textarea placeholder="Type your message..." rows={4} /></div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setOpen(false)}>Send</Button>
                <Button variant="destructive" onClick={() => setOpen(false)}><AlertTriangle className="mr-2 h-4 w-4" /> Emergency Broadcast</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({inbox.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-2">
          {inbox.map((msg) => (
            <Card key={msg.id} className={msg.isEmergency ? "border-destructive/30" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                {msg.read ? <MailOpen className="h-5 w-5 text-muted-foreground mt-0.5" /> : <Mail className="h-5 w-5 text-primary mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{msg.subject}</p>
                    {msg.isEmergency && <Badge variant="destructive" className="text-xs">Emergency</Badge>}
                    {!msg.read && <Badge className="text-xs">Unread</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{msg.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">From: {msg.from} • {msg.timestamp}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-2">
          {sent.map((msg) => (
            <Card key={msg.id} className={msg.isEmergency ? "border-destructive/30" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <Send className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{msg.subject}</p>
                    {msg.isEmergency && <Badge variant="destructive" className="text-xs">Emergency</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{msg.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">To: {msg.to} • {msg.timestamp}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
