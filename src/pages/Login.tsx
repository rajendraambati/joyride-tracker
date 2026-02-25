import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bus, Shield, User, Truck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: "admin", label: "Administrator", icon: <Shield className="h-6 w-6" /> },
  { value: "parent", label: "Parent", icon: <User className="h-6 w-6" /> },
  { value: "driver", label: "Driver", icon: <Truck className="h-6 w-6" /> },
];

const redirectMap: Record<UserRole, string> = {
  admin: "/admin",
  parent: "/parent",
  driver: "/driver",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(redirectMap[user.role], { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please enter email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      toast({ title: "Login failed", description: result.error, variant: "destructive" });
    }
    // Redirect will happen via useEffect when user state updates
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Bus className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SchoolBus Tracker</h1>
          <p className="text-muted-foreground">Safe rides, happy parents</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@school.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>

              <div className="rounded-lg bg-muted p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground text-center">Admin Credentials</p>
                <div className="text-center text-[11px] text-muted-foreground">
                  <p>admin@school.com / admin123</p>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-1">Parent & driver accounts are created by the admin</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
