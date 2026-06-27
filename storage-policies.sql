-- Secure storage access: Only admins can read from verifications bucket
CREATE POLICY "Admins can view verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
