-- Allow parents to update is_absent on their own children
CREATE POLICY "Parents can update own children absence"
ON public.students
FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());