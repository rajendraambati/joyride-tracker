
-- Fix profiles SELECT policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix profiles INSERT policy
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

-- Fix profiles UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_roles SELECT policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_roles INSERT policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix buses SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read buses" ON public.buses;
CREATE POLICY "Authenticated users can read buses" ON public.buses
  FOR SELECT TO authenticated USING (true);

-- Fix buses mutation policies
DROP POLICY IF EXISTS "Admins can insert buses" ON public.buses;
CREATE POLICY "Admins can insert buses" ON public.buses
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update buses" ON public.buses;
CREATE POLICY "Admins can update buses" ON public.buses
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete buses" ON public.buses;
CREATE POLICY "Admins can delete buses" ON public.buses
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix drivers policies
DROP POLICY IF EXISTS "Authenticated users can read drivers" ON public.drivers;
CREATE POLICY "Authenticated users can read drivers" ON public.drivers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert drivers" ON public.drivers;
CREATE POLICY "Admins can insert drivers" ON public.drivers
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update drivers" ON public.drivers;
CREATE POLICY "Admins can update drivers" ON public.drivers
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete drivers" ON public.drivers;
CREATE POLICY "Admins can delete drivers" ON public.drivers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix students policies
DROP POLICY IF EXISTS "Authenticated users can read students" ON public.students;
CREATE POLICY "Authenticated users can read students" ON public.students
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students" ON public.students
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can update students" ON public.students
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students" ON public.students
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix routes policies
DROP POLICY IF EXISTS "Authenticated users can read routes" ON public.routes;
CREATE POLICY "Authenticated users can read routes" ON public.routes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert routes" ON public.routes;
CREATE POLICY "Admins can insert routes" ON public.routes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update routes" ON public.routes;
CREATE POLICY "Admins can update routes" ON public.routes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete routes" ON public.routes;
CREATE POLICY "Admins can delete routes" ON public.routes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix route_stops policies
DROP POLICY IF EXISTS "Authenticated users can read route_stops" ON public.route_stops;
CREATE POLICY "Authenticated users can read route_stops" ON public.route_stops
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert route_stops" ON public.route_stops;
CREATE POLICY "Admins can insert route_stops" ON public.route_stops
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update route_stops" ON public.route_stops;
CREATE POLICY "Admins can update route_stops" ON public.route_stops
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete route_stops" ON public.route_stops;
CREATE POLICY "Admins can delete route_stops" ON public.route_stops
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
