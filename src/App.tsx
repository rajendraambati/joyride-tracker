import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminFare from "./pages/admin/AdminFare";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

import ParentLayout from "./layouts/ParentLayout";
import ParentHome from "./pages/parent/ParentHome";
import ParentTrip from "./pages/parent/ParentTrip";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentMessages from "./pages/parent/ParentMessages";
import ParentProfile from "./pages/parent/ParentProfile";

import DriverLayout from "./layouts/DriverLayout";
import DriverHome from "./pages/driver/DriverHome";
import DriverTrip from "./pages/driver/DriverTrip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/buses" element={<AdminBuses />} />
                <Route path="/admin/drivers" element={<AdminDrivers />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/routes" element={<AdminRoutes />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/fare" element={<AdminFare />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Parent Routes */}
            <Route element={<ProtectedRoute allowedRole="parent" />}>
              <Route element={<ParentLayout />}>
                <Route path="/parent" element={<ParentHome />} />
                <Route path="/parent/trip" element={<ParentTrip />} />
                <Route path="/parent/children" element={<ParentChildren />} />
                <Route path="/parent/messages" element={<ParentMessages />} />
                <Route path="/parent/profile" element={<ParentProfile />} />
              </Route>
            </Route>

            {/* Driver Routes */}
            <Route element={<ProtectedRoute allowedRole="driver" />}>
              <Route element={<DriverLayout />}>
                <Route path="/driver" element={<DriverHome />} />
                <Route path="/driver/trip" element={<DriverTrip />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
