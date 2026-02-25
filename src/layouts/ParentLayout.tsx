import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, MapPin, Users, MessageSquare, User, LogOut, Bus } from "lucide-react";

const navItems = [
  { title: "Home", url: "/parent", icon: Home },
  { title: "Trip", url: "/parent/trip", icon: MapPin },
  { title: "Children", url: "/parent/children", icon: Users },
  { title: "Messages", url: "/parent/messages", icon: MessageSquare },
  { title: "Profile", url: "/parent/profile", icon: User },
];

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 border-b flex items-center px-4 gap-3 bg-card">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Bus className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-foreground flex-1">SchoolBus Tracker</h1>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="border-t bg-card flex justify-around py-2">
        {navItems.map((item) => {
          const active = item.url === "/parent"
            ? location.pathname === "/parent"
            : location.pathname.startsWith(item.url);
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
