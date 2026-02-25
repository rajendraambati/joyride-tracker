
-- Buses table
CREATE TABLE public.buses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 40,
  driver_id UUID,
  route_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drivers table (links to profiles/user_roles for driver users)
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT NOT NULL,
  license_number TEXT NOT NULL DEFAULT '',
  bus_id UUID,
  duty_status TEXT NOT NULL DEFAULT 'off-duty' CHECK (duty_status IN ('on-duty', 'off-duty')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  standard TEXT NOT NULL DEFAULT '',
  parent_id UUID,
  bus_id UUID,
  pickup_location TEXT DEFAULT '',
  drop_location TEXT DEFAULT '',
  is_absent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  bus_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Route stops table
CREATE TABLE public.route_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  estimated_time TEXT DEFAULT '',
  stop_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign keys for buses
ALTER TABLE public.buses ADD CONSTRAINT fk_buses_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;
ALTER TABLE public.buses ADD CONSTRAINT fk_buses_route FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE SET NULL;

-- Add foreign keys for students
ALTER TABLE public.students ADD CONSTRAINT fk_students_bus FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE SET NULL;

-- Add foreign keys for drivers
ALTER TABLE public.drivers ADD CONSTRAINT fk_drivers_bus FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE SET NULL;

-- Add foreign keys for routes
ALTER TABLE public.routes ADD CONSTRAINT fk_routes_bus FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can read all
CREATE POLICY "Authenticated users can read buses" ON public.buses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read routes" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read route_stops" ON public.route_stops FOR SELECT TO authenticated USING (true);

-- RLS: Only admins can insert/update/delete
CREATE POLICY "Admins can insert buses" ON public.buses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update buses" ON public.buses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete buses" ON public.buses FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete drivers" ON public.drivers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update students" ON public.students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert routes" ON public.routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete routes" ON public.routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert route_stops" ON public.route_stops FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update route_stops" ON public.route_stops FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete route_stops" ON public.route_stops FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER set_buses_updated_at BEFORE UPDATE ON public.buses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
