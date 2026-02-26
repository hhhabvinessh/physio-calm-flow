-- Allow authenticated users to insert their own role (only if they don't already have one)
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
);